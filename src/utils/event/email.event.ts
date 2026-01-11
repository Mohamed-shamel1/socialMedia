import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer";
import { sendEmail } from "../email/send.email";
import { verifiyEmail } from "../email/verifiy.templet.email";
export const emailEvent=new EventEmitter();
interface IEmail extends Mail.Options{
    otp:number
}
emailEvent.on("confirmEmail",async(data:IEmail)=>{
  try {
    data.subject= "confirm-Email";
    data.html= await verifiyEmail({otp:data.otp,title:"email-confirmation" })
    await sendEmail(data)
  } catch (error) {
    console.log(`Fail to send email`,error);
    
  }
})
emailEvent.on("resetPassword",async(data:IEmail)=>{
  try {
    data.subject= "reset-account-password";
    data.html= await verifiyEmail({otp:data.otp,title:"Reset code" })
    await sendEmail(data)
  } catch (error) {
    console.log(`Fail to send email`,error);
    
  }
})