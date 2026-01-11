import {v4 as uuid } from "uuid"
import type {JwtPayload, Secret, SignOptions} from "jsonwebtoken"
import { sign} from "jsonwebtoken"
import { HUserDocument, RoleEnum, UserModel } from "../../DB/model/user.models";
import { BadRequastExption, UnauthrizedExption } from "../response/error.response";
import { verify } from "jsonwebtoken";
import { UserRepostoriy } from "../../DB/repositry/user.repository";
import { TokenRepositry } from "../../DB/repositry/token.repositry";
import { HTokenDocument, TokenModel } from "../../DB/model/token.model";

export enum SignetsureLevelEnum{
    Bearer="Bearer",
    System="System"
}

export enum tokenEnum{
  acsses="accses",
  refresh="refresh"
}
export enum logoutEnum{
  only="only",
  all="all"
}
 
export const generateToken =async({
    paylode,
    secret=process.env.ACSSES_USER_TOKEN_SIGNETSURE  as string,
    options={expiresIn:Number(process.env.ACSSES_TOKEN_EXPIRE_IN)}

}:{
        paylode:Object;
        secret?:Secret;
        options?:SignOptions;
    }):Promise<string>=>{
  return sign(paylode,secret,options)
}
export const verifyToken =async({
    token,
    secret=process.env.ACSSES_USER_TOKEN_SIGNETSURE  as string,
    

}:{
        token:string;
        secret?:Secret;
       
    }):Promise<JwtPayload>=>{
  return verify(token,secret) as JwtPayload
}

export const detectSignetserLevel=async(role:RoleEnum=RoleEnum.user):Promise<SignetsureLevelEnum>=>{
    let SignetserLevel:SignetsureLevelEnum=SignetsureLevelEnum.Bearer;
    switch (role) {
        case RoleEnum.admin:
        case RoleEnum.superAdmin:
            SignetserLevel=SignetsureLevelEnum.System
            break;
    
        default:
            SignetserLevel=SignetsureLevelEnum.Bearer
            break;
    }
    return SignetserLevel
}
export const getSignetser=async(
    SignetserLevel:SignetsureLevelEnum=SignetsureLevelEnum.Bearer
):Promise<{acsses_signtser:string,refresh_signtser:string}>=>{
    let signetser:{acsses_signtser:string,refresh_signtser:string}={
        acsses_signtser : "",
        refresh_signtser : ""
    };
    switch (SignetserLevel) {
        case SignetsureLevelEnum.System:
            signetser.acsses_signtser=process.env.ACSSES_SYSTEAM_TOKEN_SIGNETSURE as string;
            signetser.refresh_signtser=process.env.REFREAS_SYSTEAM_TOKEN_SIGNETSURE as string

            break;
    
        default:
            signetser.acsses_signtser=process.env.ACSSES_USER_TOKEN_SIGNETSURE as string;
            signetser.refresh_signtser=process.env.REFREAS_USER_TOKEN_SIGNETSURE as string

            break;
    }
    return signetser
}



export const createLoginCredaintal=async(user:HUserDocument)=>{


    const segnitserLevel=await detectSignetserLevel(user.role)

    const signetser=await getSignetser(segnitserLevel)
    console.log(signetser);
    const jwtid = uuid()
    
   const acsses_Token =await generateToken({paylode:{_id:user._id},
    secret:signetser.acsses_signtser,
      options:{expiresIn:Number(process.env.ACSSES_TOKEN_EXPIRE_IN),jwtid}

})

      const refresh_Token =await generateToken({paylode:{_id:user._id},
        secret:signetser.refresh_signtser as string,
        options:{expiresIn:Number(process.env.REFREAS_TOKEN_EXPIRE_IN),jwtid}
      
      })
      return {acsses_Token,refresh_Token}

}

export const decodeToken=async({authrizaition,tokenType}:{authrizaition:string,tokenType?:tokenEnum})=>{
    const userModel= new UserRepostoriy(UserModel)
    const tokenModel= new TokenRepositry(TokenModel)
    const [barerKey,token]=authrizaition.split(" ")
  if(!barerKey ||!token){
    throw new UnauthrizedExption("missing tken pares")
  }
  const signetser= await getSignetser(barerKey as SignetsureLevelEnum)
  const decoded=await verifyToken({token,
    secret:tokenType===tokenEnum.refresh? signetser.refresh_signtser: signetser.acsses_signtser
})
if(!decoded?._id || !decoded?.iat){
    throw new BadRequastExption("invailed token pylode")
}

if(await tokenModel.findOne({filter:{jti:decoded.jti}})){
  throw new UnauthrizedExption("invaled or ald login credantial")
}
  const user =await userModel.findOne({filter:{_id:decoded._id}})
  if(!user){
    throw new BadRequastExption("not rejester account ")

  }


  return {user , decoded}
}


export const createRevokToken =async(decoded:JwtPayload):Promise<HTokenDocument>=>{
  const tokenModel =new TokenRepositry(TokenModel)

  const [result] =(await tokenModel.create({
    data:[
      {
        jti:decoded.jti as string,
        expiresIn:(decoded.iat as number)+
        Number(process.env.REFREAS_TOKEN_EXPIRE_IN),
        userId:decoded._id
      }
    ]
  }))|| []
  if(!result){
    throw new BadRequastExption("Fail to revoke this token")
  }
  return result;
}