//import calls 
import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose';
import userRouter from "./Routes/userRouter.js"




//initiallizing 
const express_api=express();
dotenv.config();
//parsing
express_api.use(express.json())
//Port from env
const PORT=process.env.PORT


//mongodb connection 
mongoose.connect(process.env.URI)
.then(()=>{console.log("CONNECTED TO DB")})
.catch((err)=>{console.error(err)});

//cors  for frontend
express_api.use(cors({
    origin: 'http://localhost:3000',
  credentials: true
}))


//Routes 
express_api.use("/api/user",userRouter)


//server
express_api.listen(PORT,()=>{
    console.log(`server error at ${PORT}`);
})
