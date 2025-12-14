import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import './App.css';

import Home from './Components/Home/Pages/Home';
import Profile from './Components/Profile/Pages/Profile';
import Login from './Components/Authentication/Pages/Login';
import Signup from './Components/Authentication/Pages/Signup';
import ForgotPassword from './Components/Authentication/Pages/ForgotPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/auth/login' element={<Login />} />
        <Route path='/auth/signup' element={<Signup />} />
        <Route path='/home/:id' element={<Home />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='*' element={<Navigate to='/auth/login' replace />} />
      </Routes>
    </Router>
  );
}

export default App