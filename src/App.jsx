import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Stats from './pages/Stats';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
<Routes>
  <Route path='/' element={<Navigate to='/login'/>}/>
  <Route path='/home' element={<Home/>}/>
  <Route path='/login' element={<Login/>}/>
  <Route path='/signup' element={<Signup/>}/>
  <Route path='/profile' element={<Profile/>}/>
  <Route path='/stats' element={<Stats/>}/>
</Routes>
    </>
  )
}

export default App
