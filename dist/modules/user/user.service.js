"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = require("../../DB/repositry/user.repository");
const user_models_1 = require("../../DB/model/user.models");
const token_secuirty_1 = require("../../utils/secuirty/token.secuirty");
const post_repositry_1 = require("../../DB/repositry/post.repositry");
const post_model_1 = require("../../DB/model/post.model");
const error_response_1 = require("../../utils/response/error.response");
const frindeRequst_model_1 = require("../../DB/model/frindeRequst.model ");
const friendRequst_repositry_1 = require("../../DB/repositry/friendRequst.repositry ");
const caht_repositry_1 = require("../../DB/repositry/caht.repositry");
const chat_model_1 = require("../../DB/model/chat.model");
const sucess_response_1 = require("../../utils/response/sucess.response");
class UserService {
    chatModel = new caht_repositry_1.ChatRepositry(chat_model_1.ChatModel);
    userModel = new user_repository_1.UserRepostoriy(user_models_1.UserModel);
    postModel = new post_repositry_1.PostRepositry(post_model_1.PostModel);
    friendRequstModel = new friendRequst_repositry_1.FriendRequstRepositry(frindeRequst_model_1.FriendRequstModel);
    constructor() { }
    profile = async (req, res) => {
        const user = await this.userModel.findById({
            id: req.user?._id,
            options: {
                populate: [
                    {
                        path: "frindes",
                        select: "firstName lastName email gender",
                    },
                ],
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundExption("fail to find user");
        }
        const groups = await this.chatModel.find({
            filter: {
                participants: { $in: req.user?._id },
                group: { $exists: true }
            }
        });
        return (0, sucess_response_1.successResponse)({ res, data: { user, groups } });
    };
    dashbord = async (req, res) => {
        const result = await Promise.allSettled([
            this.userModel.find({ filter: {} }),
            this.postModel.find({ filter: {} }),
        ]);
        return res.json({
            message: "done",
            data: {
                result,
            },
        });
    };
    changeRole = async (req, res) => {
        const { userId } = req.params;
        const { role } = req.body;
        const denyRole = [role, user_models_1.RoleEnum.superAdmin];
        if (req.user?.role === user_models_1.RoleEnum.admin) {
            denyRole.push(user_models_1.RoleEnum.admin);
        }
        const user = await this.userModel.findOneAndUpdate({
            filter: {
                _id: userId,
                role: { $nin: denyRole },
            },
            update: {
                role,
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundExption("fail to match result");
        }
        return res.json({
            message: "done",
        });
    };
    sendFriendRequest = async (req, res) => {
        const { userId } = req.params;
        const checkFriendREquestExist = await this.friendRequstModel.findOne({
            filter: {
                createdBy: { $in: [req.user?._id, userId] },
                sendTo: { $in: [req.user?._id, userId] },
            },
        });
        if (checkFriendREquestExist) {
            throw new error_response_1.ConfligtExptions("FriendRequest Already Exist ");
        }
        const user = await this.userModel.findOne({ filter: { _id: userId } });
        if (!user) {
            throw new error_response_1.NotFoundExption("invailed recepeant");
        }
        const [friendRequest] = (await this.friendRequstModel.create({
            data: [
                {
                    createdBy: req.user?._id,
                    sendTo: userId,
                },
            ],
        })) || [];
        if (!friendRequest) {
            throw new error_response_1.BadRequastExption("someThing Went Wrong");
        }
        return res.status(201).json({
            message: "done",
        });
    };
    acceptFriendRequest = async (req, res) => {
        const { requestId } = req.params;
        const friendRequest = await this.friendRequstModel.findOneAndUpdate({
            filter: {
                _id: requestId,
                sendTo: req.user?._id,
                AccptedAt: { $exists: false },
            },
            update: {
                AccptedAt: new Date(),
            },
        });
        if (!friendRequest) {
            throw new error_response_1.NotFoundExption("fail to matching result ");
        }
        await Promise.all([
            await this.userModel.updateOne({
                filter: { _id: friendRequest.createdBy },
                update: {
                    $addToSet: { frindes: friendRequest.sendTo },
                },
            }),
            await this.userModel.updateOne({
                filter: { _id: friendRequest.sendTo },
                update: {
                    $addToSet: { frindes: friendRequest.createdBy },
                },
            }),
        ]);
        return res.status(200).json({
            message: "done",
        });
    };
    logout = async (req, res) => {
        const { flag } = req.body;
        let statusCode = 200;
        const update = {};
        switch (flag) {
            case token_secuirty_1.logoutEnum.all:
                update.chengeCredantialTime = new Date();
                break;
            default:
                await (0, token_secuirty_1.createRevokToken)(req.decoded);
                statusCode = 201;
                break;
        }
        await this.userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update,
        });
        return res.json({
            message: "done",
            data: {
                user: req.user,
                decoded: req.decoded,
            },
        });
    };
    refreshToken = async (req, res) => {
        const creadintail = await (0, token_secuirty_1.createLoginCredaintal)(req.user);
        await (0, token_secuirty_1.createRevokToken)(req.decoded);
        return res.status(201).json({ message: "Done", data: { creadintail } });
    };
}
exports.default = new UserService();
