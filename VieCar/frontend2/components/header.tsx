"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { UserRoleDisplay } from "@/components/role-display"
import { RoleBasedComponent } from "@/components/auth-guards"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState<string>("#home")
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

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
          {user ? (
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="secondary" className="hidden md:inline-flex">
                  Dashboard
                </Button>
              </Link>
              {/* Visible Logout button on desktop */}
              <Button
                variant="destructive"
                className="hidden md:inline-flex"
                onClick={handleLogout}
                title="Đăng xuất"
              >
                Đăng xuất
              </Button>
              <UserRoleDisplay />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Thông tin cá nhân
                    </Link>
                  </DropdownMenuItem>
                  
                  <RoleBasedComponent allowedRoles={['Admin', 'EVM_Staff', 'Dealer_Manager']}>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Quản trị
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Cài đặt
                      </Link>
                    </DropdownMenuItem>
                  </RoleBasedComponent>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
