
import type { Request,Response } from "express"
import { IconfirmEmailBodyInputsDto, IloginBodyInputsDto, ISignupBodyInputsDto,IGmail, IForgetBodyInputsDto, IverifyPasswordBodyInputsDto, IresetForgotPasswordBodyInputsDto } from "./auth.dto"
import { ProviderEnum, UserModel } from "../../DB/model/user.models"
import { UserRepostoriy } from "../../DB/repositry/user.repository"
import { BadRequastExption, ConfligtExptions, NotFoundExption } from "../../utils/response/error.response"
import { comperHash, generateHash } from "../../utils/secuirty/hash.secuirty"
import { emailEvent } from "../../utils/event/email.event"
import { generateNumberOtp } from "../../utils/otp"
import { createLoginCredaintal } from "../../utils/secuirty/token.secuirty"
import  {OAuth2Client,type TokenPayload}  from'google-auth-library';


class AuthintctionService {
//  private userModel:Model<IUser> = UserModel
  private userModel= new UserRepostoriy(UserModel)
    constructor(){}
   
   private async viryfyGmailAcount(idToken:string):Promise<TokenPayload>{

       const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID ||[],  
  });
  const payload = ticket.getPayload();
  if(!payload?.email_verified){
    throw new BadRequastExption("Fail to viryfy the google acount")
  }
  return payload 
}

    loginWithGmail=async(req:Request,res:Response):Promise<Response>=>{
      const {idToken}:IGmail=req.body;
      const {email}=await this.viryfyGmailAcount(idToken as string)
      const user =await this.userModel.findOne({filter:{email,provider:ProviderEnum.GOOGLE}});

       if(!user){
     
      throw new NotFoundExption("Email Not Exist or account rejester in another provider")
    }

    const credeanteal= await createLoginCredaintal(user)

      return res.status(201).json({message:"Done",data:{credeanteal}})
    }


    singupWithGmail=async(req:Request,res:Response):Promise<Response>=>{
      const {idToken}:IGmail=req.body;
      const {email,family_name,given_name ,picture}=await this.viryfyGmailAcount(idToken as string)
      const user =await this.userModel.findOne({filter:{email}});

       if(user){
      if(user.provider===ProviderEnum.GOOGLE){
        return await  this.loginWithGmail(req,res)
      }
      throw new ConfligtExptions(`Email exsist with another account ::: ${user.provider}`)
    }

    const [newUser] =(await this.userModel.create({
      data:[{firstName:given_name as string ,
        lastName:family_name as string,
        email:email as string,
        profileImage:picture as string,
        provider:ProviderEnum.GOOGLE,
        confirmetAt:new Date()}]
    })) ||[]
    if(!newUser){
      throw new BadRequastExption("Fail to signup with gmail please try agin ")
    }
    const credeanteal= await createLoginCredaintal(newUser)

      return res.status(201).json({message:"Done",data:{credeanteal}})
    }

     signup=async(req:Request,res:Response):Promise<Response> =>{
      // try {
      //   vaildators.signup.body.parse(req.body)
      // } catch (error) {
      //   throw new BadRequastExption("vaildition Error",{issue:JSON.parse(error as string)})
        
      // }

      // await vaildators.signup.body.parseAsync(req.body).catch((error)=>{
      //    throw new BadRequastExption("vaildition Error",{issue:JSON.parse(error as string)})

      // })

    
      // const vaildetionResult =vaildators.signup.body.safeParse(req.body)
      // if(!vaildetionResult.success){
      //   throw new BadRequastExption("vaildition Error",{issue:JSON.parse(vaildetionResult.error as unknown as string)})
      // }



   let {userName,email,password}:ISignupBodyInputsDto=req.body
   console.log({userName,email,password});
   
        // HydratedDocument ts بدمج خصائص المونجوز مع خصائص 
        // const [user]:HydratedDocument<IUser>[] =await this.userModel.create([{userName,email,password}])
        // if(!user){
        //   throw new BadRequastExption("Fail")
        // }

        const chekUserExist =await this.userModel.findOne({filter:{email},select:"email",options:{lean:true}})
        console.log({chekUserExist});
        if(chekUserExist){
          throw new ConfligtExptions("Email exist")
        }
        
        const otp= generateNumberOtp()
      const user =await this.userModel.createUser({data:[{userName,email,password:await generateHash(password),
         confirmEmailOtp:await generateHash(String(otp))
      }]})
        emailEvent.emit("confirmEmail",{to:email,otp:otp})
  return  res.status(201).json({message:"Done",data:{user}})
}



     confirmEmail=async(req:Request,res:Response):Promise<Response> =>{
                const {email ,otp}:IconfirmEmailBodyInputsDto=req.body;
                const user= await this.userModel.findOne({
                  filter:{
                    email,confirmEmailOtp:{$exists:true},confirmetAt:{$exists:false}
                  }
                })
                if(!user){
                  throw new NotFoundExption("Invailed account")
                }
                if(!(await comperHash(otp,user.confirmEmailOtp as string))){
                  throw new ConfligtExptions("Invailed confirmation code ")
                }


                await this.userModel.updateOne({
                  filter:{email},
                  update:{
                    confirmetAt:new Date(),
                  $unset:{confirmEmailOtp:1}
                }})

  return  res.status(200).json({message:"Done",data:req.body})
}
     login=async(req:Request,res:Response):Promise<Response> =>{
      const {email , password }:IloginBodyInputsDto=req.body;
      const user =await this.userModel.findOne({filter:{email,provider:ProviderEnum.SYSTEM}})
      if(!user){
        throw new BadRequastExption("invalied login data")
      }
      if(!user.confirmetAt){
        throw new BadRequastExption("verifiy your account first")
      }

      if(!await comperHash(password,user.password)){
        throw new BadRequastExption("invailed login data")
      }
      

      const credential=await createLoginCredaintal(user)

  return  res.status(200).json({message:"Done",data:{credential}})
}
     sendForgetcode=async(req:Request,res:Response):Promise<Response> =>{
      const {email }:IForgetBodyInputsDto=req.body;
      const user =await this.userModel.findOne({filter:{
        email,
        provider:ProviderEnum.SYSTEM,
        confirmetAt:{$exists:true}
      }})
      if(!user){
        throw new BadRequastExption("invalied account ")
      }

      const otp = generateNumberOtp()
     const result= await this.userModel.updateOne({filter:{email},
      update:{
        resertPassword: await generateHash(String(otp))
      }
      })
      if(!result.matchedCount){
        throw new BadRequastExption("fail to send the reset please try agine ")
      }
      emailEvent.emit("resetPassword",{to:email,otp})

  return  res.status(200).json({message:"Done"})
}
     resetForgotPassword=async(req:Request,res:Response):Promise<Response> =>{
      const {email,otp,password }:IresetForgotPasswordBodyInputsDto=req.body;
      const user =await this.userModel.findOne({filter:{
        email,
        provider:ProviderEnum.SYSTEM,
        resertPassword:{$exists:true}
      }})
      if(!user){
        throw new BadRequastExption("invalied account or missing Password Otp ")
      }

      if(!(await comperHash(otp,user.resertPassword as string))){
        throw new ConfligtExptions("invailed Otp ")
      }
      const result= await this.userModel.updateOne({filter:{email},
      update:{
        password:await generateHash(password),
        chengeCredantialTime:new Date(),
        $unset:{resertPassword:1}
      }
      })
      if(!result.matchedCount){
        throw new BadRequastExption("fail to reset account password ")
      }
  return  res.status(200).json({message:"Done"})
}
     verifyForgotPassword=async(req:Request,res:Response):Promise<Response> =>{
      const {email,otp }:IverifyPasswordBodyInputsDto=req.body;
      const user =await this.userModel.findOne({filter:{
        email,
        provider:ProviderEnum.SYSTEM,
        resertPassword:{$exists:true}
      }})
      if(!user){
        throw new BadRequastExption("invalied account or missing Password Otp ")
      }

      if(!(await comperHash(otp,user.resertPassword as string))){
        throw new ConfligtExptions("invailed Otp ")
      }
  return  res.status(200).json({message:"Done"})
}
}
export default new AuthintctionService