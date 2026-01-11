import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IFriendRequst{

  createdBy:Types.ObjectId
  sendTo:Types.ObjectId
      createdAt:Date;
      AccptedAt?:Date;
      updatedAt?:Date;



    

}

export type HFriendRequstDocument= HydratedDocument<IFriendRequst>
export const friendRequstSchema= new  Schema<IFriendRequst>({
    
 

    


    createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true},
    sendTo:{type:Schema.Types.ObjectId,ref:"User",required:true},
    AccptedAt:Date,



},{
    timestamps:true,strictQuery:true,
    
})

friendRequstSchema.pre(["findOneAndUpdate","updateOne"],function(next){
      const query =this.getQuery();
  if(query.paranoid=== false){
    this.setQuery({...query})
  }else{
    this.setQuery({...query,freezedAt:{$exists:false}})
  }
    next()
})
friendRequstSchema.pre(["find","findOne","countDocuments"],function(next){
  const query =this.getQuery();
  if(query.paranoid=== false){
    this.setQuery({...query})
  }else{
    this.setQuery({...query,freezedAt:{$exists:false}})
  }
  next()
})


export const FriendRequstModel= models.FriendRequst || model<IFriendRequst>("FriendRequst",friendRequstSchema)