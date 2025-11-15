import React, { useState } from 'react'
import api from '../services/api'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    try {
      // Devise registration path_names used password: 'forgot_password' in routes
      const res = await api.post('/forgot_password', { user: { email } })
      setMessage('If an account exists for that email, you will receive reset instructions.')
    } catch (err) {
      setError(err.response?.data || err.message)
    }
  }

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <br />
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <button type="submit">Send reset instructions</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{JSON.stringify(error)}</p>}
    </div>
  )
}
