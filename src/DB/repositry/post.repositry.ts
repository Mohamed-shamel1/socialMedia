import { DatabaseRebosatory, lean } from "./database.repository";
import {IPost as TDocument} from "../model/post.model"
import { HydratedDocument, Model, PopulateOptions, ProjectionType, QueryOptions, RootFilterQuery } from "mongoose";
import { CommentRepositry } from "./comment.repositry ";
import { CommentModel } from "../model/comment.model ";


export class PostRepositry extends DatabaseRebosatory<TDocument>{
        private commentModel=new CommentRepositry(CommentModel)

    constructor (protected override readonly  model:Model<TDocument>) {
        super(model)

    }
     async findcursor({
        filter,
        select,
        options,
       }:{
        filter?:RootFilterQuery<TDocument>
        select?:ProjectionType<TDocument>|undefined;
        options?:QueryOptions<TDocument>| undefined;
       }):Promise<HydratedDocument<TDocument>[] |[] |lean<TDocument>[]|any>{  
        let result=[]
          const cursor = this.model.find(filter||{})
          .select(select ||"")
          .populate(options?.populate as PopulateOptions[]).cursor()
          for(
            let doc =await cursor.next();
            doc !=null;
            doc = await cursor.next()
          ){
            const comment = await this.commentModel.find({filter:{postId:doc._id,commentId:{$exists:false}}})
            result.push({post:doc,comment})
          }
        return result;
       }
}