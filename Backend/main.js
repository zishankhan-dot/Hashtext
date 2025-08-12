//import calls 
import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose';
import userRouter from "./Routes/userRouter.js"
import Messagesrouter from "./Routes/MessageRouter.js";
import cookieParser from 'cookie-parser';
import https from 'https';
import fs from 'fs';


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


// Create HTTPS server for development
const startServer = () => {
    try {
        // Check if SSL certificates exist
        if (fs.existsSync('./ssl/cert.pem') && fs.existsSync('./ssl/key.pem')) {
            const options = {
                key: fs.readFileSync('./ssl/key.pem'),
                cert: fs.readFileSync('./ssl/cert.pem')
            };
            
            https.createServer(options, express_api).listen(PORT, () => {
                console.log(`🔒 HTTPS Server running on port ${PORT}`);
                console.log(`🌐 API available at: https://localhost:${PORT}/api`);
            });
        } else {
            // Fallback to HTTP if certificates don't exist
            express_api.listen(PORT, () => {
                console.log(`🌐 HTTP Server running on port ${PORT}`);
                console.log(`⚠️  Consider enabling HTTPS for production`);
            });
        }
    } catch (error) {
        console.error('Error starting server:', error);
        // Fallback to HTTP
        express_api.listen(PORT, () => {
            console.log(`🌐 HTTP Server running on port ${PORT} (HTTPS failed)`);
        });
    }
};

// Start the server
startServer();
