import { HydratedDocument, model, models, Schema, Types } from "mongoose";
export enum allowCommentEnum{
    allow="allow",
    dnay="dnay"
}
export enum avielablityEnum{
    public="public",
    frindes="frindes",
    onlyMe="onlyMe"
}
export enum likeActionEnum{
    like="like",
    unlike="unlike"
}

export interface IPost{
    content?:string;
    atachments:string[];
    asseatFolderId:string;


    removedAtachments:string[]
    removedTags:string[]

    avielablity:avielablityEnum;
    allowComment:allowCommentEnum;

    likes?:Types.ObjectId[];
    tags?:Types.ObjectId[];
    createdBy:Types.ObjectId;

    freaazedAt:Date;
    freaazedBy:Types.ObjectId;

    restoredAt:Date;
    restoredBy:Types.ObjectId;

    createdAt:Date;
    updatedAt:Date;


}

export type HPostDocument= HydratedDocument<IPost>
export const postSchema= new  Schema<IPost>({
    content:{
        type:String,
        minlength:2,
        maxlength:5000000,
        required:function(){
            return !this.atachments?.length
        },
    },
    atachments:String,
    removedAtachments:[String],
    asseatFolderId:{type:String},

    avielablity:{type:String,enum:avielablityEnum,default:avielablityEnum.public},
    allowComment:{type:String,enum:allowCommentEnum,defaultl:allowCommentEnum.allow},

    likes:[{type:Schema.Types.ObjectId,ref:"User"}],
    tags:[{type:Schema.Types.ObjectId,ref:"User"}],


    createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true},

    freaazedAt:Date,
    freaazedBy:{type:Schema.Types.ObjectId,ref:"User"},

    restoredAt:Date,
    restoredBy:{type:Schema.Types.ObjectId,ref:"User"},
},{
    timestamps:true,strictQuery:true,
    toObject:{virtuals:true},toJSON:{virtuals:true}
})

postSchema.pre(["findOneAndUpdate","updateOne"],function(next){
      const query =this.getQuery();
  if(query.paranoid=== false){
    this.setQuery({...query})
  }else{
    this.setQuery({...query,freezedAt:{$exists:false}})
  }
    next()
})
postSchema.pre(["find","findOne","countDocuments"],function(next){
  const query =this.getQuery();
  if(query.paranoid=== false){
    this.setQuery({...query})
  }else{
    this.setQuery({...query,freezedAt:{$exists:false}})
  }
  next()
})
postSchema.virtual("comments",{
  localField:"_id",
  foreignField:"postId",
  ref:"Comment",
  justOne:true
})

export const PostModel= models.Post || model<IPost>("post",postSchema)