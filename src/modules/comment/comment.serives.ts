import type{ Request, Response } from "express"
import { CommentRepositry } from "../../DB/repositry/comment.repositry "
import { CommentModel } from "../../DB/model/comment.model "
import { allowCommentEnum, PostModel } from "../../DB/model/post.model"
import { UserModel } from "../../DB/model/user.models"
import { UserRepostoriy } from "../../DB/repositry/user.repository"
import { PostRepositry } from "../../DB/repositry/post.repositry"
import { BadRequastExption, NotFoundExption } from "../../utils/response/error.response"
import { Types } from "mongoose"
import { postAvailabiltey } from "../post"

class CommentServise{
    constructor() {}
    private userModel =new UserRepostoriy(UserModel)
    private postModel =new PostRepositry(PostModel)
    private commentModel =new CommentRepositry(CommentModel)
    createComment=async(req:Request,res:Response):Promise<Response>=>{
        const {postId}=req.params as unknown as {postId:Types.ObjectId}
        const post = await this.postModel.find({
            filter:{
                _id:postId,
                allowComment:allowCommentEnum.allow,
                $or:postAvailabiltey(req)
            }
        })
        if(!post){
            throw new NotFoundExption("fail to match result")
        }

            if(req.body.tags?.length&&
                (await this.userModel.find({
                    filter:{_id:{$in:req.body.tags,$ne:req.user?._id}}})).length !== req.body.tags.length
            ){
                throw new NotFoundExption("some of the mienthined user are not esixt ")
            }

            let attachments:string[] =[]

            const [comment]=await this.commentModel.create({
                data:[
                 {  
                    postId,
                    ...req.body,  
                    attachments,
                    createdBy:req.user?._id
                }
                ]
            })||[]

            if(!comment){
           throw new BadRequastExption("fail to create this comment")
            }

            return res.status(201).json({message:"Done"})
        }


    replyOnComment=async(req:Request,res:Response):Promise<Response>=>{
        const {postId,commentId}=req.params as unknown as {postId:Types.ObjectId,commentId:Types.ObjectId}
        const comment = await this.commentModel.findOne({
            filter:{
                _id:commentId,
               postId,
            },
            options:{
                populate:[
                    {
                        path:"postId",
                        match:{
                             allowComment:allowCommentEnum.allow,
                             $or:postAvailabiltey(req)
                        }
                    }
                ]
            }
        })
        if(!comment?.postId){
            throw new NotFoundExption("fail to match result")
        }

            if(req.body.tags?.length&&
                (await this.userModel.find({
                    filter:{_id:{$in:req.body.tags,$ne:req.user?._id}}})).length !== req.body.tags.length
            ){
                throw new NotFoundExption("some of the mienthined user are not esixt ")
            }

            let attachments:string[] =[]

            const [reply]=await this.commentModel.create({
                data:[
                 {  
                    postId,
                    commentId,
                    ...req.body,  
                    attachments,
                    createdBy:req.user?._id
                }
                ]
            })||[]

            if(!reply){
           throw new BadRequastExption("fail to create this comment")
            }

            return res.status(201).json({message:"Done"})
        }

}
export default new CommentServise()