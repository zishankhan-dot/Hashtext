//import calls 
import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose';
import userRouter from "./Routes/userRouter.js"
import Messagesrouter from "./Routes/MessageRouter.js";
import cookieParser from 'cookie-parser';


//initiallizing 
const express_api=express();
dotenv.config();


//cors  for frontend
express_api.use(cors({
    origin: 'http://localhost:3000',
  credentials: true
}))


//parsing
express_api.use(express.json())
express_api.use(cookieParser()); // for parsing cookies
//Port from env
const PORT=process.env.PORT


//mongodb connection 
mongoose.connect(process.env.URI)
.then(()=>{console.log("CONNECTED TO DB")})
.catch((err)=>{console.error(err)});




//Routes 
express_api.use("/api/User",userRouter)
express_api.use("/api/messages",Messagesrouter)


//server
express_api.listen(PORT,()=>{
    console.log(`server error at ${PORT}`);
})
