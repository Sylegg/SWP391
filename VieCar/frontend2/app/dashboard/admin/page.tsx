"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth-guards";
import AdminLayout from "@/components/layout/admin-layout";
import { Loader2, Sparkles } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dealers page after a brief moment
    const timer = setTimeout(() => {
      router.replace("/dashboard/admin/dealers");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ProtectedRoute allowedRoles={["Admin", "EVM Staff"]}>
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-6">
            {/* Animated Icon */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 animate-ping opacity-20"></div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                  <Sparkles className="w-12 h-12 text-white animate-pulse" />
                </div>
              </div>
            </div>

            {/* Loading Text */}
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Đang chuyển hướng...
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vui lòng đợi trong giây lát
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-[loading_1s_ease-in-out]"></div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes loading {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </AdminLayout>
    </ProtectedRoute>
  );
}
