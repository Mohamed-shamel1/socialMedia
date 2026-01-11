import{z} from "zod";
import { NextFunction, Request, Response } from "express";
import type{ ZodError, ZodType } from "zod";
import { BadRequastExption } from "../utils/response/error.response";
import { Types } from "mongoose";

type KeyReqType = keyof Request // 'params' | 'body' | 'file' | 'quire'
type ScheamType = Partial<Record<KeyReqType,ZodType>>
export const vailedation=(schema:ScheamType)=>{
return (req:Request,res:Response,next :NextFunction):NextFunction=>{
    
    const vaildetionError:Array<{
        key :KeyReqType;
        issues:Array<{
            message:string,
            path:(string | number |symbol| undefined)[];
        }>
    }>=[]
    for (const key of Object.keys(schema) as KeyReqType[]) {
        if (!schema[key]) continue;
        const vaildetionResult = schema[key].safeParse(req[key])
        if(!vaildetionResult.success){
            const errors=vaildetionResult.error as ZodError
            vaildetionError.push({key,issues : errors.issues.map((issue)=>{
                return{path:issue.path,message:issue.message}
            })})
        }
    }
    if(vaildetionError.length){
        throw new BadRequastExption("vaildetion error",{vaildetionError})
    }
    return next() as unknown as NextFunction
    
  }
}

export const genralField={
           userName:z.string({
                error:"userName is required"
            }).min(2,{error:"the min length is 2 char"}).max(20,{error:"the max length is 20 char"}),
            email:z.email({error:"vailed email must be example@domian.com"}),
            otp:z.string().regex(/^\d{6}$/),
            password:z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
            confirmPassword:z.string(),


            id:z.string().refine((data)=>{
            return Types.ObjectId.isValid(data)
          },
          {error:"inviled objectId format"}
        )
}