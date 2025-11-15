import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    if (password !== passwordConfirmation) return setError('Passwords do not match')
    try {
      // Rails Devise-based API expects registration at POST /signup (within the API namespace)
      const res = await api.post('/signup', { user: { email, password, password_confirmation: passwordConfirmation } })
      // token saved by interceptor if returned in Authorization header
      const token = localStorage.getItem('token')
      if (token) {
        navigate('/dashboard')
      } else {
        setError('Signup succeeded but token not found in response headers.')
      }
    } catch (err) {
      setError(err.response?.data?.error || JSON.stringify(err.response?.data) || err.message)
    }
  }

  return (
    <div>
      <h2>Signup</h2>
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
        <div>
          <label>Confirm Password</label>
          <br />
          <input type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} />
        </div>
        <button type="submit">Sign up</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
