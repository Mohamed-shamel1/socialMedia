"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endPoint = void 0;
const user_models_1 = require("../../DB/model/user.models");
exports.endPoint = {
    profile: [user_models_1.RoleEnum.user, user_models_1.RoleEnum.admin],
    restoreAcount: [user_models_1.RoleEnum.admin],
    deleteAcount: [user_models_1.RoleEnum.admin],
    dashbord: [user_models_1.RoleEnum.user, user_models_1.RoleEnum.superAdmin],
};
