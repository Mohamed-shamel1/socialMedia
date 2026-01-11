import { HydratedDocument, model, models, Schema, Types } from "mongoose";
export enum GenderEnum{
    male="male",
    female="female"
}
export enum RoleEnum{
    user="user",
    admin="admin",
    superAdmin="super-admin"
}
export enum ProviderEnum{
    GOOGLE="GOOGLE",
    SYSTEM="SYSTEM"
}

export interface IUser{
    _id:Types.ObjectId,


    firstName:string,
    lastName:string,
    userName?:string,

          extra:{
        name:string
      },
 

    email:string,
    confirmEmailOtp?:string,
    confirmetAt?:Date,

    password:string,
    resertPassword?:string
    chengeCredantialTime?:string,

    phone?:string
    address?:string

    gender:GenderEnum,
    role:RoleEnum

   profileImage?:string
   coverImages?:string[]

    slug:string
    provider:ProviderEnum


    freezedAt?:Date
    freezedBy?:Types.ObjectId

    frindes?:Types.ObjectId[]

    createdAt:Date,
    updatedAt?:Date
}

const userSchema= new Schema<IUser>(
    {
      firstName:{type:String,required:true,minLength:2,maxlength:25},
      lastName:{type:String,required:true,minLength:2,maxlength:25},
      slug:{type:String,required:true,minLength:5,maxlength:52},
      extra:{
        name:String
      },
 

    email:{type:String,required:true,unique:true},
    confirmEmailOtp:{type:String},
    confirmetAt:{Date},

    password:{type:String,required:function(){
        return this.provider=== ProviderEnum.GOOGLE ? false :true
    }},
    resertPassword:{type:String},
    chengeCredantialTime:{type:Date},

    phone:{type:String},
    address:{type:String},


     profileImage:{type:String},
     coverImages:[String],
    gender:{type:String,enum:GenderEnum,default:GenderEnum.male},
    role:{type:String,enum:RoleEnum,default:RoleEnum.user},
    provider:{type:String,enum:ProviderEnum,default:ProviderEnum.SYSTEM},


    freezedAt:Date,
    freezedBy:{type:Schema.Types.ObjectId,ref:"User"},
    frindes:[{type:Schema.Types.ObjectId,ref:"User"}]

    },
    {
        timestamps:true,
        toJSON:{virtuals:true},
        toObject:{virtuals:true}

    })


   userSchema.virtual("userName").set(function(value:string){
    const [firstName,lastName]=value.split(" ")||[]
    this.set({firstName,lastName,slug:value.replaceAll(/\s+/g,"-")})
   }).get(function(){
    return this.firstName + " " + this.lastName;
   })



userSchema.pre(["find","findOne"],function(next){
  const query =this.getQuery();
  if(query.paranoid=== false){
    this.setQuery({...query})
  }else{
    this.setQuery({...query,freezedAt:{$exists:false}})
  }
  next()
})

   export const UserModel =models.User || model<IUser>("User",userSchema)
export type HUserDocument=HydratedDocument<IUser>
