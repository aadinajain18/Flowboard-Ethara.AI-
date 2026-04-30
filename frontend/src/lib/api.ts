import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("flowboard_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("flowboard_token");
      localStorage.removeItem("flowboard_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/**
 * Unwrap API response — extracts `data.data` from axios response
 */
export async function unwrap<T>(promise: Promise<{ data: { success: boolean; data: T } }>): Promise<T> {
  const res = await promise;
  return res.data.data;
}
