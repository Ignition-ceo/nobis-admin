import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://backend-api.getnobis.com/api/v2";

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("sa_token");
  console.log("sa_token present:", !!token, token ? token.substring(0, 30) + "..." : "MISSING");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    console.error("API error:", error.response?.status, error.response?.data);
    // Removed auto-redirect to stop the 401 loop
    return Promise.reject(error);
  }
);
