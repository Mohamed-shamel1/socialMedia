"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authraization = exports.authintcation = void 0;
const error_response_1 = require("../utils/response/error.response");
const token_secuirty_1 = require("../utils/secuirty/token.secuirty");
const authintcation = (tokenType = token_secuirty_1.tokenEnum.acsses) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new error_response_1.BadRequastExption("vaildetion error", {
                key: "headers", issues: [{ path: "authorization",
                        message: "missing authorization" }]
            });
        }
        const { decoded, user } = await (0, token_secuirty_1.decodeToken)({ authrizaition: req.headers.authorization, tokenType });
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};
exports.authintcation = authintcation;
const authraization = (acssesRole = [], tokenType = token_secuirty_1.tokenEnum.acsses) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new error_response_1.BadRequastExption("vaildetion error", {
                key: "headers", issues: [{ path: "authorization",
                        message: "missing authorization" }]
            });
        }
        const { decoded, user } = await (0, token_secuirty_1.decodeToken)({ authrizaition: req.headers.authorization, tokenType });
        if (!acssesRole.includes(user.role)) {
            throw new error_response_1.ForBeadenExption("not authirized account");
        }
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};
exports.authraization = authraization;
