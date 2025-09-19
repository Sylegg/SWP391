'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AccountManagement from '@/components/AccountManagement';

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AccountManagement />
    </ProtectedRoute>
  );
}