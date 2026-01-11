import {z} from "zod";
import { logoutEnum } from "../../utils/secuirty/token.secuirty";
import { genralField } from "../../midelware/validation.midelware";
import { RoleEnum } from "../../DB/model/user.models";



export const sendFriendRequest={
       params:z.strictObject({
        userId:genralField.id
    }),
}
export const acceptFriendRequest={
       params:z.strictObject({
        requestId:genralField.id
    }),
}
export const changeRole={
    params:sendFriendRequest.params,
    body:z.strictObject({
        role:z.enum(RoleEnum)
    })
}
export const logout={
    body:z.strictObject({
        flag:z.enum(logoutEnum).default(logoutEnum.only)
    })
}