import { DatabaseRebosatory } from "./database.repository";
import {IComment as TDocument} from "../model/comment.model "
import { Model } from "mongoose";



export class CommentRepositry extends DatabaseRebosatory<TDocument>{
    
    constructor (protected override readonly  model:Model<TDocument>) {
        super(model)

    }
}