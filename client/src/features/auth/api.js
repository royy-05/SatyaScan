import { apiClient } from "../../api/client";

export const authApi = {
  login: (credentials) => apiClient.post("/auth/login", credentials),
  refresh: (refreshToken) => apiClient.post("/auth/refresh", { refreshToken }),
  logout: (refreshToken) => apiClient.post("/auth/logout", { refreshToken }),
  registerSubmitter: (data) => apiClient.post("/auth/register/submitter", data),
  registerOfficer: (data) => apiClient.post("/auth/register/officer", data),
  me: () => apiClient.get("/auth/me"),
};
