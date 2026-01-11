"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const comment_repositry_1 = require("../../DB/repositry/comment.repositry ");
const comment_model_1 = require("../../DB/model/comment.model ");
const post_model_1 = require("../../DB/model/post.model");
const user_models_1 = require("../../DB/model/user.models");
const user_repository_1 = require("../../DB/repositry/user.repository");
const post_repositry_1 = require("../../DB/repositry/post.repositry");
const error_response_1 = require("../../utils/response/error.response");
const post_1 = require("../post");
class CommentServise {
    constructor() { }
    userModel = new user_repository_1.UserRepostoriy(user_models_1.UserModel);
    postModel = new post_repositry_1.PostRepositry(post_model_1.PostModel);
    commentModel = new comment_repositry_1.CommentRepositry(comment_model_1.CommentModel);
    createComment = async (req, res) => {
        const { postId } = req.params;
        const post = await this.postModel.find({
            filter: {
                _id: postId,
                allowComment: post_model_1.allowCommentEnum.allow,
                $or: (0, post_1.postAvailabiltey)(req)
            }
        });
        if (!post) {
            throw new error_response_1.NotFoundExption("fail to match result");
        }
        if (req.body.tags?.length &&
            (await this.userModel.find({
                filter: { _id: { $in: req.body.tags, $ne: req.user?._id } }
            })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundExption("some of the mienthined user are not esixt ");
        }
        let attachments = [];
        const [comment] = await this.commentModel.create({
            data: [
                {
                    postId,
                    ...req.body,
                    attachments,
                    createdBy: req.user?._id
                }
            ]
        }) || [];
        if (!comment) {
            throw new error_response_1.BadRequastExption("fail to create this comment");
        }
        return res.status(201).json({ message: "Done" });
    };
    replyOnComment = async (req, res) => {
        const { postId, commentId } = req.params;
        const comment = await this.commentModel.findOne({
            filter: {
                _id: commentId,
                postId,
            },
            options: {
                populate: [
                    {
                        path: "postId",
                        match: {
                            allowComment: post_model_1.allowCommentEnum.allow,
                            $or: (0, post_1.postAvailabiltey)(req)
                        }
                    }
                ]
            }
        });
        if (!comment?.postId) {
            throw new error_response_1.NotFoundExption("fail to match result");
        }
        if (req.body.tags?.length &&
            (await this.userModel.find({
                filter: { _id: { $in: req.body.tags, $ne: req.user?._id } }
            })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundExption("some of the mienthined user are not esixt ");
        }
        let attachments = [];
        const [reply] = await this.commentModel.create({
            data: [
                {
                    postId,
                    commentId,
                    ...req.body,
                    attachments,
                    createdBy: req.user?._id
                }
            ]
        }) || [];
        if (!reply) {
            throw new error_response_1.BadRequastExption("fail to create this comment");
        }
        return res.status(201).json({ message: "Done" });
    };
}
exports.default = new CommentServise();
