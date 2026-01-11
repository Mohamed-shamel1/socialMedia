import * as vaildetors from "./auth.vaildition"
import { vailedation } from "../../midelware/validation.midelware";

import { Router } from "express";
import authService from "./auth.servise"
const router:Router =Router();


router.post("/signup",vailedation(vaildetors.signup),authService.signup)
router.post("/signup-gmail",vailedation(vaildetors.signupWithGmail),authService.singupWithGmail)

router.post("/login-gmail",vailedation(vaildetors.signupWithGmail),authService.loginWithGmail)
router.patch("/confirm-email",vailedation(vaildetors.confirmEmail),authService.confirmEmail)
router.post("/login",vailedation(vaildetors.login),authService.login)


router.patch("/send-forgot-password",vailedation(vaildetors.sendForgetCode),authService.sendForgetcode)
router.patch("/reset-forgot-password",vailedation(vaildetors.resetForgotPassword),authService.resetForgotPassword)
router.patch("/verify-forgot-password",vailedation(vaildetors.verifyForgotPassword),authService.verifyForgotPassword)
export default router