'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import EVMStaffDashboard from '@/components/dashboards/EVMStaffDashboard';

export default function EVMDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['EVM_STAFF']}>
      <EVMStaffDashboard />
    </ProtectedRoute>
  );
}