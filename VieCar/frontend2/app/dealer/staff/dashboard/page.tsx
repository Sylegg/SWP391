'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DealerStaffDashboard from '@/components/dashboards/DealerStaffDashboard';

export default function DealerStaffDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['DEALER_STAFF']}>
      <DealerStaffDashboard />
    </ProtectedRoute>
  );
}