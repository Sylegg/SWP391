'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import CustomerDashboard from '@/components/dashboards/CustomerDashboard';

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <CustomerDashboard />
    </ProtectedRoute>
  );
}