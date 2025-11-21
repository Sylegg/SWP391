"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { LogOut, LayoutDashboard, ChevronDown, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState<string>("#home")
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    const loginMethod = localStorage.getItem('loginMethod')
    logout()
    // Google login về homepage, login thường về login page
    router.push(loginMethod === 'google' ? '/' : '/login')
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

  // Role UI helpers
  const roleLabelMap: Record<string, string> = {
    Guest: "Khách",
    Customer: "Khách hàng",
    Admin: "Quản trị viên",
    'EVM Staff': "Nhân viên EVM",
    'Dealer Manager': "Quản lý đại lý",
    'Dealer Staff': "Nhân viên đại lý",
  }

  const roleStyleMap: Record<string, string> = {
    Guest: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200",
    Customer: "bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200",
    Admin: "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200",
    'EVM Staff': "bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-200",
    'Dealer Manager': "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200",
    'Dealer Staff': "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-gray-200 text-gray-800 backdrop-blur supports-[backdrop-filter]:bg-white/80 transition-shadow ${
        scrolled ? "bg-white/95 shadow-lg" : "bg-white/90"
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
                className={`group relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/40 after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-red-600 after:transition-transform ${
                  isActive
                    ? "text-red-600 after:scale-x-100"
                    : "text-gray-700 hover:text-red-600 after:scale-x-0 group-hover:after:scale-x-100"
                }`}
              >
                {l.label}
              </a>
            )
          })}
        </nav>

        {/* Right side buttons */}
        <div className="ml-auto flex items-center space-x-4">
          {user && user.role?.name !== 'Guest' ? (
            <div className="flex items-center space-x-3">
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="group relative min-w-[150px] rounded-full border-[1.5px] border-white/80 bg-white/70 px-2.5 py-1 text-gray-800 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white md:min-w-[170px]"
                    aria-label="Mở menu người dùng"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Avatar className="h-8 w-8 shrink-0 ring-[3px] ring-white/80 shadow-sm">
                        {/* Nếu có ảnh đại diện, đặt vào src bên dưới */}
                        <AvatarImage src={""} alt={user.username || "user"} />
                        <AvatarFallback className="bg-red-500 text-white text-xs font-semibold">
                          {(user.username || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left leading-tight">
                        <div className="text-sm font-semibold tracking-tight truncate">
                          {user.username}
                        </div>
                        <span
                          className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            user.role?.name ? roleStyleMap[user.role.name] : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {user.role?.name ? roleLabelMap[user.role.name] : "Thành viên"}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="w-[min(15rem,90vw)] overflow-hidden rounded-3xl border border-white/60 bg-white/75 p-0 shadow-[0_20px_45px_-18px_rgba(15,23,42,0.35)] backdrop-blur-xl"
                >
                  {/* Card header */}
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500" />
                    <div className="absolute -top-16 right-0 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
                    <div className="relative flex items-center gap-2 px-3 pb-3 pt-4 text-white">
                      <Avatar className="h-9 w-9 border-[1.5px] border-white/70 shadow-xl">
                        <AvatarImage src={""} alt={user.username || "user"} />
                        <AvatarFallback className="bg-white/20 text-white">
                          {(user.username || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-tight">{user.username}</p>
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge className="border-0 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                            {user.role?.name ? roleLabelMap[user.role.name] : "Thành viên"}
                          </Badge>
                          {user.email ? (
                            <span className="text-[11px] text-white/70">{user.email}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu body */}
                  <div className="space-y-1.5 bg-white/70 px-2 pb-3 pt-2">
                    <DropdownMenuLabel className="px-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                      Tài khoản
                    </DropdownMenuLabel>

                    

                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="group flex w-full items-center gap-2 rounded-2xl px-2 py-1.75 text-sm text-slate-600 transition-all hover:bg-white focus:bg-white"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-100 text-indigo-500 transition-colors group-hover:bg-indigo-200">
                          <LayoutDashboard className="h-4 w-4" />
                        </span>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-slate-900">Dashboard</p>
                    
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="mx-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="group flex items-center gap-2 rounded-2xl px-1.5 py-1 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-50 focus:bg-rose-50"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-100 text-rose-500 transition-colors group-hover:bg-rose-200">
                        <LogOut className="h-4 w-4" />
                      </span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold">Đăng xuất</p>
                       
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : user?.role?.name === 'Guest' ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 hidden md:block">
                {user.username}
              </span>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-red-600 bg-transparent text-red-600 hover:!bg-red-600 hover:!text-white hover:shadow-md focus-visible:ring-red-600/40 transition-colors"
                >
                  Đăng nhập
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                className="hidden md:inline-flex border-red-600 bg-transparent text-red-600 hover:!bg-red-600 hover:!text-white hover:shadow-md focus-visible:ring-red-600/40 transition-colors"
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
