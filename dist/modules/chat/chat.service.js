"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatServiec = void 0;
const caht_repositry_1 = require("../../DB/repositry/caht.repositry");
const chat_model_1 = require("../../DB/model/chat.model");
const mongoose_1 = require("mongoose");
const error_response_1 = require("../../utils/response/error.response");
const user_repository_1 = require("../../DB/repositry/user.repository");
const user_models_1 = require("../../DB/model/user.models");
const sucess_response_1 = require("../../utils/response/sucess.response");
const getwaye_1 = require("../getwaye");
const uuid_1 = require("uuid");
class ChatServiec {
    chatModel = new caht_repositry_1.ChatRepositry(chat_model_1.ChatModel);
    userModel = new user_repository_1.UserRepostoriy(user_models_1.UserModel);
    constructor() { }
    getChat = async (req, res) => {
        const { userId } = req.params;
        const { page, size } = req.query;
        console.log({ userId });
        const chat = await this.chatModel.findOneChat({
            filter: {
                participants: {
                    $all: [
                        req.user?._id,
                        mongoose_1.Types.ObjectId.createFromHexString(userId),
                    ],
                },
                group: { $exists: false },
            },
            options: {
                populate: [
                    {
                        path: "participants",
                        select: "firstName lastName email gender",
                    },
                ],
            },
            page,
            size,
        });
        if (!chat) {
            throw new error_response_1.BadRequastExption("Fail to matching chatting instans");
        }
        return (0, sucess_response_1.successResponse)({ res, data: { chat } });
    };
    getChatingGroup = async (req, res) => {
        const { groupId } = req.params;
        const { page, size } = req.query;
        console.log({ groupId });
        const chat = await this.chatModel.findOneChat({
            filter: {
                _id: mongoose_1.Types.ObjectId.createFromHexString(groupId),
                participants: { $in: req.user?._id },
                group: { $exists: true },
            },
            options: {
                populate: [
                    {
                        path: "messages.createdBy",
                        select: "firstName lastName email gender",
                    },
                ],
            },
            page,
            size,
        });
        if (!chat) {
            throw new error_response_1.BadRequastExption("Fail to matching chatting instans");
        }
        return (0, sucess_response_1.successResponse)({ res, data: { chat } });
    };
    createChatingGroup = async (req, res) => {
        const { group, participants } = req.body;
        const dbparticipants = participants.map((participants) => {
            return mongoose_1.Types.ObjectId.createFromHexString(participants);
        });
        const user = await this.userModel.find({
            filter: {
                _id: { $in: dbparticipants },
                frindes: { $in: req.user?._id },
            },
        });
        if (participants.length != user.length) {
            throw new error_response_1.NotFoundExption("someone or all recapeant is invailed");
        }
        let group_Image = undefined;
        const roomId = group.replaceAll(/\s+/g, "_") + "_" + (0, uuid_1.v4)();
        dbparticipants.push(req.user?._id);
        const [chat] = await this.chatModel.create({
            data: [
                {
                    createdBy: req.user?._id,
                    group,
                    roomId,
                    messages: [],
                    participants: dbparticipants,
                },
            ],
        }) || [];
        if (!chat) {
            throw new error_response_1.BadRequastExption("fail to genareate this group");
        }
        return (0, sucess_response_1.successResponse)({ res, statusCode: 201, data: { chat } });
    };
    sayHi = ({ message, socket, callback, io }) => {
        try {
            console.log({ message });
            if (callback) {
                callback("BE to FE");
            }
        }
        catch (error) {
            return socket.emit("custom_error", error);
        }
    };
    sendMessage = async ({ content, sendTo, socket, io }) => {
        try {
            const createdBy = socket.credential?.user._id;
            console.log({ content, sendTo, createdBy });
            const user = await this.userModel.findOne({
                filter: {
                    _id: mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                    frindes: { $in: createdBy },
                },
            });
            if (!user) {
                throw new error_response_1.NotFoundExption("invailed recapeint friend");
            }
            const chat = await this.chatModel.findOneAndUpdate({
                filter: {
                    participants: {
                        $all: [
                            createdBy,
                            mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                        ],
                    },
                    group: { $exists: false },
                },
                update: {
                    $addToSet: { messages: { content, createdBy } },
                },
            });
            if (!chat) {
                const [newChat] = (await this.chatModel.create({
                    data: [
                        {
                            createdBy,
                            messages: [{ content, createdBy }],
                            participants: [
                                createdBy,
                                mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                            ],
                        },
                    ],
                })) || [];
                if (!newChat) {
                    throw new error_response_1.BadRequastExption("Fail To Create Chat");
                }
            }
            io?.to(getwaye_1.connectedSocket.get(createdBy.toString())).emit("successMessage", { content });
            io?.to(getwaye_1.connectedSocket.get(sendTo)).emit("newMessage", {
                content,
                from: socket.credential?.user,
            });
        }
        catch (error) {
            return socket.emit("custom_error", error);
        }
    };
    sendGroupMessage = async ({ content, groupId, socket, io }) => {
        try {
            const createdBy = socket.credential?.user._id;
            const chat = await this.chatModel.findOneAndUpdate({
                filter: {
                    _id: mongoose_1.Types.ObjectId.createFromHexString(groupId),
                    participants: { $in: createdBy },
                    group: { $exists: true },
                },
                update: {
                    $addToSet: { messages: { content, createdBy } },
                },
            });
            if (!chat) {
                throw new error_response_1.BadRequastExption("fail to find chat room ");
            }
            io?.to(getwaye_1.connectedSocket.get(createdBy.toString())).emit("successMessage", { content });
            socket?.to(chat.roomId).emit("newMessage", {
                content,
                from: socket.credential?.user,
                groupId,
            });
        }
        catch (error) {
            return socket.emit("custom_error", error);
        }
    };
    joinRoom = async ({ roomId, socket, io }) => {
        try {
            const chat = await this.chatModel.findOne({
                filter: {
                    roomId,
                    group: { $exists: true },
                    participants: { $in: socket.credential?.user._id }
                }
            });
            if (!chat) {
                throw new error_response_1.NotFoundExption("fail to find matching room");
            }
            socket.join(chat.roomId);
            console.log({ join: roomId });
        }
        catch (error) {
            return socket.emit("custom_error", error);
        }
    };
}
exports.ChatServiec = ChatServiec;
