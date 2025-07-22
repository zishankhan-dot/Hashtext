import  express,{Router} from 'express'
import { VerifyOtp ,Register,Login} from '../Middleware/userConroller.js';

const userRouter=express.Router();
//register 
userRouter.post("/Register",Register)
//Otp verify 
userRouter.post("otpVerify",VerifyOtp)
//login
userRouter.post("Login",Login)


export default userRouter;