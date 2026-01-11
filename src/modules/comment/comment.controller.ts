import { Router } from "express";
import { authintcation } from "../../midelware/authintcition.middelware";
import commentSerives from "./comment.serives";
import * as validators from "./comment.vaildtion"
import { vailedation } from "../../midelware/validation.midelware";

const router =Router({mergeParams:true});
router.post("/",authintcation(),vailedation(validators.createComment),commentSerives.createComment)
router.post("/:commentId/reply",authintcation(),vailedation(validators.replyOnComment),commentSerives.replyOnComment)
export default router