import { apiClient } from "../../api/client";

export const authApi = {
  login: (credentials) => apiClient.post("/auth/login", credentials),
  refresh: (refreshToken) => apiClient.post("/auth/refresh", { refreshToken }),
  logout: (refreshToken) => apiClient.post("/auth/logout", { refreshToken }),
  me: () => apiClient.get("/auth/me"),
};
