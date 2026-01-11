"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePost = exports.createPost = exports.updatePost = void 0;
const zod_1 = require("zod");
const post_model_1 = require("../../DB/model/post.model");
const validation_midelware_1 = require("../../midelware/validation.midelware");
exports.updatePost = {
    params: zod_1.z.strictObject({
        postId: validation_midelware_1.genralField.id
    }),
    body: zod_1.z.strictObject({
        conntent: zod_1.z.string().min(2).max(5000000).optional(),
        atachments: zod_1.z.array(zod_1.z.any()).max(2).optional(),
        avielablity: zod_1.z.enum(post_model_1.avielablityEnum).optional(),
        allowComment: zod_1.z.enum(post_model_1.allowCommentEnum).optional(),
        tags: zod_1.z.array(validation_midelware_1.genralField.id).max(10).optional(),
        removeTags: zod_1.z.array(validation_midelware_1.genralField.id).max(10).optional(),
    }).superRefine((data, ctx) => {
        if (!Object.values(data)?.length) {
            ctx.addIssue({
                code: "custom",
                message: "all fileds is empty "
            });
        }
        if (data.removeTags?.length && data.tags?.length !== [...new Set(data.removeTags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["removeTags"],
                message: "some user remove tages"
            });
        }
    })
};
exports.createPost = {
    body: zod_1.z.strictObject({
        conntent: zod_1.z.string().min(2).max(5000000).optional(),
        atachments: zod_1.z.array(zod_1.z.any()).max(2).optional(),
        avielablity: zod_1.z.enum(post_model_1.avielablityEnum).default(post_model_1.avielablityEnum.public),
        allowComment: zod_1.z.enum(post_model_1.allowCommentEnum).default(post_model_1.allowCommentEnum.allow),
        tags: zod_1.z.array(validation_midelware_1.genralField.id).max(10).optional(),
    }).superRefine((data, ctx) => {
        if (!data.conntent && !data.atachments?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["conntent"],
                message: "sorry you cant add post without content and atachment "
            });
        }
        if (data.tags?.length && data.tags?.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["tags"],
                message: "Duplaceted taged user"
            });
        }
    })
};
exports.likePost = {
    params: zod_1.z.strictObject({
        postId: validation_midelware_1.genralField.id
    }),
    query: zod_1.z.strictObject({
        action: zod_1.z.enum(post_model_1.likeActionEnum).default(post_model_1.likeActionEnum.like)
    })
};
