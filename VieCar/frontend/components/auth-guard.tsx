"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: string
  dealership: string
}

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string[]
  fallback?: React.ReactNode
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Yêu cầu đăng nhập</h2>
            <p className="text-muted-foreground mb-4">Bạn cần đăng nhập để truy cập trang này</p>
            <Link href="/auth/login">
              <Button className="w-full">Đăng nhập</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return (
      fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Không có quyền truy cập</h2>
              <p className="text-muted-foreground mb-4">Bạn không có quyền truy cập vào trang này</p>
              <Link href="/">
                <Button className="w-full">Quay lại trang chủ</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  return <>{children}</>
}
