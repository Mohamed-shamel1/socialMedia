"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genralField = exports.vailedation = void 0;
const zod_1 = require("zod");
const error_response_1 = require("../utils/response/error.response");
const mongoose_1 = require("mongoose");
const vailedation = (schema) => {
    return (req, res, next) => {
        const vaildetionError = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const vaildetionResult = schema[key].safeParse(req[key]);
            if (!vaildetionResult.success) {
                const errors = vaildetionResult.error;
                vaildetionError.push({ key, issues: errors.issues.map((issue) => {
                        return { path: issue.path, message: issue.message };
                    }) });
            }
        }
        if (vaildetionError.length) {
            throw new error_response_1.BadRequastExption("vaildetion error", { vaildetionError });
        }
        return next();
    };
};
exports.vailedation = vailedation;
exports.genralField = {
    userName: zod_1.z.string({
        error: "userName is required"
    }).min(2, { error: "the min length is 2 char" }).max(20, { error: "the max length is 20 char" }),
    email: zod_1.z.email({ error: "vailed email must be example@domian.com" }),
    otp: zod_1.z.string().regex(/^\d{6}$/),
    password: zod_1.z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    confirmPassword: zod_1.z.string(),
    id: zod_1.z.string().refine((data) => {
        return mongoose_1.Types.ObjectId.isValid(data);
    }, { error: "inviled objectId format" })
};
