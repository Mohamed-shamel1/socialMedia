"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.changeRole = exports.acceptFriendRequest = exports.sendFriendRequest = void 0;
const zod_1 = require("zod");
const token_secuirty_1 = require("../../utils/secuirty/token.secuirty");
const validation_midelware_1 = require("../../midelware/validation.midelware");
const user_models_1 = require("../../DB/model/user.models");
exports.sendFriendRequest = {
    params: zod_1.z.strictObject({
        userId: validation_midelware_1.genralField.id
    }),
};
exports.acceptFriendRequest = {
    params: zod_1.z.strictObject({
        requestId: validation_midelware_1.genralField.id
    }),
};
exports.changeRole = {
    params: exports.sendFriendRequest.params,
    body: zod_1.z.strictObject({
        role: zod_1.z.enum(user_models_1.RoleEnum)
    })
};
exports.logout = {
    body: zod_1.z.strictObject({
        flag: zod_1.z.enum(token_secuirty_1.logoutEnum).default(token_secuirty_1.logoutEnum.only)
    })
};
