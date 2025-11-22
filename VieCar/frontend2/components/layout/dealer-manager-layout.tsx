"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Users,
  LogOut,
  Tag,
  Truck,
  BarChart3,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LucideIcon } from "lucide-react";

interface DealerManagerLayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  section: string;
  isHeader?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    title: "📊 DASHBOARD",
    isHeader: true,
    section: "main"
  },
  {
    title: "Tổng quan",
    href: "/dashboard/dealer-manager",
    icon: Home,
    section: "main"
  },
  {
    title: "📦 DANH MỤC XE",
    isHeader: true,
    section: "category"
  },
  {
    title: "Danh mục xe Hãng",
    href: "/dashboard/dealer-manager/categories",
    icon: Tag,
    section: "category"
  },
  {
    title: "Phân phối từ Hãng",
    href: "/dashboard/dealer-manager/distributions",
    icon: Truck,
    section: "category"
  },
  {
    title: "👥 QUẢN LÝ NHÂN VIÊN",
    isHeader: true,
    section: "staff"
  },
  {
    title: "Danh sách nhân viên",
    href: "/dashboard/dealer-manager/staff",
    icon: Users,
    section: "staff"
  },
  {
    title: "📊 BÁO CÁO & THỐNG KÊ",
    isHeader: true,
    section: "reports"
  },
  {
    title: "Dashboard báo cáo",
    href: "/dashboard/dealer-manager/reports",
    icon: BarChart3,
    section: "reports"
  }
];

export default function DealerManagerLayout({ children }: DealerManagerLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const hasDealer = user?.dealerId || localStorage.getItem('dealerId');

  const handleLogout = () => {
    const loginMethod = localStorage.getItem('loginMethod');
    logout();
    // Google login về homepage, login thường về login page
    router.push(loginMethod === 'google' ? '/' : '/login');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-950 dark:via-purple-950 dark:to-pink-950">
      {/* Liquid Glass Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40">
        <div className="flex flex-col flex-grow backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-r border-white/20 dark:border-gray-700/30 shadow-2xl shadow-purple-500/10">
          {/* Logo with Link to Home */}
          <Link href="/" className="flex items-center justify-center h-20 px-4 border-b border-white/10 dark:border-gray-700/20 relative overflow-hidden group hover:bg-purple-50/30 dark:hover:bg-purple-950/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-rose-500/5 animate-gradient-shift"></div>
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="VIECAR Logo" 
                width={140} 
                height={60}
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </Link>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1.5">
              {navigationItems.map((item, index) => {
                const isOverviewPage = item.href === "/dashboard/dealer-manager";
                
                if (!hasDealer && !isOverviewPage && !item.isHeader) {
                  return null;
                }
                
                if (!hasDealer && item.isHeader) {
                  return null;
                }
                
                if (item.isHeader) {
                  return (
                    <div key={`header-${index}`} className={cn("pt-4 pb-2 first:pt-0", index > 0 && "mt-2")}>
                      <h3 className="px-3 text-xs font-bold text-purple-700/80 dark:text-purple-300/80 uppercase tracking-wider">
                        {item.title}
                      </h3>
                      <div className="mt-2 h-px bg-gradient-to-r from-purple-200 via-purple-300 to-transparent dark:from-purple-800 dark:via-purple-700"></div>
                    </div>
                  );
                }

                if (!item.href || !item.icon) return null;

                const isActive = pathname === item.href;
                const Icon = item.icon as LucideIcon;

                return (
                  <Link key={item.href} href={item.href as string}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start text-left font-medium transition-all duration-300 group relative overflow-hidden",
                        isActive 
                          ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:from-purple-600 hover:to-pink-700" 
                          : "hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm hover:shadow-md hover:scale-[1.02]"
                      )}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-gradient-shift"></div>
                      )}
                      <Icon className={cn(
                        "mr-3 h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                        isActive && "drop-shadow-sm"
                      )} />
                      <span className="relative">{item.title}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Home Button */}
          <div className="px-3 pb-3">
            <Link href="/">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900 dark:hover:to-pink-900 text-purple-700 dark:text-purple-300 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Home className="h-5 w-5" />
                <span>Về trang chủ</span>
              </Button>
            </Link>
          </div>

          {/* User info with Liquid Glass */}
          <div className="p-4 border-t border-white/10 dark:border-gray-700/20 backdrop-blur-sm bg-gradient-to-br from-white/40 to-purple-50/40 dark:from-gray-800/40 dark:to-purple-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 ring-2 ring-white/20">
                    <span className="text-sm font-bold text-white drop-shadow-sm">
                      {user?.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium truncate">
                    {user?.role?.name}
                  </p>
                </div>
              </div>
              <Button 
                size="icon"
                variant="ghost" 
                className="flex-shrink-0 ml-2 text-red-600 hover:text-red-700 hover:bg-red-50/80 dark:hover:bg-red-950/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={handleLogout}
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
