import mongoose from  "mongoose";
import User from "./userModel.js";

const Schema=mongoose.Schema;

const MessageSchema=new Schema({
    userId:{type:Schema.Types.ObjectId,
        required:true,
        ref: User
    },
    senderNumber:{type:String},
    receiverNumber:{type:String},
    encryptedMessageReceiver:{type:String},
    encryptedMessageSender:{type:String},
    timestamp:{type:Date,default:Date.now,immutable:true}
})
 
export default  mongoose.model("Messages",MessageSchema)