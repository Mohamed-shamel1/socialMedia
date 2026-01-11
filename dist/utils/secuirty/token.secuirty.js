"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokToken = exports.decodeToken = exports.createLoginCredaintal = exports.getSignetser = exports.detectSignetserLevel = exports.verifyToken = exports.generateToken = exports.logoutEnum = exports.tokenEnum = exports.SignetsureLevelEnum = void 0;
const uuid_1 = require("uuid");
const jsonwebtoken_1 = require("jsonwebtoken");
const user_models_1 = require("../../DB/model/user.models");
const error_response_1 = require("../response/error.response");
const jsonwebtoken_2 = require("jsonwebtoken");
const user_repository_1 = require("../../DB/repositry/user.repository");
const token_repositry_1 = require("../../DB/repositry/token.repositry");
const token_model_1 = require("../../DB/model/token.model");
var SignetsureLevelEnum;
(function (SignetsureLevelEnum) {
    SignetsureLevelEnum["Bearer"] = "Bearer";
    SignetsureLevelEnum["System"] = "System";
})(SignetsureLevelEnum || (exports.SignetsureLevelEnum = SignetsureLevelEnum = {}));
var tokenEnum;
(function (tokenEnum) {
    tokenEnum["acsses"] = "accses";
    tokenEnum["refresh"] = "refresh";
})(tokenEnum || (exports.tokenEnum = tokenEnum = {}));
var logoutEnum;
(function (logoutEnum) {
    logoutEnum["only"] = "only";
    logoutEnum["all"] = "all";
})(logoutEnum || (exports.logoutEnum = logoutEnum = {}));
const generateToken = async ({ paylode, secret = process.env.ACSSES_USER_TOKEN_SIGNETSURE, options = { expiresIn: Number(process.env.ACSSES_TOKEN_EXPIRE_IN) } }) => {
    return (0, jsonwebtoken_1.sign)(paylode, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token, secret = process.env.ACSSES_USER_TOKEN_SIGNETSURE, }) => {
    return (0, jsonwebtoken_2.verify)(token, secret);
};
exports.verifyToken = verifyToken;
const detectSignetserLevel = async (role = user_models_1.RoleEnum.user) => {
    let SignetserLevel = SignetsureLevelEnum.Bearer;
    switch (role) {
        case user_models_1.RoleEnum.admin:
        case user_models_1.RoleEnum.superAdmin:
            SignetserLevel = SignetsureLevelEnum.System;
            break;
        default:
            SignetserLevel = SignetsureLevelEnum.Bearer;
            break;
    }
    return SignetserLevel;
};
exports.detectSignetserLevel = detectSignetserLevel;
const getSignetser = async (SignetserLevel = SignetsureLevelEnum.Bearer) => {
    let signetser = {
        acsses_signtser: "",
        refresh_signtser: ""
    };
    switch (SignetserLevel) {
        case SignetsureLevelEnum.System:
            signetser.acsses_signtser = process.env.ACSSES_SYSTEAM_TOKEN_SIGNETSURE;
            signetser.refresh_signtser = process.env.REFREAS_SYSTEAM_TOKEN_SIGNETSURE;
            break;
        default:
            signetser.acsses_signtser = process.env.ACSSES_USER_TOKEN_SIGNETSURE;
            signetser.refresh_signtser = process.env.REFREAS_USER_TOKEN_SIGNETSURE;
            break;
    }
    return signetser;
};
exports.getSignetser = getSignetser;
const createLoginCredaintal = async (user) => {
    const segnitserLevel = await (0, exports.detectSignetserLevel)(user.role);
    const signetser = await (0, exports.getSignetser)(segnitserLevel);
    console.log(signetser);
    const jwtid = (0, uuid_1.v4)();
    const acsses_Token = await (0, exports.generateToken)({ paylode: { _id: user._id },
        secret: signetser.acsses_signtser,
        options: { expiresIn: Number(process.env.ACSSES_TOKEN_EXPIRE_IN), jwtid }
    });
    const refresh_Token = await (0, exports.generateToken)({ paylode: { _id: user._id },
        secret: signetser.refresh_signtser,
        options: { expiresIn: Number(process.env.REFREAS_TOKEN_EXPIRE_IN), jwtid } });
    return { acsses_Token, refresh_Token };
};
exports.createLoginCredaintal = createLoginCredaintal;
const decodeToken = async ({ authrizaition, tokenType }) => {
    const userModel = new user_repository_1.UserRepostoriy(user_models_1.UserModel);
    const tokenModel = new token_repositry_1.TokenRepositry(token_model_1.TokenModel);
    const [barerKey, token] = authrizaition.split(" ");
    if (!barerKey || !token) {
        throw new error_response_1.UnauthrizedExption("missing tken pares");
    }
    const signetser = await (0, exports.getSignetser)(barerKey);
    const decoded = await (0, exports.verifyToken)({ token,
        secret: tokenType === tokenEnum.refresh ? signetser.refresh_signtser : signetser.acsses_signtser
    });
    if (!decoded?._id || !decoded?.iat) {
        throw new error_response_1.BadRequastExption("invailed token pylode");
    }
    if (await tokenModel.findOne({ filter: { jti: decoded.jti } })) {
        throw new error_response_1.UnauthrizedExption("invaled or ald login credantial");
    }
    const user = await userModel.findOne({ filter: { _id: decoded._id } });
    if (!user) {
        throw new error_response_1.BadRequastExption("not rejester account ");
    }
    return { user, decoded };
};
exports.decodeToken = decodeToken;
const createRevokToken = async (decoded) => {
    const tokenModel = new token_repositry_1.TokenRepositry(token_model_1.TokenModel);
    const [result] = (await tokenModel.create({
        data: [
            {
                jti: decoded.jti,
                expiresIn: decoded.iat +
                    Number(process.env.REFREAS_TOKEN_EXPIRE_IN),
                userId: decoded._id
            }
        ]
    })) || [];
    if (!result) {
        throw new error_response_1.BadRequastExption("Fail to revoke this token");
    }
    return result;
};
exports.createRevokToken = createRevokToken;
