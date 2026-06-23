/**
 * Token cookie'den oku Authorization header'a ekle.
 */

import axios from 'axios';
import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'access_token';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_COOKIE_NAME);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { TOKEN_COOKIE_NAME };
export default api;
