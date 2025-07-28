import React from 'react';
import Register from "../pages/register_login.jsx";
import Dashboard from '../pages/dashboard.jsx';
import Message from '../pages/message.jsx';
import { Routes, Route, Navigate } from 'react-router-dom';
function App() {
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}} >
      
        <Routes>
          <Route path='/Authenticate' element={<Register/>}></Route>
        //  <Route path='/Dashboard' element={<Dashboard/>}></Route>
          <Route path='/Dashboard' element={<Dashboard/>}></Route>
          <Route path='/' element={<Navigate to="/Dashboard" replace />} />
          <Route path='*' element={<Navigate to="/Dashboard" replace />} />
          <Route path='/messages' element={<Message/>}></Route>
        </Routes>
  
      
      
    </div>
  );
}

export default App;
