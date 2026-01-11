import {Server as HttpServer} from "node:http"
import { Server } from "socket.io";
import { decodeToken, tokenEnum } from "../../utils/secuirty/token.secuirty";
import { IAuthSocket } from "./getwaye.interface";
import { ChatGatWaye } from "../chat";
import { BadRequastExption } from "../../utils/response/error.response";

export const connectedSocket = new Map<string, string[]>();
let io:undefined|Server =undefined 
export const initializeIo=(httpServer:HttpServer)=>{
     io = new Server(httpServer, {
    cors: {
      origin: ["http://127.0.0.1:5500"],
    },
  });
  io.use(async (socket: IAuthSocket, next) => {
    try {
      const { user, decoded } = await decodeToken({
        authrizaition: socket.handshake?.auth.authorization || "",
        tokenType: tokenEnum.acsses,
      });
      const userTaps = connectedSocket.get(user._id.toString()) || [];
      userTaps.push(socket.id);
      connectedSocket.set(user._id.toString(), userTaps);
      socket.credential = { user, decoded };

      next();
    } catch (error: any) {
      next(error);
    }
  });

  function disconnection(socket:IAuthSocket){
    socket.on("disconnect", () => {
      const userId = socket.credential?.user._id?.toString() as string;
      let remainingTaps =
        connectedSocket.get(userId)?.filter((tap: string) => {
          return tap !== socket.id;
        }) || [];
      if (remainingTaps.length) {
        connectedSocket.set(userId, remainingTaps);
      } else {
              connectedSocket.delete(userId);
        getIo().emit("offline_user", userId);
      }
      console.log(`logOut:::`, socket.id);
      console.log({ after_Disconnect: connectedSocket });
    });

  }
  const chatGetWaye:ChatGatWaye=  new ChatGatWaye()
  io.on("connection", (socket: IAuthSocket) => {
    chatGetWaye.register(socket,getIo())

    disconnection(socket)
  });

}
export const getIo =():Server=>{
    if(!io){
        throw new BadRequastExption("Fail to connect stablish server error ")
    }
    return io 
}