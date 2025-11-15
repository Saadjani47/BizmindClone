import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/PrivateRoute'
import ResetPassword from './pages/ResetPassword'
import ResetPasswordConfirm from './pages/ResetPasswordConfirm'

export default function App() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    const onAuthChanged = e => {
      // support both CustomEvent and Storage events
      if (e?.detail && typeof e.detail.authenticated !== 'undefined') {
        setIsAuthenticated(!!e.detail.authenticated)
      } else {
        setIsAuthenticated(!!localStorage.getItem('token'))
      }
    }
    window.addEventListener('authChanged', onAuthChanged)
    window.addEventListener('storage', onAuthChanged)
    return () => {
      window.removeEventListener('authChanged', onAuthChanged)
      window.removeEventListener('storage', onAuthChanged)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { authenticated: false } }))
    navigate('/')
  }

  return (
    <div>
      <nav style={{ padding: 12 }}>
        
        {!isAuthenticated ? (
          <>
            <Link to="/">Home</Link> {' | '}
            <Link to="/login">Login</Link> {' | '}
            <Link to="/signup">Signup</Link>
          </>
        ) : (
          <>
            <button onClick={handleLogout}>Logout</button> {' | '}
            <Link to="/forgot-password">Reset Password</Link> {' | '}
            <Link to="/dashboard">Dashboard</Link>
          </>
        )}
        
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<h2>Welcome to Bizmind (React)</h2>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ResetPassword />} />
              <Route path="/reset-password" element={<ResetPasswordConfirm />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  )
}
