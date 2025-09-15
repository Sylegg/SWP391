"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserInterface {
  id: string
  name: string
  email: string
  role: string
  dealership: string
}

export function UserNav() {
  const [user, setUser] = useState<UserInterface | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/auth/login")
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "dealer_staff":
        return "Nhân viên"
      case "dealer_manager":
        return "Quản lý"
      case "admin":
        return "Admin"
      default:
        return role
    }
  }

  if (!user) {
    return (
      <Link href="/auth/login">
        <Button variant="outline">Đăng nhập</Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-auto px-3">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Shield className="h-3 w-3" />
              <span className="text-xs">{getRoleLabel(user.role)}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/auth/profile" className="cursor-pointer">
            {/* Placeholder for User icon */}
            <span className="mr-2 h-4 w-4">User Icon</span>
            <span>Thông tin cá nhân</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Cài đặt</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
