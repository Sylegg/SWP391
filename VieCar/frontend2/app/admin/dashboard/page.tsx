'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}