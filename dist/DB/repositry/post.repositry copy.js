"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepositry = void 0;
const database_repository_1 = require("./database.repository");
const comment_repositry_1 = require("./comment.repositry ");
const comment_model_1 = require("../model/comment.model ");
class PostRepositry extends database_repository_1.DatabaseRebosatory {
    model;
    commentModel = new comment_repositry_1.CommentRepositry(comment_model_1.CommentModel);
    constructor(model) {
        super(model);
        this.model = model;
    }
    async findcursor({ filter, select, options, }) {
        let result = [];
        const cursor = this.model.find(filter || {})
            .select(select || "")
            .populate(options?.populate).cursor();
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            const comment = await this.commentModel.find({ filter: { postId: doc._id, commentId: { $exists: false } } });
            result.push({ post: doc, comment });
        }
        return result;
    }
}
exports.PostRepositry = PostRepositry;
