import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function ResetPasswordConfirm() {
  const query = useQuery()
  const token = query.get('reset_password_token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    try {
      const payload = {
        user: {
          password,
          password_confirmation: passwordConfirmation,
          reset_password_token: token
        }
      }
      await api.put('/forgot_password', payload)
      // On success, redirect to login page
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.response?.data || err.message)
    }
  }

  if (!token) {
    return <div>Invalid or missing reset token.</div>
  }

  return (
    <div>
      <h2>Set a new password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>New password</label>
          <br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div>
          <label>Confirm password</label>
          <br />
          <input type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} />
        </div>
        <button type="submit">Save</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{JSON.stringify(error)}</p>}
    </div>
  )
}
