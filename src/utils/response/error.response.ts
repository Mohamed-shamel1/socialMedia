import { NextFunction, Request, Response } from "express"

export interface IError extends Error{
    statusCode:number

}
export class ApplcationExption extends Error{
    constructor( message:string,public statusCode:number,  cause?:unknown){
        super(message,{cause})
        this.name=this.constructor.name
        Error.captureStackTrace(this,this.constructor)
    }
}
export class BadRequastExption extends ApplcationExption{
    constructor( message:string,  cause?:unknown){
        super(message,400,cause)
        
    }
}
export class ConfligtExptions extends ApplcationExption{
    constructor( message:string,  cause?:unknown){
        super(message,409,cause)
  
    }
}
export class NotFoundExption extends ApplcationExption{
    constructor( message:string,  cause?:unknown){
        super(message,404,cause)
    
    }
}
export class UnauthrizedExption extends ApplcationExption{
    constructor( message:string,  cause?:unknown){
        super(message,401,cause)
        
    }
}
export class ForBeadenExption extends ApplcationExption{
    constructor( message:string,  cause?:unknown){
        super(message,403,cause)
        
    }
}
export const glopelErrorHandleing=(error:IError,req:Request,res:Response,next:NextFunction)=>{

        return res.status(error.statusCode ||500).json({err_message:error.message || "something went wrong",
            stack:process.env.MOOD==="development" ? error.stack : undefined,
            cause:error.cause,
            error,
        
        })
     }