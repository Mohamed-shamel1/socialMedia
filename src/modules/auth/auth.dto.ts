import {z} from "zod"
import * as vaildetors from "./auth.vaildition"

export type ISignupBodyInputsDto=z.infer<typeof vaildetors.signup.body>
export type IconfirmEmailBodyInputsDto=z.infer<typeof vaildetors.confirmEmail.body> 
export type IloginBodyInputsDto=z.infer<typeof vaildetors.login.body>

export type IForgetBodyInputsDto=z.infer<typeof vaildetors.sendForgetCode.body> 
export type IverifyPasswordBodyInputsDto=z.infer<typeof vaildetors.verifyForgotPassword.body> 
export type IresetForgotPasswordBodyInputsDto=z.infer<typeof vaildetors.resetForgotPassword.body> 
export type IGmail=z.infer<typeof vaildetors.signupWithGmail.body> 