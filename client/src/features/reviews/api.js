import { apiClient } from "../../api/client";

export const reviewsApi = {
  getQueue: (params) => apiClient.get("/reviews/queue", { params }),
  submitDecision: (documentId, payload) => apiClient.post(`/reviews/${documentId}`, payload),
  getMyReviews: (params) => apiClient.get("/reviews/mine", { params }),
};
