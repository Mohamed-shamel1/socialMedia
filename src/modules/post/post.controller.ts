import { authintcation } from "../../midelware/authintcition.middelware";
import {postService} from "./post.service";
import { Router } from "express";
import * as vaildators from "./post.vailedition"
import { vailedation } from "../../midelware/validation.midelware";
import { commentRouter } from "../comment";

const router = Router()
router.use("/:postId/comment",commentRouter)

router.get("/",authintcation(),postService.postList)
router.post("/",authintcation(),vailedation(vaildators.createPost),postService.createPost)
router.patch("/:postId/like",authintcation(),vailedation(vaildators.likePost),postService.likePost)
router.patch("/:postId",authintcation(),vailedation(vaildators.updatePost),postService.updatePost)

export default router