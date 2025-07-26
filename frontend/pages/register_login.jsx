import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom'
import './register_login.css'; // Adjust the path based on your project structure



import axios from '../api/axiosInstance'; // Adjust the import based on your project structure

const Register = () => {
  const [form, setForm] = useState({ Name: '', Email: '',PhoneNumber:0,Password: '' ,ConfirmPassword:''});
  const [otpverify,setoptverify]=useState("");
  const [user,setuser]=useState("Register") //Register , otp verify ,  Login
  const [otpsent,setotpsent]=useState(false);
  const [message, setMessage] = useState('');
  const navigate=useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });


// post request when user Registering 
  const handleRegister = async e => {
    e.preventDefault();
    try {
      const response =await axios.post('/User/newUser',form);
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.log('Full response object:', response);
      setMessage('Please verify Otp !!')
      setuser("otp")
      console.log(user);
      setotpsent(true)
      console.log("Registration successful. Moving to OTP phase.");

    } catch (err) {
      console.error(err)
      setMessage('Registration failed: ' + err.response?.data?.message);
    }
  };

  //post request to verify 6-digit otp 
  const handleotp=async (e)=>{
    e.preventDefault();
    try{
     await axios.post('/User/verifyotp',{otp:otpverify,PhoneNumber:form.PhoneNumber});
      setMessage("Otp verified  successfully !!")
      setuser("Login")
      console.log("OTP verified. Moving to login.");


    }
    catch(err){
      setMessage("Otp Verification Failed !!")
    }
  }

  //post request for login to check credentials 
  const handleLogin=async (e)=>{
    e.preventDefault();
    try{
      await axios.post('/User/Login',{Email:form.Email,Password:form.Password});
      setMessage("Login Successful Navigating to Menu")
      
      navigate("/Dashboard")

    }
    catch(err){
      setMessage("Login Failed  !!")
    }
  }
  



  return (
    <div className="container">
    {user === 'Register' && (
      <>
        <div className="toggle-buttons">
          <button onClick={() => setuser('Register')}>Register</button>
          <button onClick={() => setuser('Login')}>Login</button>
        </div>
        <form onSubmit={handleRegister}>
          <h2>Register</h2>
          <input name="Name" placeholder="Name" onChange={handleChange} required />
          <input name="Email" type="email" placeholder="Email" onChange={handleChange} required />
          <input name="PhoneNumber" type="number" placeholder="Phone Number" onChange={handleChange} required />
          <input name="Password" type="password" placeholder="Password" onChange={handleChange} required />
          <input name="ConfirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
          <button type="submit">Register</button>
          {message && <p className="message">{message}</p>}
        </form>
      </>
    )}

    {user === 'Login' && (
      <>
        <div className="toggle-buttons">
          <button onClick={() => setuser('Register')}>Register</button>
          <button onClick={() => setuser('Login')}>Login</button>
        </div>
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <input name="Email" type="email" placeholder="Email" onChange={(e)=>{setForm({...form,Email:e.target.value})}} required />
          <input name="Password" type="password" placeholder="Password" onChange={(e)=>{setForm({...form,Password:e.target.value})}} required />
          <button type="submit">Login</button>
          {message && <p className="message">{message}</p>}
        </form>
      </>
    )}

    {user === 'otp' && (
      <>
        <form onSubmit={handleotp}>
          <h2>Verify OTP</h2>
          <input type="number" placeholder="Enter OTP" onChange={e => setoptverify(e.target.value)} required />
          <button type="submit">Submit</button>
          {message && <p className="message">{message}</p>}
        </form>
      </>
    )}
  </div>
  );
};

export default Register;