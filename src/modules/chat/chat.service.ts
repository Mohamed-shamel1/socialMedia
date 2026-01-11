import { Request, Response } from "express";
import {
  ICreateChatingGroupParamsDto,
  IGetChatGroupParamsDto,
  IGetChatParamsDto,
  IGetChatQueryParamsDto,
  IJoinRoomDto,
  ISayHiDto,
  ISendGroupMessageDto,
  ISendMessageDto,
} from "./chat.dto";
import { ChatRepositry } from "../../DB/repositry/caht.repositry";
import { ChatModel } from "../../DB/model/chat.model";
import { Types } from "mongoose";
import {
  BadRequastExption,
  NotFoundExption,
} from "../../utils/response/error.response";
import { IGetChatResponse } from "./chat.enitetis";
import { UserRepostoriy } from "../../DB/repositry/user.repository";
import { UserModel } from "../../DB/model/user.models";
import { successResponse } from "../../utils/response/sucess.response";
import { connectedSocket } from "../getwaye";
import { v4 as uuid } from "uuid";

export class ChatServiec {
  private chatModel: ChatRepositry = new ChatRepositry(ChatModel);
  private userModel: UserRepostoriy = new UserRepostoriy(UserModel);
  constructor() {}

  getChat = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as IGetChatParamsDto;
    const { page, size }: IGetChatQueryParamsDto = req.query;
    console.log({ userId });
    const chat = await this.chatModel.findOneChat({
      filter: {
        participants: {
          $all: [
            req.user?._id as Types.ObjectId,
            Types.ObjectId.createFromHexString(userId),
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
      throw new BadRequastExption("Fail to matching chatting instans");
    }

    return successResponse<IGetChatResponse>({ res, data: { chat } });
  };
  getChatingGroup = async (req: Request, res: Response): Promise<Response> => {
    const { groupId } = req.params as IGetChatGroupParamsDto;
    const { page, size }: IGetChatQueryParamsDto = req.query;
    console.log({ groupId });
    const chat = await this.chatModel.findOneChat({
      filter: {
        _id:Types.ObjectId.createFromHexString(groupId),
        participants: { $in:req.user?._id as Types.ObjectId},
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
      throw new BadRequastExption("Fail to matching chatting instans");
    }

    return successResponse<IGetChatResponse>({ res, data: { chat } });
  };
  createChatingGroup = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { group, participants }: ICreateChatingGroupParamsDto = req.body;
    const dbparticipants = participants.map((participants: string) => {
      return Types.ObjectId.createFromHexString(participants);
    });

    const user = await this.userModel.find({
      filter: {
        _id: { $in: dbparticipants },
        frindes: { $in: req.user?._id as Types.ObjectId },
      },
    });
    if (participants.length != user.length) {
      throw new NotFoundExption("someone or all recapeant is invailed");
    }
    let group_Image: string | undefined = undefined;

    const roomId = group.replaceAll(/\s+/g, "_") + "_" + uuid();
    dbparticipants.push(req.user?._id as Types.ObjectId)
    const [chat] = await this.chatModel.create({
      data: [
        {
          createdBy: req.user?._id as Types.ObjectId,
          group,
          roomId,
          // group_Image: group_Image as string,
          messages: [],
          participants: dbparticipants,
        },
      ],
    })||[];
    if(!chat){
      throw new BadRequastExption("fail to genareate this group")
    }

    return successResponse({ res,statusCode:201 ,data: {chat} });
  };
  sayHi = ({ message, socket, callback, io }: ISayHiDto) => {
    try {
      console.log({ message });
      if (callback) {
        callback("BE to FE");
      }
    } catch (error) {
      return socket.emit("custom_error", error);
    }
  };

  sendMessage = async ({ content, sendTo, socket, io }: ISendMessageDto) => {
    try {
      const createdBy = socket.credential?.user._id as Types.ObjectId;
      console.log({ content, sendTo, createdBy });
      const user = await this.userModel.findOne({
        filter: {
          _id: Types.ObjectId.createFromHexString(sendTo),
          frindes: { $in: createdBy },
        },
      });
      if (!user) {
        throw new NotFoundExption("invailed recapeint friend");
      }
      const chat = await this.chatModel.findOneAndUpdate({
        filter: {
          participants: {
            $all: [
              createdBy as Types.ObjectId,
              Types.ObjectId.createFromHexString(sendTo),
            ],
          },
          group: { $exists: false },
        },
        update: {
          $addToSet: { messages: { content, createdBy } },
        },
      });
      if (!chat) {
        const [newChat] =
          (await this.chatModel.create({
            data: [
              {
                createdBy,
                messages: [{ content, createdBy }],
                participants: [
                  createdBy as Types.ObjectId,
                  Types.ObjectId.createFromHexString(sendTo),
                ],
              },
            ],
          })) || [];
        if (!newChat) {
          throw new BadRequastExption("Fail To Create Chat");
        }
      }
      io?.to(
        connectedSocket.get(createdBy.toString() as string) as string[]
      ).emit("successMessage", { content });
      io?.to(connectedSocket.get(sendTo) as string[]).emit("newMessage", {
        content,
        from: socket.credential?.user,
      });
    } catch (error) {
      return socket.emit("custom_error", error);
    }
  };
  sendGroupMessage = async ({ content, groupId, socket, io }: ISendGroupMessageDto) => {
    try {
      const createdBy = socket.credential?.user._id as Types.ObjectId;
     
      const chat = await this.chatModel.findOneAndUpdate({
        filter: {
          _id:Types.ObjectId.createFromHexString(groupId),
          participants: {$in:createdBy as Types.ObjectId},
          group: { $exists: true },
        },
        update: {
          $addToSet: { messages: { content, createdBy } },
        },
      });
      if (!chat) {
      throw new BadRequastExption("fail to find chat room ")
      }
      io?.to(
        connectedSocket.get(createdBy.toString() as string) as string[]
      ).emit("successMessage", { content });
      socket?.to(chat.roomId as string).emit("newMessage", {
        content,
        from: socket.credential?.user,
        groupId,
      });
    } catch (error) {
      return socket.emit("custom_error", error);
    }
  };
  joinRoom = async ({ roomId, socket, io }: IJoinRoomDto) => {
    try {
      const chat=await this.chatModel.findOne({
        filter:{
          roomId,
          group:{$exists:true},
          participants:{$in:socket.credential?.user._id}
        }
      })
      if(!chat){
        throw new NotFoundExption("fail to find matching room")
      }
      socket.join(chat.roomId as string)
      console.log({join:roomId});
      
    } catch (error) {
      return socket.emit("custom_error", error);
    }
  };
}
