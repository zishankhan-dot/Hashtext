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
const allowedOrigins = [
    'http://localhost:3000', // Local development HTTP
    'https://localhost:3000', // Local development HTTPS
    'http://127.0.0.1:3000', // Alternative localhost
    'https://127.0.0.1:3000', // Alternative localhost HTTPS
    process.env.FRONTEND_URL, // Production frontend URL from environment
];

express_api.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true
}))


//parsing
express_api.use(express.json())
express_api.use(cookieParser()); // for parsing cookies
//Port from env
const PORT=process.env.PORT || 3001

// Trust proxy for Azure App Service
express_api.set('trust proxy', 1);

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
    express_api.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}


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
