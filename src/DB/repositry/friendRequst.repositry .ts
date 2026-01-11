import { DatabaseRebosatory } from "./database.repository";
import {IFriendRequst as TDocument} from "../model/frindeRequst.model "
import {  Model } from "mongoose";



export class FriendRequstRepositry extends DatabaseRebosatory<TDocument>{

    constructor (protected override readonly  model:Model<TDocument>) {
        super(model)

    }
    
}