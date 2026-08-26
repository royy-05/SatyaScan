import axios from "axios";
import { toast } from "sonner";
import { getDeviceFingerprint } from "../utils/fingerprint.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

let inMemoryToken = null;
let refreshTokenHandler = null;

export function setAccessToken(token) {
  inMemoryToken = token;
}

export function getAccessToken() {
  return inMemoryToken;
}

export function registerRefreshTokenHandler(handler) {
  refreshTokenHandler = handler;
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Access Token and Device Fingerprint
apiClient.interceptors.request.use(
  async (config) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    
    try {
      const fingerprint = await getDeviceFingerprint();
      config.headers["X-Device-Fingerprint"] = fingerprint;
    } catch (err) {
      console.warn("Failed to get device fingerprint", err);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Envelope Unwrap & 401 Auto-Refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Unwrap response envelope if success is true
    if (response.data && response.data.success !== undefined) {
      if (response.data.success) {
        return response.data;
      } else {
        const errObj = response.data.error || {};
        toast.error(errObj.message || "An error occurred");
        return Promise.reject(errObj);
      }
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/refresh")) {
        return Promise.reject(error.response?.data?.error || error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        if (refreshTokenHandler) {
          const newToken = await refreshTokenHandler();
          if (newToken) {
            setAccessToken(newToken);
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const errMessage = error.response?.data?.error?.message || error.message || "Network Error";
    if (error.response?.status !== 401) {
      toast.error(errMessage);
    }

    return Promise.reject(error.response?.data?.error || error);
  }
);
