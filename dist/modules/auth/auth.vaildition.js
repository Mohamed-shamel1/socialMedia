"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetForgotPassword = exports.verifyForgotPassword = exports.sendForgetCode = exports.signupWithGmail = exports.confirmEmail = exports.signup = exports.login = void 0;
const zod_1 = require("zod");
const validation_midelware_1 = require("../../midelware/validation.midelware");
exports.login = {
    body: zod_1.z.strictObject({
        email: validation_midelware_1.genralField.email,
        password: validation_midelware_1.genralField.password,
    })
};
exports.signup = {
    body: exports.login.body.extend({
        userName: validation_midelware_1.genralField.userName,
        confirmPassword: validation_midelware_1.genralField.confirmPassword
    }).refine((data) => {
        return data.confirmPassword === data.password;
    }, { error: "confirmPassword mis match password" })
};
exports.confirmEmail = {
    body: zod_1.z.strictObject({
        email: validation_midelware_1.genralField.email,
        otp: validation_midelware_1.genralField.otp
    })
};
exports.signupWithGmail = {
    body: zod_1.z.strictObject({
        idToken: zod_1.z.string
    })
};
exports.sendForgetCode = {
    body: zod_1.z.strictObject({
        email: validation_midelware_1.genralField.email
    })
};
exports.verifyForgotPassword = {
    body: exports.sendForgetCode.body.extend({
        otp: validation_midelware_1.genralField.otp
    })
};
exports.resetForgotPassword = {
    body: exports.verifyForgotPassword.body.extend({
        otp: validation_midelware_1.genralField.otp,
        password: validation_midelware_1.genralField.password,
        confirmPassword: validation_midelware_1.genralField.confirmPassword
    }).refine((data) => {
        return data.password === data.confirmPassword;
    }, { message: "password misMatch confirmPassword", path: ["confirmPassword"] })
};
