import  express,{Router} from 'express'
import { VerifyOtp ,Register,Login, savepublicKey,getUserByPhoneNumber,checkTokenShareUserDetail,getUserByToken} from '../Middleware/userConroller.js';

const userRouter=express.Router();
//register 
userRouter.post("/Register",Register)
//Otp verify 
userRouter.post("/OtpVerify",VerifyOtp)
//login
userRouter.post("/Login",Login)
//saving public key 
userRouter.post("/SavePublicKey",savepublicKey);
//check number and return public key for given phone number 
userRouter.get("/checkNumber",getUserByPhoneNumber);
//check token and share user details to next middleware and then return public key for given user
userRouter.get("/myPublicKey",checkTokenShareUserDetail,getUserByToken);


export default userRouter;