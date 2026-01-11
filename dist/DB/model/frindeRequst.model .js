"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequstModel = exports.friendRequstSchema = void 0;
const mongoose_1 = require("mongoose");
exports.friendRequstSchema = new mongoose_1.Schema({
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    sendTo: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    AccptedAt: Date,
}, {
    timestamps: true, strictQuery: true,
});
exports.friendRequstSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
exports.friendRequstSchema.pre(["find", "findOne", "countDocuments"], function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
exports.FriendRequstModel = mongoose_1.models.FriendRequst || (0, mongoose_1.model)("FriendRequst", exports.friendRequstSchema);
