import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import dotenv from "dotenv"
dotenv.config();

const PEPPER=process.env.PEPPER;

const id=Schema.Types.ObjectId;

const userSchema=new Schema({
    UserId:id,
    Name:{type:String,Required:true},
    Email:{type: String,required: true, unique: true,match:/\.com$/},  
    PhoneNumber:{type:String,required:true},
    Password:{type: String,required: true},
    isphoneVerified:{type:Boolean,default:"false"},
    Otp:{type:String},
    otp_expires:{type:Date},
    createdAt:{type: Date,default:Date.now,immutable:true},
});



//encrypting before saving password .. 
userSchema.pre('save',async function(next){
    console.log(this.Password)
    if(this.isModified("Password")){
    this.Password=await bcrypt.hash(PEPPER+this.Password.trim(),10)
    console.log("password Changed");
    next();}
    else{
        console.log("password unchanged ")
    }
})

const User=mongoose.model("User",userSchema);

//export userModel ..
export default User;


