import { RoleEnum } from "../../DB/model/user.models";



export const endPoint ={
   profile:[RoleEnum.user,RoleEnum.admin],
   restoreAcount:[RoleEnum.admin],
   deleteAcount:[RoleEnum.admin],
   dashbord:[RoleEnum.user,RoleEnum.superAdmin],
}