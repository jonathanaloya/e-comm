import axios from 'axios';

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export const isTokenExpiringSoon = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    const timeUntilExpiry = payload.exp - now;
    
    return timeUntilExpiry < (TOKEN_REFRESH_THRESHOLD / 1000);
  } catch {
    return true;
  }
};

export const refreshTokenIfNeeded = async () => {
  const token = localStorage.getItem('token');
  
  if (!token || !isTokenExpiringSoon(token)) {
    return token;
  }

  try {
    const response = await axios.post('/api/user/refresh-token', {}, {
      withCredentials: true
    });
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.accessToken);
      return response.data.data.accessToken;
    }
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
  
  return null;
};