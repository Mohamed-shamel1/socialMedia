import { compare,hash,genSalt } from "bcrypt";
export const generateHash=async(
    plaintext:string,
    saltRound:number=Number(process.env.SALT)
):Promise<string>=>{
    const salt:string=await genSalt(saltRound)
    return await hash(plaintext,salt)
}
export const comperHash=async(
    plaintext:string,
    hash:string
):Promise<boolean>=>{
    return await compare(plaintext,hash)
}