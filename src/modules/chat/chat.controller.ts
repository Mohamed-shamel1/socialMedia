import { Router } from "express";
import { authintcation } from "../../midelware/authintcition.middelware";
import { vailedation } from "../../midelware/validation.midelware";
import * as vaildetors from "./chat.vaildtion";
import { ChatServiec } from "./chat.service";

const chatService: ChatServiec = new ChatServiec();
const router = Router({ mergeParams: true });
router.get(
  "/",
  authintcation(),
  vailedation(vaildetors.getChat),
  chatService.getChat
);
router.post(
  "/group",
  authintcation(),
  vailedation(vaildetors.createChatingGroup),
  chatService.createChatingGroup
);
router.get(
  "/group/:groupId",
  authintcation(),
  vailedation(vaildetors.getChatingGroup),
  chatService.getChatingGroup
);
export default router;
