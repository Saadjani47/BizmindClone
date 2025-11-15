import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    // The API exposes a protected user preference endpoint at GET /user_preference
    // This route requires a valid Authorization: Bearer <token> header.
    api.get('/user_preference')
      .then(res => {
        if (!mounted) return
        // store preference and include a small user placeholder using the token-stored id
        setUser({ email: user?.email || 'current user', preferences: res.data })
      })
      .catch(err => {
        // If preferences are not found (404), allow the user to create them instead of showing an error
        const status = err.response?.status
        const body = err.response?.data
        if (status === 404 && body && body.error && body.error.toLowerCase().includes('preferences not found')) {
          if (!mounted) return
          setUser({ email: user?.email || 'current user', preferences: null })
          return
        }
        setError(err.response?.data || err.message)
      })
    return () => { mounted = false }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  const [showCreate, setShowCreate] = useState(false)
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('en')
  const [creating, setCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTheme, setEditTheme] = useState('light')
  const [editLanguage, setEditLanguage] = useState('en')
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleCreate = async e => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const res = await api.post('/user_preference', { user_preference: { theme, language } })
      setUser({ email: user?.email || 'current user', preferences: res.data })
      setShowCreate(false)
    } catch (err) {
      setError(err.response?.data || err.message)
    } finally {
      setCreating(false)
    }
  }

  const startEdit = () => {
    setEditTheme(user?.preferences?.theme || 'light')
    setEditLanguage(user?.preferences?.language || 'en')
    setIsEditing(true)
  }

  const handleEditSubmit = async e => {
    e.preventDefault()
    setUpdating(true)
    setError(null)
    try {
      const res = await api.put('/user_preference', { user_preference: { theme: editTheme, language: editLanguage } })
      setUser({ email: user?.email || 'current user', preferences: res.data })
      setIsEditing(false)
    } catch (err) {
      setError(err.response?.data || err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete your preferences?')) return
    setDeleting(true)
    setError(null)
    try {
      await api.delete('/user_preference')
      setUser({ email: user?.email || 'current user', preferences: null })
    } catch (err) {
      setError(err.response?.data || err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (error) return <div>Error: {JSON.stringify(error)}</div>
  return (
    <div>
      <h2>Dashboard (Protected)</h2>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          {' '}
          {!user.preferences ? (
            <>
              <button onClick={() => setShowCreate(s => !s)} style={{ marginLeft: 8 }}>{showCreate ? 'Cancel' : 'Create Preferences'}</button>
              {showCreate && (
                <form onSubmit={handleCreate} style={{ marginTop: 8 }}>
                  <div>
                    <label>Theme</label>
                    <br />
                    <select value={theme} onChange={e => setTheme(e.target.value)}>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <div>
                    <label>Language</label>
                    <br />
                    <select value={language} onChange={e => setLanguage(e.target.value)}>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                  <button type="submit" disabled={creating} style={{ marginTop: 8 }}>{creating ? 'Creating...' : 'Create'}</button>
                </form>
              )}
            </>
          ) : (
            <div style={{ marginTop: 8 }}>
              <div><strong>Preferences</strong></div>
              <div>Theme: {user.preferences.theme}</div>
              <div>Language: {user.preferences.language}</div>
              {!isEditing ? (
                <div style={{ marginTop: 8 }}>
                  <button onClick={startEdit} style={{ marginRight: 8 }}>Edit</button>
                  <button onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} style={{ marginTop: 8 }}>
                  <div>
                    <label>Theme</label>
                    <br />
                    <select value={editTheme} onChange={e => setEditTheme(e.target.value)}>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <div>
                    <label>Language</label>
                    <br />
                    <select value={editLanguage} onChange={e => setEditLanguage(e.target.value)}>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <button type="submit" disabled={updating} style={{ marginRight: 8 }}>{updating ? 'Saving...' : 'Save'}</button>
                    <button type="button" onClick={() => setIsEditing(false)} disabled={updating}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}
