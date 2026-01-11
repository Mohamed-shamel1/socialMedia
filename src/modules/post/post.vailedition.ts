import { z} from "zod"
import { allowCommentEnum, avielablityEnum, likeActionEnum } from "../../DB/model/post.model"
import { genralField } from "../../midelware/validation.midelware"

export const updatePost={
  params:z.strictObject({
    postId:genralField.id
  }),
    body:z.strictObject({
          conntent:z.string().min(2).max(5000000).optional(),
          atachments:z.array(z.any()).max(2).optional(),
          avielablity:z.enum(avielablityEnum).optional(),
          allowComment:z.enum(allowCommentEnum).optional(),
          tags:z.array(
            genralField.id
          ).max(10).optional(),
          removeTags:z.array(
            genralField.id
          ).max(10).optional(),
           
        
    }).superRefine((data,ctx)=>{
        if(!Object.values(data)?.length){
            ctx.addIssue({
                code:"custom",
                message:"all fileds is empty "
            })
        }

        if(data.removeTags?.length && data.tags?.length !== [...new Set(data.removeTags)].length ){
          ctx.addIssue({
            code:"custom",
            path:["removeTags"],
            message:"some user remove tages"

          })

        }

    })
}
export const createPost={
    body:z.strictObject({
          conntent:z.string().min(2).max(5000000).optional(),
          atachments:z.array(z.any()).max(2).optional(),
          avielablity:z.enum(avielablityEnum).default(avielablityEnum.public),
          allowComment:z.enum(allowCommentEnum).default(allowCommentEnum.allow),
          tags:z.array(
            genralField.id
          ).max(10).optional(),
           
        
    }).superRefine((data,ctx)=>{
        if(!data.conntent && ! data.atachments?.length){
            ctx.addIssue({
                code:"custom",
                path:["conntent"], 
                message:"sorry you cant add post without content and atachment "
            })
        }

        if(data.tags?.length && data.tags?.length !== [...new Set(data.tags)].length ){
          ctx.addIssue({
            code:"custom",
            path:["tags"],
            message:"Duplaceted taged user"

          })

        }

    })
}

export const likePost={
  params:z.strictObject({
    postId:genralField.id
  }),
  query:z.strictObject({
    action:z.enum(likeActionEnum).default(likeActionEnum.like)
  })
}