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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authintcition_middelware_1 = require("../../midelware/authintcition.middelware");
const validation_midelware_1 = require("../../midelware/validation.midelware");
const vaildetors = __importStar(require("./chat.vaildtion"));
const chat_service_1 = require("./chat.service");
const chatService = new chat_service_1.ChatServiec();
const router = (0, express_1.Router)({ mergeParams: true });
router.get("/", (0, authintcition_middelware_1.authintcation)(), (0, validation_midelware_1.vailedation)(vaildetors.getChat), chatService.getChat);
router.post("/group", (0, authintcition_middelware_1.authintcation)(), (0, validation_midelware_1.vailedation)(vaildetors.createChatingGroup), chatService.createChatingGroup);
router.get("/group/:groupId", (0, authintcition_middelware_1.authintcation)(), (0, validation_midelware_1.vailedation)(vaildetors.getChatingGroup), chatService.getChatingGroup);
exports.default = router;
