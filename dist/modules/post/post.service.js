"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.postAvailabiltey = void 0;
const user_repository_1 = require("../../DB/repositry/user.repository");
const user_models_1 = require("../../DB/model/user.models");
const post_repositry_1 = require("../../DB/repositry/post.repositry");
const post_model_1 = require("../../DB/model/post.model");
const error_response_1 = require("../../utils/response/error.response");
const uuid_1 = require("uuid");
const mongoose_1 = require("mongoose");
const getwaye_1 = require("../getwaye");
const postAvailabiltey = (req) => {
    return [
        { avielablity: post_model_1.avielablityEnum.public },
        { avielablity: post_model_1.avielablityEnum.onlyMe, createdBy: req.user?._id },
        {
            avielablity: post_model_1.avielablityEnum.frindes,
            createdBy: { $in: [...(req.user?.frindes || []), req.user?._id] },
        },
        {
            avielablity: { $ne: post_model_1.avielablityEnum.onlyMe },
            tags: { $in: req.user?._id },
        },
    ];
};
exports.postAvailabiltey = postAvailabiltey;
class PostService {
    userModel = new user_repository_1.UserRepostoriy(user_models_1.UserModel);
    postModel = new post_repositry_1.PostRepositry(post_model_1.PostModel);
    constructor() { }
    updatePost = async (req, res) => {
        const { postId } = req.params;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: req.user?._id,
            },
        });
        if (!post) {
            throw new error_response_1.NotFoundExption("fail to match result");
        }
        if (req.body.tags?.length &&
            (await this.userModel.find({
                filter: { _id: { $in: req.body.tags, $ne: req.user?._id } },
            })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundExption("some of the mienthined user are not esixt ");
        }
        let attachments = [];
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
                                        (req.body.removedTags || []).map((tag) => {
                                            return mongoose_1.Types.ObjectId.createFromHexString(tag);
                                        }),
                                    ],
                                },
                                (req.body.tags || []).map((tag) => {
                                    return mongoose_1.Types.ObjectId.createFromHexString(tag);
                                }),
                            ],
                        },
                    },
                },
            ],
        });
        if (!updatedPost) {
            throw new error_response_1.BadRequastExption("fail to generate this post update");
        }
        return res.status(201).json({ message: "Done" });
    };
    createPost = async (req, res) => {
        if (req.body.tags?.length &&
            (await this.userModel.find({
                filter: { _id: { $in: req.body.tags, $ne: req.user?._id } },
            })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundExption("some of the mienthined user are not esixt ");
        }
        let attachments = [];
        let assetsFolderId = (0, uuid_1.v4)();
        const [post] = (await this.postModel.create({
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
            throw new error_response_1.BadRequastExption("fail to create this post");
        }
        return res.status(201).json({ message: "Done" });
    };
    likePost = async (req, res) => {
        const { postId } = req.params;
        const { action } = req.query;
        let update = {
            $addToSet: { likes: req.user?._id },
        };
        if (action === post_model_1.likeActionEnum.unlike) {
            update = { $pull: { likes: req.user?._id } };
        }
        const post = await this.postModel.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: (0, exports.postAvailabiltey)(req),
            },
            update,
        });
        if (!post) {
            throw new error_response_1.NotFoundExption("invailed postId or post not found");
        }
        if (action !== post_model_1.likeActionEnum.unlike) {
            (0, getwaye_1.getIo)().to(getwaye_1.connectedSocket.get(post.createdBy.toString())).emit("likePost", { postId, userId: req.user?._id });
        }
        return res.status(200).json({ message: "Done" });
    };
    postList = async (req, res) => {
        let { page, size } = req.query;
        const posts = await this.postModel.pagenate({
            filter: {
                $or: (0, exports.postAvailabiltey)(req),
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
        return res.status(201).json({ message: "Done", data: { posts } });
    };
}
exports.postService = new PostService();
