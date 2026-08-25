import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { RoleGuard } from "./RoleGuard";
import { AppShell } from "../components/layout/AppShell";

import { LandingPage } from "../pages/Landing";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";
import { DashboardPage } from "../features/documents/DashboardPage";
import { SubmitPage } from "../features/documents/SubmitPage";
import { SubmissionsPage } from "../features/documents/SubmissionsPage";
import { SubmissionDetailPage } from "../features/documents/SubmissionDetailPage";
import { ReviewQueuePage } from "../features/reviews/ReviewQueuePage";
import { ReviewDetailPage } from "../features/reviews/ReviewDetailPage";
import { MyReviewsPage } from "../features/reviews/MyReviewsPage";
import { AdminUsersPage } from "../features/admin/AdminUsersPage";
import { AdminAuditPage } from "../features/admin/AdminAuditPage";
import { AdminStatsPage } from "../features/admin/AdminStatsPage";
import { ProfilePage } from "../pages/Profile";
import { Forbidden403Page } from "../pages/Forbidden403";
import { NotFound404Page } from "../pages/NotFound404";

export function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/403" element={<Forbidden403Page />} />

      {/* Protected App Routes */}
      <Route
        path="/app"
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Submitter Routes */}
        <Route
          path="submit"
          element={
            <RoleGuard allowedRoles={["SUBMITTER"]}>
              <SubmitPage />
            </RoleGuard>
          }
        />

        {/* Documents Routes */}
        <Route path="submissions" element={<SubmissionsPage />} />
        <Route path="submissions/:id" element={<SubmissionDetailPage />} />

        {/* Review Officer Routes */}
        <Route
          path="reviews/queue"
          element={
            <RoleGuard allowedRoles={["OFFICER", "ADMIN"]}>
              <ReviewQueuePage />
            </RoleGuard>
          }
        />
        <Route
          path="reviews/:documentId"
          element={
            <RoleGuard allowedRoles={["OFFICER", "ADMIN"]}>
              <ReviewDetailPage />
            </RoleGuard>
          }
        />
        <Route
          path="reviews/mine"
          element={
            <RoleGuard allowedRoles={["OFFICER"]}>
              <MyReviewsPage />
            </RoleGuard>
          }
        />

        {/* Admin Routes */}
        <Route
          path="admin/users"
          element={
            <RoleGuard allowedRoles={["ADMIN"]}>
              <AdminUsersPage />
            </RoleGuard>
          }
        />
        <Route
          path="admin/audit"
          element={
            <RoleGuard allowedRoles={["ADMIN"]}>
              <AdminAuditPage />
            </RoleGuard>
          }
        />
        <Route
          path="admin/stats"
          element={
            <RoleGuard allowedRoles={["ADMIN"]}>
              <AdminStatsPage />
            </RoleGuard>
          }
        />

        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound404Page />} />
    </Routes>
  );
}
