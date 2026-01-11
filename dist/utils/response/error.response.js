"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.glopelErrorHandleing = exports.ForBeadenExption = exports.UnauthrizedExption = exports.NotFoundExption = exports.ConfligtExptions = exports.BadRequastExption = exports.ApplcationExption = void 0;
class ApplcationExption extends Error {
    statusCode;
    constructor(message, statusCode, cause) {
        super(message, { cause });
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApplcationExption = ApplcationExption;
class BadRequastExption extends ApplcationExption {
    constructor(message, cause) {
        super(message, 400, cause);
    }
}
exports.BadRequastExption = BadRequastExption;
class ConfligtExptions extends ApplcationExption {
    constructor(message, cause) {
        super(message, 409, cause);
    }
}
exports.ConfligtExptions = ConfligtExptions;
class NotFoundExption extends ApplcationExption {
    constructor(message, cause) {
        super(message, 404, cause);
    }
}
exports.NotFoundExption = NotFoundExption;
class UnauthrizedExption extends ApplcationExption {
    constructor(message, cause) {
        super(message, 401, cause);
    }
}
exports.UnauthrizedExption = UnauthrizedExption;
class ForBeadenExption extends ApplcationExption {
    constructor(message, cause) {
        super(message, 403, cause);
    }
}
exports.ForBeadenExption = ForBeadenExption;
const glopelErrorHandleing = (error, req, res, next) => {
    return res.status(error.statusCode || 500).json({ err_message: error.message || "something went wrong",
        stack: process.env.MOOD === "development" ? error.stack : undefined,
        cause: error.cause,
        error,
    });
};
exports.glopelErrorHandleing = glopelErrorHandleing;
