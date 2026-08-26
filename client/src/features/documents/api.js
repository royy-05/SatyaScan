import { apiClient } from "../../api/client";

export const documentsApi = {
  list: (params) => apiClient.get("/documents", { params }),
  getById: (id) => apiClient.get(`/documents/${id}`),
  reverify: (id) => apiClient.post(`/documents/${id}/reverify`),
  getDocTypes: () => apiClient.get("/config/doc-types"),
  faceVerify: (id, formData) =>
    apiClient.post(`/documents/${id}/face-verify`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
