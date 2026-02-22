import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://backend-api.getnobis.com/api/v2";

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(async (config) => {
  // Get token from Auth0
  const token = localStorage.getItem("sa_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("sa_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
