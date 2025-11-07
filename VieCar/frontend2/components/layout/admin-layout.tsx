"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Car,
	Package,
	Users,
	Store,
	Building2,
	UserCog,
	LogOut,
	Sparkles,
	Home
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
	children: ReactNode;
}

interface NavigationItem {
	title: string;
	href?: string;
	icon?: any;
	roles?: string[];
	isHeader?: boolean;
}

const navigationItems: NavigationItem[] = [
	{
		title: "🏢 QUẢN LÝ HÃNG & ĐẠI LÝ",
		isHeader: true,
		roles: ["Admin", "EVM Staff"]
	},
	{
		title: "Quản lý đại lý",
		href: "/dashboard/admin/dealers",
		icon: Store,
		roles: ["Admin", "EVM Staff"]
	}
];

export default function AdminLayout({ children }: AdminLayoutProps) {
	const pathname = usePathname();
	const { user, logout } = useAuth();
  const router = useRouter();

	const filteredNavItems = navigationItems.filter(item => 
		!item.roles || item.roles.includes(user?.role?.name || "")
	);

	const handleLogout = () => {
		logout();
	  router.push('/');
	};

	return (
		<div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
			{/* Liquid Glass Sidebar */}
			<div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40">
				<div className="flex flex-col flex-grow backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-r border-white/20 dark:border-gray-700/30 shadow-2xl shadow-blue-500/10">
					{/* Logo with Link to Home */}
					<Link href="/" className="flex items-center justify-center h-20 px-4 border-b border-white/10 dark:border-gray-700/20 relative overflow-hidden group hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition-all duration-300">
						<div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 animate-gradient-shift"></div>
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
							{filteredNavItems.map((item, index) => {
								// Render section header
								if (item.isHeader) {
									return (
										<div key={`header-${index}`} className={cn("pt-4 pb-2 first:pt-0", index > 0 && "mt-2")}>
											<h3 className="px-3 text-xs font-bold text-blue-700/80 dark:text-blue-300/80 uppercase tracking-wider">
												{item.title}
											</h3>
											<div className="mt-2 h-px bg-gradient-to-r from-blue-200 via-blue-300 to-transparent dark:from-blue-800 dark:via-blue-700"></div>
										</div>
									);
								}

								if (!item.href || !item.icon) return null;

								const isActive = pathname === item.href;
								const Icon = item.icon;

								return (
									<Link key={item.href} href={item.href}>
										<Button
											variant={isActive ? "default" : "ghost"}
											className={cn(
												"w-full justify-start text-left font-medium transition-all duration-300 group relative overflow-hidden",
												isActive 
													? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-600 hover:to-indigo-700" 
													: "hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm hover:shadow-md hover:scale-[1.02]"
											)}
										>
											{isActive && (
												<div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-gradient-shift"></div>
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
								className="w-full justify-start gap-3 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900 dark:hover:to-indigo-900 text-blue-700 dark:text-blue-300 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
							>
								<Home className="h-5 w-5" />
								<span>Về trang chủ</span>
							</Button>
						</Link>
					</div>

					{/* User info with Liquid Glass */}
					<div className="p-4 border-t border-white/10 dark:border-gray-700/20 backdrop-blur-sm bg-gradient-to-br from-white/40 to-blue-50/40 dark:from-gray-800/40 dark:to-blue-900/40">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3 flex-1 min-w-0">
								<div className="flex-shrink-0">
									<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-white/20">
										<span className="text-sm font-bold text-white drop-shadow-sm">
											{user?.username?.[0]?.toUpperCase()}
										</span>
									</div>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
										{user?.username}
									</p>
									<p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
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

