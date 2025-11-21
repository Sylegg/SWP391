"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KeyRound, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"
import api from "@/lib/api"

interface ForgotPasswordProps {
  onBack: () => void
  onSuccess: () => void
}

export default function ForgotPassword({ onBack, onSuccess }: ForgotPasswordProps) {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await api.post("/auth/forgot-password", { email })
      setSuccess("Mã OTP đã được gửi đến email của bạn")
      setTimeout(() => {
        setStep("otp")
      }, 1500)
    } catch (error: any) {
      console.error("Lỗi gửi OTP:", error)
      setError(error?.response?.data || "Không tìm thấy email này trong hệ thống")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError("Mã OTP phải có 6 chữ số")
      return
    }
    setStep("reset")
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      setIsLoading(false)
      return
    }

    try {
      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
        confirmPassword
      })
      setSuccess("Mật khẩu đã được đặt lại thành công!")
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (error: any) {
      console.error("Lỗi đặt lại mật khẩu:", error)
      setError(error?.response?.data || "Không thể đặt lại mật khẩu. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      await api.post("/auth/forgot-password", { email })
      setSuccess("Mã OTP mới đã được gửi")
      setOtp("")
    } catch (error: any) {
      setError("Không thể gửi lại OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-2 shadow-2xl">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="hover:bg-blue-50 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          {step === "email" && "Quên mật khẩu"}
          {step === "otp" && "Xác thực OTP"}
          {step === "reset" && "Đặt lại mật khẩu"}
        </CardTitle>
        <CardDescription className="text-center">
          {step === "email" && "Nhập email để nhận mã OTP"}
          {step === "otp" && "Nhập mã OTP đã gửi đến email"}
          {step === "reset" && "Tạo mật khẩu mới cho tài khoản"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400 text-center">{success}</p>
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang gửi...
                </div>
              ) : (
                "Gửi mã OTP"
              )}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Mã OTP (6 chữ số)</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="h-14 text-center text-2xl tracking-widest font-bold"
                required
              />
              <p className="text-xs text-gray-500 text-center">
                Gửi đến: <span className="font-semibold">{email}</span>
              </p>
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600"
              disabled={otp.length !== 6}
            >
              Xác thực
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={handleResendOtp}
              className="w-full"
              disabled={isLoading}
            >
              Gửi lại mã OTP
            </Button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </div>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
