import {z} from "zod";
import { logout } from "./user.vailedation";


export type ILogoutDto =z.infer<typeof logout.body>