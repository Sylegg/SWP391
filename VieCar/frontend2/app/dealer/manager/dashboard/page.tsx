'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DealerManagerDashboard from '@/components/dashboards/DealerManagerDashboard';

export default function DealerManagerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['DEALER_MANAGER']}>
      <DealerManagerDashboard />
    </ProtectedRoute>
  );
}