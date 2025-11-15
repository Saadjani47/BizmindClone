import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    try {
  // Rails Devise-based API expects POST /signup and POST /login under /api/v1
  // The API namespace is provided by the axios baseURL, so use the path '/login'
  const res = await api.post('/login', { user: { email, password } })
      // token is saved by interceptor if returned in Authorization header
      const token = localStorage.getItem('token')
      if (token) {
        navigate('/dashboard')
      } else {
        setError('Login succeeded but token not found in response headers.')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <br />
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
