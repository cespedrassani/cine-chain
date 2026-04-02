import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  auth: {
    username: import.meta.env.VITE_API_USER ?? "",
    password: import.meta.env.VITE_API_PASSWORD ?? "",
  },
});

export default api;
