import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BUS_API_URL || "http://127.0.0.1:5000/api",
});

// 1. Request Interceptor: Attach the token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Catch 401 Unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is due to an invalid/expired token
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Logging out...");

      // Clear all user data
      localStorage.removeItem("authToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");

      // Dispatch event to update Navbar and Footer instantly
      window.dispatchEvent(new Event("authStateChange"));

      // Redirect to login page only if not already on the auth page
      if (window.location.pathname !== "/auth") {
        sessionStorage.setItem("returnUrl", window.location.pathname + window.location.search);
        window.location.href = "/auth"; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;