import api, { setAuthToken, clearAuthToken, getAuthToken } from './api';

// Sign up a new user
export const signup = async ({ email, password, confirmPassword }) => {
  const response = await api.post('/api/v1/signup', {
    user: {
      email,
      password,
      password_confirmation: confirmPassword,
    },
  });

  const token = response?.data?.data?.token;
  if (token) setAuthToken(token, true);
  return response.data;
};

// Log a user in
export const login = async ({ email, password, rememberMe = true }) => {
  const response = await api.post('/api/v1/login', {
    user: {
      email,
      password,
    },
  });

  const token = response?.data?.data?.token;
  if (token) setAuthToken(token, rememberMe);
  return response.data;
};

// Request password reset instructions
export const requestPasswordReset = async (email) => {
  const response = await api.post('/api/v1/forgot_password', {
    user: { email },
  });
  return response.data;
};

// Reset password using the token sent via email
export const resetPassword = async ({ token, password, confirmPassword }) => {
  const response = await api.put('/api/v1/forgot_password', {
    user: {
      reset_password_token: token,
      password,
      password_confirmation: confirmPassword,
    },
  });
  return response.data;
};

export const logout = () => {
  clearAuthToken();
};

export const logoutApi = async () => {
  // Rails supports DELETE /api/v1/logout. If it fails, we still clear local token.
  try {
    await api.delete('/api/v1/logout');
  } finally {
    clearAuthToken();
  }
};

export const isAuthenticated = () => Boolean(getAuthToken());

// Expose current token getter for consumers if needed
export const currentToken = () => getAuthToken();
