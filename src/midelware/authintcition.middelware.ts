import  type{ NextFunction, Request, Response } from "express"
import { BadRequastExption, ForBeadenExption } from "../utils/response/error.response"
import { decodeToken, tokenEnum } from "../utils/secuirty/token.secuirty"
import { RoleEnum } from "../DB/model/user.models"


export const authintcation=(tokenType:tokenEnum=tokenEnum.acsses)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        if(!req.headers.authorization){
          throw new BadRequastExption("vaildetion error",
            {
                key:"headers",issues:[{path:"authorization",
            message:"missing authorization"}]})
        }
        const {decoded,user}=await decodeToken({authrizaition:req.headers.authorization,tokenType})
        req.user=user;
        req.decoded=decoded
        
return next()
    }
}
export const authraization=(acssesRole:RoleEnum[]=[],
    tokenType:tokenEnum=tokenEnum.acsses)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        
        if(!req.headers.authorization){
          throw new BadRequastExption("vaildetion error",
            {
                key:"headers",issues:[{path:"authorization",
            message:"missing authorization"}]})
        }
        const {decoded,user}=await decodeToken({authrizaition:req.headers.authorization,tokenType})
        if(!acssesRole.includes(user.role)){
            throw new ForBeadenExption("not authirized account")
        }
        req.user=user;
        req.decoded=decoded
        


return next()
    }
}