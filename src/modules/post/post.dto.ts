import {z} from "zod"
import { likePost } from "./post.vailedition"

export type LikePOstQueryInputDto= z.infer<typeof likePost.query>