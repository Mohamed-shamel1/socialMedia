import { Router } from "express";
import { authintcation, authraization } from "../../midelware/authintcition.middelware";
import userService from "./user.service";
import { vailedation } from "../../midelware/validation.midelware";
import * as vaildetors from "../user/user.vailedation"
import { tokenEnum } from "../../utils/secuirty/token.secuirty";
import { endPoint } from "./user.authrization";
import { chatRouter } from "../chat";

const router=Router()

router.use("/:userId/chat",chatRouter)

router.get("/",authintcation(),userService.profile)
router.get("/dashbord",authraization(endPoint.dashbord),userService.dashbord)
router.patch("/:userId/change-role",authraization(endPoint.dashbord),vailedation(vaildetors.changeRole),userService.changeRole)
router.post("/:userId/send-friend-request",authintcation(),vailedation(vaildetors.sendFriendRequest),userService.sendFriendRequest)
router.patch("/accept-friend-request/:requestId",authintcation(),vailedation(vaildetors.acceptFriendRequest),userService.acceptFriendRequest)
router.post("/refresh-token",authintcation(tokenEnum.refresh),userService.refreshToken)      
router.post("/logout",authintcation(),vailedation(vaildetors.logout),userService.logout)      
export default router