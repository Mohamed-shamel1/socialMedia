import { Request, Response } from "express";
import { ILogoutDto } from "./user.dto";
import { UserRepostoriy } from "../../DB/repositry/user.repository";
import {
  HUserDocument,
  IUser,
  RoleEnum,
  UserModel,
} from "../../DB/model/user.models";
import { Types, UpdateQuery } from "mongoose";
import {
  createLoginCredaintal,
  createRevokToken,
  logoutEnum,
} from "../../utils/secuirty/token.secuirty";

import { JwtPayload } from "jsonwebtoken";
import { PostRepositry } from "../../DB/repositry/post.repositry";
import { PostModel } from "../../DB/model/post.model";
import {
  BadRequastExption,
  ConfligtExptions,
  NotFoundExption,
} from "../../utils/response/error.response";
import { FriendRequstModel } from "../../DB/model/frindeRequst.model ";
import { FriendRequstRepositry } from "../../DB/repositry/friendRequst.repositry ";
import { ChatRepositry } from "../../DB/repositry/caht.repositry";
import { ChatModel } from "../../DB/model/chat.model";
import { successResponse } from "../../utils/response/sucess.response";
import { IUserProfileResponse } from "./user.enitete";

class UserService {
  private chatModel:ChatRepositry = new ChatRepositry(ChatModel);
  private userModel:UserRepostoriy = new UserRepostoriy(UserModel);
  private postModel:PostRepositry = new PostRepositry(PostModel);
  private friendRequstModel = new FriendRequstRepositry(FriendRequstModel);
  constructor() {}
  profile = async (req: Request, res: Response): Promise<Response> => {
    const user = await this.userModel.findById({
      id: req.user?._id as Types.ObjectId,
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
      throw new NotFoundExption("fail to find user");
    }
    const groups=await this.chatModel.find({
      filter:{
        participants:{$in:req.user?._id as Types.ObjectId},
        group:{$exists:true}
      }
    })

    return successResponse<IUserProfileResponse>({res,data:{user,groups}})
  };
  dashbord = async (req: Request, res: Response): Promise<Response> => {
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
  changeRole = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as unknown as { userId: Types.ObjectId };
    const { role }: { role: RoleEnum } = req.body;
    const denyRole: RoleEnum[] = [role, RoleEnum.superAdmin];
    if (req.user?.role === RoleEnum.admin) {
      denyRole.push(RoleEnum.admin);
    }
    const user = await this.userModel.findOneAndUpdate({
      filter: {
        _id: userId as Types.ObjectId,
        role: { $nin: denyRole },
      },
      update: {
        role,
      },
    });
    if (!user) {
      throw new NotFoundExption("fail to match result");
    }
    return res.json({
      message: "done",
    });
  };
  sendFriendRequest = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { userId } = req.params as unknown as { userId: Types.ObjectId };
    const checkFriendREquestExist = await this.friendRequstModel.findOne({
      filter: {
        createdBy: { $in: [req.user?._id, userId] },
        sendTo: { $in: [req.user?._id, userId] },
      },
    });
    if (checkFriendREquestExist) {
      throw new ConfligtExptions("FriendRequest Already Exist ");
    }
    const user = await this.userModel.findOne({ filter: { _id: userId } });
    if (!user) {
      throw new NotFoundExption("invailed recepeant");
    }
    const [friendRequest] =
      (await this.friendRequstModel.create({
        data: [
          {
            createdBy: req.user?._id as Types.ObjectId,
            sendTo: userId,
          },
        ],
      })) || [];

    if (!friendRequest) {
      throw new BadRequastExption("someThing Went Wrong");
    }
    return res.status(201).json({
      message: "done",
    });
  };
  acceptFriendRequest = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { requestId } = req.params as unknown as {
      requestId: Types.ObjectId;
    };
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
      throw new NotFoundExption("fail to matching result ");
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

  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: ILogoutDto = req.body;
    let statusCode: number = 200;
    const update: UpdateQuery<IUser> = {};

    switch (flag) {
      case logoutEnum.all:
        update.chengeCredantialTime = new Date();

        break;

      default:
        await createRevokToken(req.decoded as JwtPayload);
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

  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const creadintail = await createLoginCredaintal(req.user as HUserDocument);
    await createRevokToken(req.decoded as JwtPayload);
    return res.status(201).json({ message: "Done", data: { creadintail } });
  };
}
export default new UserService();
