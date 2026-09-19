import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LandingPage from '../pages/LandingPage';
import ExplorePage from '../pages/ExplorePage';
import ListingDetailPage from '../pages/ListingDetailPage';
import AddListingPage from '../pages/AddListingPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import { ProtectedRoute, AdminRoute } from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<LandingPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="listing/:id" element={<ListingDetailPage />} />
        <Route path="user/:id" element={<ProfilePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected User Routes */}
        <Route
          path="add-listing"
          element={
            <ProtectedRoute>
              <AddListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
