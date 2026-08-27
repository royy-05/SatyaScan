import { apiClient } from "../../api/client";

export const adminApi = {
  getUsers: (params) => apiClient.get("/admin/users", { params }),
  getPendingUsers: () => apiClient.get("/admin/users/pending"),
  createUser: (userData) => apiClient.post("/admin/users", userData),
  updateUser: (id, updateData) => apiClient.patch(`/admin/users/${id}`, updateData),
  approveUser: (id) => apiClient.patch(`/admin/users/${id}/approve`),
  rejectUser: (id, data) => apiClient.patch(`/admin/users/${id}/reject`, data),
  getAuditLogs: (params) => apiClient.get("/admin/audit", { params }),
  getStats: () => apiClient.get("/admin/stats"),
};
