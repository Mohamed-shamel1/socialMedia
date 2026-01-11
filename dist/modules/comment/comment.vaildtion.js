"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyOnComment = exports.createComment = void 0;
const zod_1 = require("zod");
const validation_midelware_1 = require("../../midelware/validation.midelware");
exports.createComment = {
    params: zod_1.z.strictObject({ postId: validation_midelware_1.genralField.id }),
    body: zod_1.z.strictObject({
        conntent: zod_1.z.string().min(2).max(5000000).optional(),
        atachments: zod_1.z.array(zod_1.z.any()).max(2).optional(),
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
exports.replyOnComment = {
    params: exports.createComment.params.extend({
        commentId: validation_midelware_1.genralField.id
    }),
    body: exports.createComment.body
};
