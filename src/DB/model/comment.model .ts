import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { IPost } from "./post.model";

export interface IComment{

  createdBy:Types.ObjectId
  postId:Types.ObjectId|Partial<IPost>
  commentId:Types.ObjectId


    conntent?:string;
    atachments:string[];


    removedAtachments:string[]
    removedTags:string[]

  

    likes?:Types.ObjectId[];
    tags?:Types.ObjectId[];

    freaazedAt:Date;
    freaazedBy:Types.ObjectId;

    restoredAt:Date;
    restoredBy:Types.ObjectId;

    createdAt:Date;
    updatedAt:Date;


}

export type HCommentDocument= HydratedDocument<IComment>
export const commentSchema= new  Schema<IComment>({
    conntent:{
        type:String,
        minlength:2,
        maxlength:5000000,
        required:function(){
            return !this.atachments?.length
        },
    },
    atachments:String,
    removedAtachments:[String],

    likes:[{type:Schema.Types.ObjectId,ref:"User"}],
    tags:[{type:Schema.Types.ObjectId,ref:"User"}],


    createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true},
    postId:{type:Schema.Types.ObjectId,ref:"Post",required:true},
    commentId:{type:Schema.Types.ObjectId,ref:"comment"},

    freaazedAt:Date,
    freaazedBy:{type:Schema.Types.ObjectId,ref:"User"},

    restoredAt:Date,
    restoredBy:{type:Schema.Types.ObjectId,ref:"User"},
},{
    timestamps:true,strictQuery:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
})

commentSchema.pre(["findOneAndUpdate","updateOne"],function(next){
      const query =this.getQuery();
  if(query.paranoid=== false){
    this.setQuery({...query})
  }else{
    this.setQuery({...query,freezedAt:{$exists:false}})
  }
    next()
})
commentSchema.pre(["find","findOne","countDocuments"],function(next){
  const query =this.getQuery();
  if(query.paranoid=== false){
    this.setQuery({...query})
  }else{
    this.setQuery({...query,freezedAt:{$exists:false}})
  }
  next()
})
commentSchema.virtual("reply",{
  localField:"_id",
  foreignField:"commentId",
  ref:"Comment",
  justOne:true
})

export const CommentModel= models.Post || model<IComment>("Comment",commentSchema)