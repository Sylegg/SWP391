"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth-guards";
import AdminLayout from "@/components/layout/admin-layout";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/admin/users");
  }, [router]);

  return (
    <ProtectedRoute allowedRoles={["Admin", "EVM Staff"]}>
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
