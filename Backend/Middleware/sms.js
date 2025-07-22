import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config();


//utility function to send otp through sms using api .. 
//this function take recepient phone number along with message/otp 
export const sendSms=async (phonenumber,message)=>{
        const url = "https://www.cloud.smschef.com/api/send/sms"
        const form = new FormData();
        form.append("secret", process.env.SMS_API_KEY);
        form.append("mode", "devices");
        form.append("phone", phonenumber);
        form.append("message", message);
        form.append("device", process.env.Device);
        form.append("sim", 2);

         try {
    const response = await axios.post(url, form, { headers: form.getHeaders() });
    console.log("SMSChef Success:", response.data);
    return response.data;
  } catch (error) {
    console.error("SMSChef Error:", error.response?.data || error.message);
    throw error;
  }
};




export default sendSms;