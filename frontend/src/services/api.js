import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// Attach token from localStorage to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On responses, if the API returns a new token in `authorization` header, store it
api.interceptors.response.use(
  response => {
    const authHeader = response.headers['authorization'] || response.headers['Authorization']
    if (authHeader) {
      // support `Bearer <token>` or raw token
      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader
      if (token) {
        localStorage.setItem('token', token)
        // notify app that auth changed
        try { window.dispatchEvent(new CustomEvent('authChanged', { detail: { authenticated: true } })) } catch (e) {}
      }
    }
    // Fallback: if the API included the token in the JSON body (data.token or data?.data?.token), store it
    try {
      const bodyToken = response?.data?.token || response?.data?.data?.token || null
      if (bodyToken && !localStorage.getItem('token')) {
        localStorage.setItem('token', bodyToken)
        try { window.dispatchEvent(new CustomEvent('authChanged', { detail: { authenticated: true } })) } catch (e) {}
      }
    } catch (e) {
      // ignore parsing errors
    }
    return response
  },
  error => {
    // Optionally handle global errors (401 -> remove token)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      try { window.dispatchEvent(new CustomEvent('authChanged', { detail: { authenticated: false } })) } catch (e) {}
    }
    return Promise.reject(error)
  }
)

export default api
