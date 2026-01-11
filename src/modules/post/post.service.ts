import { Request, Response } from "express";
import { UserRepostoriy } from "../../DB/repositry/user.repository";
import { UserModel } from "../../DB/model/user.models";
import { PostRepositry } from "../../DB/repositry/post.repositry";
import {
  avielablityEnum,
  HPostDocument,
  likeActionEnum,
  PostModel,
} from "../../DB/model/post.model";
import {
  BadRequastExption,
  NotFoundExption,
} from "../../utils/response/error.response";
import { v4 as uuid } from "uuid";
import { LikePOstQueryInputDto } from "./post.dto";
import { Types, UpdateQuery } from "mongoose";
import { connectedSocket, getIo } from "../getwaye";

export const postAvailabiltey = (req: Request) => {
  return [
    { avielablity: avielablityEnum.public },
    { avielablity: avielablityEnum.onlyMe, createdBy: req.user?._id },
    {
      avielablity: avielablityEnum.frindes,
      createdBy: { $in: [...(req.user?.frindes || []), req.user?._id] },
    },
    {
      avielablity: { $ne: avielablityEnum.onlyMe },
      tags: { $in: req.user?._id },
    },
  ];
};
class PostService {
  private userModel = new UserRepostoriy(UserModel);
  private postModel = new PostRepositry(PostModel);
  constructor() {}
  updatePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as unknown as { postId: Types.ObjectId };
    const post = await this.postModel.findOne({
      filter: {
        _id: postId,
        createdBy: req.user?._id,
      },
    });
    if (!post) {
      throw new NotFoundExption("fail to match result");
    }

    if (
      req.body.tags?.length &&
      (
        await this.userModel.find({
          filter: { _id: { $in: req.body.tags, $ne: req.user?._id } },
        })
      ).length !== req.body.tags.length
    ) {
      throw new NotFoundExption("some of the mienthined user are not esixt ");
    }

    let attachments: string[] = [];

    const updatedPost = await this.postModel.updateOne({
      filter: { _id: post._id },
      update: [
        {
          $set: {
            conntent: req.body.conntent,
            allowComment: req.body.allowComment || post.allowComment,
            avielablity: req.body.avielablity || post.avielablity,
            attachments: {
              $setUnion: [
                {
                  $setDifference: [
                    "$attachments",
                    req.body.removedAtachments || [],
                  ],
                },
                attachments,
              ],
            },
            tags: {
              $setUnion: [
                {
                  $setDifference: [
                    "$tags",
                    (req.body.removedTags || []).map((tag: string) => {
                      return Types.ObjectId.createFromHexString(tag);
                    }),
                  ],
                },
                (req.body.tags || []).map((tag: string) => {
                  return Types.ObjectId.createFromHexString(tag);
                }),
              ],
            },
          },
        },
      ],
    });

    if (!updatedPost) {
      throw new BadRequastExption("fail to generate this post update");
    }

    return res.status(201).json({ message: "Done" });
  };
  createPost = async (req: Request, res: Response): Promise<Response> => {
    if (
      req.body.tags?.length &&
      (
        await this.userModel.find({
          filter: { _id: { $in: req.body.tags, $ne: req.user?._id } },
        })
      ).length !== req.body.tags.length
    ) {
      throw new NotFoundExption("some of the mienthined user are not esixt ");
    }

    let attachments: string[] = [];
    let assetsFolderId: string = uuid();

    const [post] =
      (await this.postModel.create({
        data: [
          {
            ...req.body,
            attachments,
            assetsFolderId,
            createdBy: req.user?._id,
          },
        ],
      })) || [];

    if (!post) {
      throw new BadRequastExption("fail to create this post");
    }

    return res.status(201).json({ message: "Done" });
  };

  likePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as { postId: string };
    const { action } = req.query as LikePOstQueryInputDto;
    let update: UpdateQuery<HPostDocument> = {
      $addToSet: { likes: req.user?._id },
    };

    if (action === likeActionEnum.unlike) {
      update = { $pull: { likes: req.user?._id } };
    }
    const post = await this.postModel.findOneAndUpdate({
      filter: {
        _id: postId,
        $or: postAvailabiltey(req),
      },
      update,
    });
    if (!post) {
      throw new NotFoundExption("invailed postId or post not found");
    }
    if(action !== likeActionEnum.unlike){
      getIo().to(connectedSocket.get(post.createdBy.toString() )as string[]).emit("likePost",{postId,userId:req.user?._id})
    }
    return res.status(200).json({ message: "Done" });
  };

  postList = async (req: Request, res: Response): Promise<Response> => {
    let { page, size } = req.query as unknown as {
      page: number;
      size: number;
    };

    const posts = await this.postModel.pagenate({
      filter: {
        $or: postAvailabiltey(req),
      },
      options: {
        populate: [
          {
            path: "comments",
            match: {
              commentId: {
                $exists: false,
              },
              freezedAt: { $exist: false },
            },
            populate: [
              {
                path: "reply",
                match: {
                  commentId: {
                    $exists: false,
                  },
                  freezedAt: { $exist: false },
                },
                populate: [
                  {
                    path: "reply",
                    match: {
                      commentId: {
                        $exists: false,
                      },
                      freezedAt: { $exist: false },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      page,
      size,
    });

    console.log({ s: posts.length });
    // const posts =await this.postModel.findcursor({
    //      filter:{
    //         $or:postAvailabiltey(req)
    //     },
    // })

    return res.status(201).json({ message: "Done", data: { posts } });
  };
}
export const postService = new PostService();
