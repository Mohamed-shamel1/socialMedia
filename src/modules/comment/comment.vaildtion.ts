import { z} from "zod"
import { genralField } from "../../midelware/validation.midelware"


export const createComment={
    params:z.strictObject({postId:genralField.id}),
    body:z.strictObject({
          conntent:z.string().min(2).max(5000000).optional(),
          atachments:z.array(z.any()).max(2).optional(),

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

export const replyOnComment={
  params:createComment.params.extend({
    commentId:genralField.id
  }),
  body:createComment.body
}

