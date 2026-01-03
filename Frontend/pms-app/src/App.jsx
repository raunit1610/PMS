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
import Money from './Components/Money Management/Pages/Money';
import Diary from './Components/Daily Diary/Pages/Diary';
import Vault from './Components/Links Vault/Pages/Vault';
import Tasks from './Components/Task Management/Pages/Tasks';
import Todo from './Components/To-Do Lists/Pages/Todo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/auth/login' element={<Login />} />
        <Route path='/auth/signup' element={<Signup />} />
        <Route path='/feature/home/:id' element={<Home />} />
        <Route path='/auth/profile' element={<Profile />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/feature/money/:id' element={<Money />} />
        <Route path='/feature/Diary/:id' element={<Diary/>}/>
        <Route path='/feature/Vault/:id' element={<Vault/>}/>
        <Route path='/feature/Tasks/:id' element={<Tasks/>}/>
        <Route path='/feature/Todo/:id' element={<Todo/>}/>
        <Route path='*' element={<Navigate to='/auth/login' replace />} />
      </Routes>
    </Router>
  );
}

export default App