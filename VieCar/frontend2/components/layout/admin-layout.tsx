"use client";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
interface AdminLayoutProps { children: ReactNode; }
export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const handleLogout = () => { logout(); router.push("/login"); };
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Trang chủ</Button></Link>
            <div><h2 className="text-lg font-semibold">Admin Dashboard</h2><p className="text-sm text-muted-foreground">{user?.username}</p></div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Đăng xuất</Button>
        </div>
      </header>
      <main className="container py-6 px-4">{children}</main>
    </div>
  );
}
