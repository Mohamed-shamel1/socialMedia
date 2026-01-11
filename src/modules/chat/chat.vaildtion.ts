import z, { coerce } from "zod";
import { genralField } from "../../midelware/validation.midelware";

export const getChat= {
    params:z.strictObject({
        userId:genralField.id
    }),
    query:z.strictObject({
        page:coerce.number().int().min(1).optional(),
        size:coerce.number().int().min(1).optional()
    })
}
export const getChatingGroup= {
    params:z.strictObject({
        groupId:genralField.id
    }),
    query:getChat.query
}

export const createChatingGroup={
    body:z.strictObject({
        
        participants:z.array(genralField.id).min(1),
        group:z.string().min(2).max(5000)
    
    }).superRefine((data,ctx)=>{
          if(data.participants?.length && data.participants?.length !== [...new Set(data.participants)].length ){
          ctx.addIssue({
            code:"custom",
            path:["participants"],
            message:"Duplaceted taged user"

          })

        }

    })
}