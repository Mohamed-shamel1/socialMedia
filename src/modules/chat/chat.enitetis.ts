import { HChatDocument } from "../../DB/model/chat.model";

export interface IGetChatResponse {
    chat:Partial<HChatDocument>
}