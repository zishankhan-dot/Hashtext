import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api', // Backend API base
  withCredentials: true, // Needed if using cookies/JWT
  headers: {
    'Content-Type': 'application/json'
  }
});


export default axiosInstance;
