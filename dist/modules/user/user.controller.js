"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authintcition_middelware_1 = require("../../midelware/authintcition.middelware");
const user_service_1 = __importDefault(require("./user.service"));
const validation_midelware_1 = require("../../midelware/validation.midelware");
const vaildetors = __importStar(require("../user/user.vailedation"));
const token_secuirty_1 = require("../../utils/secuirty/token.secuirty");
const user_authrization_1 = require("./user.authrization");
const chat_1 = require("../chat");
const router = (0, express_1.Router)();
router.use("/:userId/chat", chat_1.chatRouter);
router.get("/", (0, authintcition_middelware_1.authintcation)(), user_service_1.default.profile);
router.get("/dashbord", (0, authintcition_middelware_1.authraization)(user_authrization_1.endPoint.dashbord), user_service_1.default.dashbord);
router.patch("/:userId/change-role", (0, authintcition_middelware_1.authraization)(user_authrization_1.endPoint.dashbord), (0, validation_midelware_1.vailedation)(vaildetors.changeRole), user_service_1.default.changeRole);
router.post("/:userId/send-friend-request", (0, authintcition_middelware_1.authintcation)(), (0, validation_midelware_1.vailedation)(vaildetors.sendFriendRequest), user_service_1.default.sendFriendRequest);
router.patch("/accept-friend-request/:requestId", (0, authintcition_middelware_1.authintcation)(), (0, validation_midelware_1.vailedation)(vaildetors.acceptFriendRequest), user_service_1.default.acceptFriendRequest);
router.post("/refresh-token", (0, authintcition_middelware_1.authintcation)(token_secuirty_1.tokenEnum.refresh), user_service_1.default.refreshToken);
router.post("/logout", (0, authintcition_middelware_1.authintcation)(), (0, validation_midelware_1.vailedation)(vaildetors.logout), user_service_1.default.logout);
exports.default = router;
