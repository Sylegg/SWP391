"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft, Loader2 } from "lucide-react"
import api from "@/lib/api"

interface OtpVerificationProps {
  email: string
  type: "register" | "forgot-password"
  onVerified: () => void
  onBack: () => void
}

export default function OtpVerification({ email, type, onVerified, onBack }: OtpVerificationProps) {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resending, setResending] = useState(false)

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (otp.length !== 6) {
      setError("Mã OTP phải có 6 chữ số")
      setIsLoading(false)
      return
    }

    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        otp
      })
      
      setSuccess("Xác thực thành công!")
      setTimeout(() => {
        onVerified()
      }, 1500)
    } catch (error: any) {
      console.error("Lỗi xác thực OTP:", error)
      setError(error?.response?.data || error?.message || "Mã OTP không hợp lệ hoặc đã hết hạn")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setResending(true)
    setError("")
    setSuccess("")

    try {
      await api.post("/auth/resend-otp", { email })
      setSuccess("Mã OTP mới đã được gửi đến email của bạn")
      setOtp("")
    } catch (error: any) {
      console.error("Lỗi gửi lại OTP:", error)
      setError(error?.response?.data || "Không thể gửi lại OTP. Vui lòng thử lại sau.")
    } finally {
      setResending(false)
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Xác thực email
        </CardTitle>
        <CardDescription className="text-center text-base">
          Mã OTP đã được gửi đến<br />
          <span className="font-semibold text-blue-600 dark:text-blue-400">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400 text-center">{success}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium">
              Nhập mã OTP (6 chữ số)
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="h-14 text-center text-2xl tracking-widest font-bold"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Mã OTP có hiệu lực trong 10 phút
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang xác thực...
              </div>
            ) : (
              "Xác thực"
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Không nhận được mã?
            </p>
            <Button
              type="button"
              variant="link"
              onClick={handleResendOtp}
              disabled={resending}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {resending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang gửi...
                </div>
              ) : (
                "Gửi lại mã OTP"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
