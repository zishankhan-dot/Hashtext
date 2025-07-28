import React from 'react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// import './dashboard.css';
import axios from '../api/axiosInstance'; // Adjust the import based on your project structure

const Dashboard = () => {
  const [Number, setNumber] = useState(0);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  
  const handleCheckNumber= async (e) => {
    e.preventDefault();
    try { 
      const response=await axios.get(`/User/checkNumber?PhoneNumber=${Number}`);
      if(response.status === 200 && response.data.PublicKey) {
        localStorage.setItem('receiverPhoneNumber', Number);
        navigate('/messages');
      } else {
        setMessage('Phone number not registered. Please register first.');    
      }
    } catch (err) {
      console.error('Error checking phone number:', err);
      setMessage('An error occurred while checking the phone number.');
    }
  };

  return (
 <div className="dashboard-container">

      <div className="main-content">
        <h1>Check User by Phone Number</h1>
        <form onSubmit={handleCheckNumber}>
          <input
            type="string"
            placeholder="Enter Phone Number"
            onChange={(e) => setNumber(e.target.value)}
            required
          />
          <button type="submit">Message</button>
        </form>
        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
};

export default Dashboard;