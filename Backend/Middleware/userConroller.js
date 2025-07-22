import User from "../Model/userModel.js";
import sendSms from "../middleware/sms.js";
import random from 'randomstring';
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import dotenv from 'dotenv'
dotenv.config();
// getting secret key from .env 
const SECRETKEY=process.env.SECRETKEY;
//getting Pepper from .env
const PEPPER= process.env.PEPPER;



/*This file contain utility function for user Registration , Login 
and verification for otp .. 
it also contain one middleware function that 
checks for valid token and share token details to next middleware .. 

To Authenticate User we are using otp based verification 
we will be using random library to generate random 6 digit number and will send that to User's given mobile number using Cloundsmschef 

*/

// middleware to create new user 

export const Register=async (req,res)=>{
    const {Name,Email,PhoneNumber,Password,ConfirmPassword}=req.body;
    console.log(req.body)
    console.log(Name,Email,PhoneNumber,Password,ConfirmPassword);
    const existingUser=await User.findOne({Email});
    if(!Password||!Email){
        return res.status(400).json({message:"Error Email or password"})
    }
    
    else if(existingUser){
       return  res.status(400).json({message:"USER ALREADY EXIST !!"})
    }
    else{
        try{
        const newUser=new User({Name,Email,PhoneNumber,Password});
        //creating otp 
        const otp = random.generate({length:6,charset:'numeric'});
        console.log(otp)
        const otpHashed=crypto.createHash('SHA256').update(otp).digest('hex');
        console.log(otpHashed);
        //saving it 
        newUser.Otp=otpHashed;
        newUser.otp_expires= new Date(Date.now()+5*60*1000);
        const text=`OTP FOR HashText : ${otp}`;
        console.log(text);
        //sending otp to mobile phone 
        await sendSms(PhoneNumber,text);
        await newUser.save();
        return  res.status(200).json({message:"User Created"})}
        catch(err){
            console.error(err);
          return  res.status(400).json({message:"User Registration failed !!"});
        }

    }
    

}
//middleware to validate otp and create token ... using jwt to create token  
export const VerifyOtp=async(req,res)=>{
    const {otp,PhoneNumber}=req.body;
    
    if(!otp){return res.status(400).json({message:"Enter Valid otp"})}
    else {
        const isUser=await User.findOne({PhoneNumber});
        if(!isUser){
           return  res.status(400).json({message:"UserDont Exist"})
        }
        const otpHashed = crypto.createHash('SHA256').update(otp).digest('hex');
        console.log(otpHashed.toString())
        console.log(new Date(Date.now()).toISOString());
        console.log(new Date(isUser.otp_expires.getTime()).toISOString());
        if( isUser.otp_expires.getTime()<Date.now() || otpHashed.toString() !=isUser.Otp){
          return   res.status(400).json({message:"OTP INVALID OR EXPIRED"})
        
        }
        else{
            isUser.isphoneVerified=true;
            isUser.Otp=null;
            isUser.otp_expires=null;
            await isUser.save();
            const token= jwt.sign({
                User:isUser._id,
                Email:isUser.Email,
                PhoneNumber:isUser.PhoneNumber},SECRETKEY,{expiresIn:'1h'});
            res.cookie("auth",token,{maxAge:3600000});
         return   res.status(200).json({ message: "OTP verified successfully", token });


        }
        
    }
}


// middleware to validate user and create token 
export const Login=async (req,res)=>{
   const {Email,Password}=req.body;
   if(!Email || !Password){return res.status(400).json({message:"Please input mail and password !!"})}

// checking for user in User table 
   const isUser= await User.findOne({Email})
   console.log(Password)
   if(!isUser){return res.status(402).json({message:"EMAIL NOT FOUND!!"})}
   console.log(PEPPER)
  console.log(isUser)
   const isPassword=await bcrypt.compare(PEPPER+Password.trim(), isUser.Password);
   console.log(isPassword)
   if(!isPassword){return res.status(402).json({message:"PASSWORD INCORRECT!!"})}
   if(isUser.isphoneVerified !=true){return res.status(400).json({message:"FIRST VERIFY PHONENUMBER"})}
   const token=jwt.sign({
    userId:isUser._id,
    Email:isUser.Email,
    PhoneNumber:isUser.PhoneNumber
   },SECRETKEY,{expiresIn:"2h"});

   /// setting token to cookie ..
   res.cookie("authorization",token,{
    maxAge:3600000  // 60 mins 60*60*100
   })
  return res.status(200).json({
    message:"login successful",
    role:"User"

   })
}

// Middleware to check token and also it shares the user_id to next middle ware 
export const checkTokenShareUserDetail=(req,res,next)=>{
    const token=req.cookies.authorization;
    //checking cookie 
    console.log(req.cookies);
    if(!token){
        return res.status(402).json({message:"token not found , login again!!!!"})
    }
    try{
       const decode= jwt.verify(token,SECRETKEY)
        req.userData=decode;
        console.log("successfull verification !!");
        console.log(decode)
        next();
    
    }
    catch(error){
        console.log(error)
        return res.status(402).json({message:"failed token verification !! login again"})
         
         
    }
}