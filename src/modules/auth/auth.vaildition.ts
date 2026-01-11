import { z} from "zod"
import { genralField } from "../../midelware/validation.midelware";


export const login={
    body:z.strictObject({
       
        email:genralField.email,
        password:genralField.password,
        
    })
}
export const signup={
    body:login.body.extend({
        userName:genralField.userName,
        confirmPassword:genralField.confirmPassword
    }).refine((data)=>{
        return data.confirmPassword === data.password;
    },{error:"confirmPassword mis match password"}
)
}
export const confirmEmail={
    body:z.strictObject({
        email:genralField.email,
        otp:genralField.otp
    })

}

export const signupWithGmail={
    body:z.strictObject({
        idToken:z.string
    })

}

export const sendForgetCode={
    body:z.strictObject({
        email:genralField.email
    })

}
export const verifyForgotPassword={
    body:sendForgetCode.body.extend({
                otp:genralField.otp

    })

}
export const resetForgotPassword={
    body:verifyForgotPassword.body.extend({
                otp:genralField.otp,
                password:genralField.password,
                confirmPassword:genralField.confirmPassword
    }).refine((data)=>{
        return data.password=== data.confirmPassword

    },{message:"password misMatch confirmPassword",path:["confirmPassword"]})

}