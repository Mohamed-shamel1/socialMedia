import { CreateOptions, HydratedDocument, Model } from "mongoose";
import { IUser } from "../model/user.models";
import { DatabaseRebosatory } from "./database.repository";
import { BadRequastExption } from "../../utils/response/error.response";



export  class UserRepostoriy extends DatabaseRebosatory<IUser>{
  constructor(protected override readonly model:Model<IUser>){
    super(model)
  }
     async createUser({
        data,
    options,
   }:{
    data:Partial<IUser>[],
    options?:CreateOptions,

   }):Promise<HydratedDocument<IUser>> {
     const [user]=(await this.create({data}))||[];
     if(!user){
      throw new BadRequastExption("Fail to create this user")
     }
     return user;
   }
}