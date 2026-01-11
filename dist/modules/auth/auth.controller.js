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
const vaildetors = __importStar(require("./auth.vaildition"));
const validation_midelware_1 = require("../../midelware/validation.midelware");
const express_1 = require("express");
const auth_servise_1 = __importDefault(require("./auth.servise"));
const router = (0, express_1.Router)();
router.post("/signup", (0, validation_midelware_1.vailedation)(vaildetors.signup), auth_servise_1.default.signup);
router.post("/signup-gmail", (0, validation_midelware_1.vailedation)(vaildetors.signupWithGmail), auth_servise_1.default.singupWithGmail);
router.post("/login-gmail", (0, validation_midelware_1.vailedation)(vaildetors.signupWithGmail), auth_servise_1.default.loginWithGmail);
router.patch("/confirm-email", (0, validation_midelware_1.vailedation)(vaildetors.confirmEmail), auth_servise_1.default.confirmEmail);
router.post("/login", (0, validation_midelware_1.vailedation)(vaildetors.login), auth_servise_1.default.login);
router.patch("/send-forgot-password", (0, validation_midelware_1.vailedation)(vaildetors.sendForgetCode), auth_servise_1.default.sendForgetcode);
router.patch("/reset-forgot-password", (0, validation_midelware_1.vailedation)(vaildetors.resetForgotPassword), auth_servise_1.default.resetForgotPassword);
router.patch("/verify-forgot-password", (0, validation_midelware_1.vailedation)(vaildetors.verifyForgotPassword), auth_servise_1.default.verifyForgotPassword);
exports.default = router;
