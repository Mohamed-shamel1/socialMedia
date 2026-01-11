import { HChatDocument } from "../../DB/model/chat.model";
import { HUserDocument } from "../../DB/model/user.models";

export interface IProfileImageResponse {
  url: string;
}
export interface IUserProfileResponse {
  user: Partial<HUserDocument>;
  groups?: Partial<HChatDocument>[];
}
