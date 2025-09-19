"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, BarChart3 } from "lucide-react"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState<string>("#home")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const initial = window.location.hash
      if (initial) setActiveHash(initial)
      const onHash = () => setActiveHash(window.location.hash || "#home")
      window.addEventListener("hashchange", onHash)
      return () => window.removeEventListener("hashchange", onHash)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [isDropdownOpen])

  const links = useMemo(
    () => [
      { href: "#home", label: "Trang chủ" },
      { href: "#vehicles", label: "Xe điện" },
      { href: "#services", label: "Dịch vụ" },
      { href: "#about", label: "Giới thiệu" },
      { href: "#contact", label: "Liên hệ" },
    ],
    []
  )

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'EVM_STAFF': return '/evm/dashboard';
      case 'DEALER_MANAGER': return '/dealer/manager/dashboard';
      case 'DEALER_STAFF': return '/dealer/staff/dashboard';
      case 'CUSTOMER': return '/customer/dashboard';
      default: return '/';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'EVM_STAFF': return 'EVM Staff';
      case 'DEALER_MANAGER': return 'Dealer Manager';
      case 'DEALER_STAFF': return 'Dealer Staff';
      case 'CUSTOMER': return 'Customer';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'EVM_STAFF': return 'bg-blue-100 text-blue-800';
      case 'DEALER_MANAGER': return 'bg-green-100 text-green-800';
      case 'DEALER_STAFF': return 'bg-yellow-100 text-yellow-800';
      case 'CUSTOMER': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-red-700 text-white backdrop-blur supports-[backdrop-filter]:bg-red-600/80 transition-shadow ${
        scrolled ? "bg-red-600/95 shadow-lg" : "bg-red-600/90"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        {/* Logo ở bên trái */}
        <Link href="/" className="group flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={130}
            height={130}
            priority
            className="transition-transform duration-300 group-hover:scale-[1.04] drop-shadow-md"
          />
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-1 ml-8">
          {links.map((l) => {
            const isActive = activeHash === l.href
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setActiveHash(l.href)}
                className={`group relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-white/90 after:transition-transform ${
                  isActive
                    ? "text-white after:scale-x-100"
                    : "text-white/90 hover:text-white after:scale-x-0 group-hover:after:scale-x-100"
                }`}
              >
                {l.label}
              </a>
            )
          })}
        </nav>

        {/* Right side buttons */}
        <div className="ml-auto flex items-center space-x-4">
          {isAuthenticated && user ? (
            <div className="relative">
              <Button
                variant="outline"
                className="border-white/60 bg-transparent text-white hover:!bg-white hover:!text-red-600 hover:shadow-md focus-visible:ring-white/40 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
              >
                <User className="h-4 w-4 mr-2" />
                {user.fullName}
                <Badge className={`ml-2 ${getRoleBadgeColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </Badge>
              </Button>
              
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 border-b">
                    <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <Badge className={`mt-1 ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>
                  
                  <Link 
                    href={getDashboardPath()} 
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                  
                  <div className="border-t">
                    <button 
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                className="hidden md:inline-flex border-white/60 bg-transparent text-white hover:!bg-white hover:!text-red-600 hover:shadow-md focus-visible:ring-white/40 transition-colors"
              >
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
