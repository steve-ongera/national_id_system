// app.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ApplyId from './pages/ApplyId'
import ApplicationStatus from './pages/ApplicationStatus'
import Profile from './pages/Profile'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'

function App() {
  const token = localStorage.getItem('access_token')
  
  return (
    <Router>
      <div className="app">
        {token && <Navbar />}
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apply-id" element={<ApplyId />} />
            <Route path="/application-status" element={<ApplicationStatus />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App