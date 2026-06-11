/**
 * Axios API istemci konfigürasyonu.
 * Tüm HTTP istekleri bu merkezi instance üzerinden yapılır.
 * Cookie-based JWT auth için withCredentials aktif.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // httpOnly cookie'lerin otomatik gönderilmesi için zorunlu
  withCredentials: true,
});

export default api;
