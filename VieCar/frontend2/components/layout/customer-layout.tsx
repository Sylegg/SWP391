"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Car,
  Calendar,
  ShoppingCart,
  ArrowLeft,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface CustomerLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    title: "Tổng quan",
    href: "/dashboard/customer",
    icon: Home
  },
  {
    title: "Danh mục xe",
    href: "/dashboard/customer/catalog",
    icon: Car
  },
  {
    title: "Đặt lịch lái thử",
    href: "/dashboard/customer/test-drive",
    icon: Calendar
  },
  {
    title: "Đơn hàng & Thanh toán",
    href: "/dashboard/customer/orders",
    icon: ShoppingCart
  }
];

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Khách hàng
            </h2>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {item.title}
                    </Button>
                  </Link>
                );
              })}
              
              {/* Separator */}
              <div className="my-4">
                <div className="h-px bg-gray-200 dark:bg-gray-800"></div>
              </div>

              {/* Quick actions */}
              <div className="space-y-1">
                <Link href="/">
                  <Button variant="ghost" className="w-full justify-start text-left font-normal">
                    <ArrowLeft className="mr-3 h-4 w-4" />
                    Quay về trang chủ
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left font-normal text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Đăng xuất
                </Button>
              </div>
            </nav>
          </ScrollArea>

          {/* User info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
