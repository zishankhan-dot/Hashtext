import { Router } from "express";
import { sendMessage, fetchMessages } from "../Middleware/messageController.js";
import { checkTokenShareUserDetail } from "../Middleware/userConroller.js";

const Messagesrouter = Router();

Messagesrouter.post("/sendMessage", checkTokenShareUserDetail, sendMessage);
Messagesrouter.get("/fetchMessage", checkTokenShareUserDetail, fetchMessages);

export default Messagesrouter;
