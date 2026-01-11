import { Server } from "socket.io";
import { IAuthSocket } from "../getwaye/getwaye.interface";
import { ChatServiec } from "./chat.service";

export class ChatEvent {
    private chatService:ChatServiec =new ChatServiec()
  constructor() {}
  sayHi = (socket: IAuthSocket,io :Server) => {
    return socket.on("sayHi", (message:string, callback) => {
       return this.chatService.sayHi({message,socket,callback,io})
     
    });
  };
  sendMessage = (socket: IAuthSocket,io :Server) => {
    return socket.on("sendMessage", (data:{content:string,sendTo:string}) => {
       return this.chatService.sendMessage({...data,socket,io})
     
    });
  };
  joinRoom = (socket: IAuthSocket,io :Server) => {
    return socket.on("join_room", (data:{roomId:string}) => {
       return this.chatService.joinRoom({...data,socket,io})
     
    });
  };
  sendGroupMessage = (socket: IAuthSocket,io :Server) => {
    return socket.on("sendGroupMessage", (data:{content:string,groupId:string}) => {
       return this.chatService.sendGroupMessage({...data,socket,io})
     
    });
  };
  // sayHi2 = (socket: IAuthSocket) => {
  //   return socket.on("sayHi2", (data, callback) => {
  //     console.log({ data });
  //     callback("Hello from BE to FE");
  //   });
  // };
}
