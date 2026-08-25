import { apiClient } from "../../api/client";

export const adminApi = {
  getUsers: (params) => apiClient.get("/admin/users", { params }),
  createUser: (userData) => apiClient.post("/admin/users", userData),
  updateUser: (id, updateData) => apiClient.patch(`/admin/users/${id}`, updateData),
  getAuditLogs: (params) => apiClient.get("/admin/audit", { params }),
  getStats: () => apiClient.get("/admin/stats"),
};
