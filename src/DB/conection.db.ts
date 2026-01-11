import { connect } from "mongoose";
import { UserModel } from "./model/user.models";


const conectDB = async():Promise<void>=>{


    try {
        const result =await connect(process.env.DB_URI as string,{
            serverSelectionTimeoutMS:30000,

        })
        await    UserModel.syncIndexes()
        console.log(result.models);
        console.log("DB conected sucssesfully ✅");
        
        
    } catch (error) {
        console.log("Fail to connect on DB ❌");
        
    }
}
export default conectDB