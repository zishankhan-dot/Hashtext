import axios from 'axios';

// Determine the API base URL based on environment
const getBaseURL = () => {
  // Check if we're in development
  if (import.meta.env.DEV) {
    // For local development, always use HTTP unless explicitly configured
    return 'http://localhost:3001/api';
  }
  
  // In production, use environment variable or construct from current location
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For Azure deployment, use the current domain with HTTPS
  const currentDomain = window.location.protocol + '//' + window.location.hostname;
  return `${currentDomain}/api`;
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Needed if using cookies/JWT
  headers: {
    'Content-Type': 'application/json'
  }
});

// Log the base URL for debugging
console.log('API Base URL:', axiosInstance.defaults.baseURL);

export default axiosInstance;
