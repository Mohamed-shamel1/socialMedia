"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = exports.postSchema = exports.likeActionEnum = exports.avielablityEnum = exports.allowCommentEnum = void 0;
const mongoose_1 = require("mongoose");
var allowCommentEnum;
(function (allowCommentEnum) {
    allowCommentEnum["allow"] = "allow";
    allowCommentEnum["dnay"] = "dnay";
})(allowCommentEnum || (exports.allowCommentEnum = allowCommentEnum = {}));
var avielablityEnum;
(function (avielablityEnum) {
    avielablityEnum["public"] = "public";
    avielablityEnum["frindes"] = "frindes";
    avielablityEnum["onlyMe"] = "onlyMe";
})(avielablityEnum || (exports.avielablityEnum = avielablityEnum = {}));
var likeActionEnum;
(function (likeActionEnum) {
    likeActionEnum["like"] = "like";
    likeActionEnum["unlike"] = "unlike";
})(likeActionEnum || (exports.likeActionEnum = likeActionEnum = {}));
exports.postSchema = new mongoose_1.Schema({
    content: {
        type: String,
        minlength: 2,
        maxlength: 5000000,
        required: function () {
            return !this.atachments?.length;
        },
    },
    atachments: String,
    removedAtachments: [String],
    asseatFolderId: { type: String },
    avielablity: { type: String, enum: avielablityEnum, default: avielablityEnum.public },
    allowComment: { type: String, enum: allowCommentEnum, defaultl: allowCommentEnum.allow },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    freaazedAt: Date,
    freaazedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    restoredAt: Date,
    restoredBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, {
    timestamps: true, strictQuery: true,
    toObject: { virtuals: true }, toJSON: { virtuals: true }
});
exports.postSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
exports.postSchema.pre(["find", "findOne", "countDocuments"], function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
exports.postSchema.virtual("comments", {
    localField: "_id",
    foreignField: "postId",
    ref: "Comment",
    justOne: true
});
exports.PostModel = mongoose_1.models.Post || (0, mongoose_1.model)("post", exports.postSchema);
