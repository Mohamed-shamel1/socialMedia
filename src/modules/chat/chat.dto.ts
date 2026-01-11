import { Server } from "socket.io";
import { IAuthSocket } from "../getwaye/getwaye.interface";
import z from "zod";
import { createChatingGroup, getChat, getChatingGroup } from "./chat.vaildtion";


export type IGetChatParamsDto=z.infer<typeof getChat.params>
export type IGetChatGroupParamsDto=z.infer<typeof getChatingGroup.params>
export type IGetChatQueryParamsDto=z.infer<typeof getChat.query>
export type ICreateChatingGroupParamsDto=z.infer<typeof createChatingGroup.body>
export interface IMainDto{
    socket:IAuthSocket,
    callback?:any,
    io?:Server
}
export interface ISayHiDto extends IMainDto{
    message:string,
    
}
export interface ISendMessageDto extends IMainDto{
    content:string,
    sendTo:string,
    
}
export interface ISendGroupMessageDto extends IMainDto{
    content:string,
    groupId:string
    
}
export interface IJoinRoomDto extends IMainDto{
  roomId:string
    
}