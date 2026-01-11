import { JwtPayload } from "jsonwebtoken";
import { HUserDocument } from "../../DB/model/user.models";
import { Socket } from "socket.io";

export interface IAuthSocket extends Socket {
  credential?: {
    user: Partial<HUserDocument>;
    decoded: JwtPayload;
  };
}