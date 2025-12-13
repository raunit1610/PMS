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

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home id='0'/>} />
        <Route path='/profile' element={<Profile />} exact/>
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </Router>
  );
}

export default App