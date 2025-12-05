import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BrowsePage from "./pages/BrowsePage";
import SearchPage from "./pages/SearchPage";
import SeriesDetailPage from "./pages/SeriesDetailPage";
import DashboardPage from "./pages/DashboardPage";
import AdminSeriesPage from "./pages/AdminSeriesPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminSystemPage from "./pages/AdminSystemPage";
import AdminContentPage from "./pages/AdminContentPage";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.account_type)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/series/:id" element={<SeriesDetailPage />} />

      {/* Protected Routes - All authenticated users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Employee and Admin only */}
      {/* Redirect /admin to /admin/series */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Employee", "Admin"]}>
            <Navigate to="/admin/series" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/series"
        element={
          <ProtectedRoute allowedRoles={["Employee", "Admin"]}>
            <AdminSeriesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/content"
        element={
          <ProtectedRoute allowedRoles={["Employee", "Admin"]}>
            <AdminContentPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Admin only */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/system"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminSystemPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
