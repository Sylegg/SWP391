"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardEntry() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const role = user.role?.name;

    switch (role) {
      case 'Admin':
        router.replace('/dashboard/admin');
        break;
      case 'Customer':
        router.replace('/dashboard/customer');
        break;
      case 'EVM_Staff':
        router.replace('/dashboard/evm-staff');
        break;
      case 'Dealer_Manager':
        router.replace('/dashboard/dealer-manager');
        break;
      case 'Dealer_Staff':
        router.replace('/dashboard/dealer-staff');
        break;
      default:
        router.replace('/unauthorized');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
    </div>
  );
}