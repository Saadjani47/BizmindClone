import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AUTH_STORAGE_KEY = 'authToken';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const setAuthToken = (token, rememberMe = true) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;

  if (token) {
    storage.setItem(AUTH_STORAGE_KEY, token);
    otherStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    storage.removeItem(AUTH_STORAGE_KEY);
    otherStorage.removeItem(AUTH_STORAGE_KEY);
  }

  setAuthHeader(token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  setAuthHeader(null);
};

export const getAuthToken = () => {
  const token =
    localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
  setAuthHeader(token);
  return token;
};

// Hydrate token on module import so any stored token is reused
getAuthToken();

export default api;