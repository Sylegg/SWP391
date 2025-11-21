"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, User, Shield, Users, Building, Lock, Mail, Phone, MapPin, UserCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import OtpVerification from "@/components/otp-verification"
import ForgotPassword from "@/components/forgot-password"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [view, setView] = useState<"login" | "otp" | "forgot-password">("login")
  const [pendingEmail, setPendingEmail] = useState("")
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Đang xử lý...")

  const [loginData, setLoginData] = useState({
    identifier: "",
    password: ""
  })

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    selectedRole: "Customer"
  })

  const { login, register, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user && user.role?.name !== 'Guest') {
      router.replace('/')
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setLoadingMessage("Đang xác thực...")
    
    try {
      await login(loginData)
      
      // Lấy username từ localStorage sau khi login
      const userString = localStorage.getItem('user')
      let displayName = loginData.identifier
      if (userString) {
        try {
          const userData = JSON.parse(userString)
          displayName = userData.username || loginData.identifier
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }
      
      // Hiển thị toast thông báo đăng nhập thành công
      toast({
        title: "✅ Đăng nhập thành công!",
        description: `Chào mừng bạn trở lại, ${displayName}`,
        duration: 3000,
      })
      
      setSuccess("Đăng nhập thành công!")
      
      // Chờ một chút để user thấy toast trước khi redirect
      setTimeout(() => {
        router.push('/')
      }, 500)
    } catch (error: any) {
      // Kiểm tra nếu là lỗi email chưa xác thực
      if (error?.requireOtp && error?.email) {
        setPendingEmail(error.email)
        setShowOtpDialog(true)
      } else {
        setError(error?.message || "Đăng nhập thất bại. Vui lòng kiểm tra thông tin.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpDialogConfirm = () => {
    setShowOtpDialog(false)
    setView("otp")
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setLoadingMessage("Đang tạo tài khoản...")

    const phonePattern = /^(?:(?:03|05|07|08|09)\d{8}|01(?:2|6|8|9)\d{8})$/
    if (!phonePattern.test(registerData.phone)) {
      setError("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10-11 số)")
      setIsLoading(false)
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      setIsLoading(false)
      return
    }

    const registerPayload = {
      username: registerData.username,
      email: registerData.email,
      phone: registerData.phone,
      address: registerData.address,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword,
      roleName: registerData.selectedRole,
    }

    console.log('📤 Dữ liệu gửi đến backend:', registerPayload)
    console.log('📝 Chi tiết từng trường:')
    console.log('  - Username:', registerPayload.username, '(length:', registerPayload.username?.length, ')')
    console.log('  - Email:', registerPayload.email)
    console.log('  - Phone:', registerPayload.phone, '(length:', registerPayload.phone?.length, ')')
    console.log('  - Address:', registerPayload.address, '(length:', registerPayload.address?.length, ')')
    console.log('  - Password:', '***', '(length:', registerPayload.password?.length, ')')
    console.log('  - Role:', registerPayload.roleName)

    try {
      setLoadingMessage("Đang gửi OTP đến email...")
      const response = await fetch('http://localhost:6969/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerPayload),
      })

      const data = await response.text()
      
      if (!response.ok) {
        throw new Error(data || 'Đăng ký thất bại')
      }

      console.log('✅ Backend response:', data)
      setSuccess("OTP đã được gửi đến email của bạn!")
      setPendingEmail(registerPayload.email)
      
      // Chuyển sang view xác thực OTP sau 1.5 giây
      setTimeout(() => {
        setView("otp")
      }, 1500)
    } catch (error: any) {
      console.error('❌ Lỗi từ backend:', error)
      setError(error?.message || "Đăng ký thất bại. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerified = () => {
    setSuccess("Xác thực thành công! Đang chuyển đến trang đăng nhập...")
    setTimeout(() => {
      setView("login")
      setSuccess("Tài khoản đã được kích hoạt. Vui lòng đăng nhập.")
    }, 1500)
  }

  const handleForgotPasswordSuccess = () => {
    setView("login")
    setSuccess("Mật khẩu đã được đặt lại. Vui lòng đăng nhập với mật khẩu mới.")
  }

  // Nếu đang ở view OTP hoặc forgot password, hiển thị component tương ứng
  if (view === "otp") {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-blue-950 dark:to-cyan-950" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-400/30 to-emerald-500/30 rounded-full blur-3xl animate-float-delayed" />
        <OtpVerification
          email={pendingEmail}
          type="register"
          onVerified={handleOtpVerified}
          onBack={() => setView("login")}
        />
      </div>
    )
  }

  if (view === "forgot-password") {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-blue-950 dark:to-cyan-950" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-orange-400/30 to-red-500/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-red-400/30 to-pink-500/30 rounded-full blur-3xl animate-float-delayed" />
        <ForgotPassword
          onBack={() => setView("login")}
          onSuccess={handleForgotPasswordSuccess}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-blue-950 dark:to-cyan-950">
      </div>

      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-400/30 to-emerald-500/30 rounded-full blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center justify-center -mb-16 animate-scale-in">
          <div className="relative">
            <Image 
              src="/logo.png" 
              alt="VieCar Logo" 
              width={300} 
              height={300}
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500 animate-gradient-shift"></div>
          
          <Card className="relative border-none shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
            
            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Chào mừng trở lại
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Đăng nhập hoặc tạo tài khoản để tiếp tục
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50/50 dark:bg-red-950/50 backdrop-blur-sm animate-scale-in">
                  <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50/50 dark:bg-green-950/50 backdrop-blur-sm animate-scale-in">
                  <AlertDescription className="text-green-700 dark:text-green-400">{success}</AlertDescription>
                </Alert>
              )}
              
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm p-1 rounded-xl">
                  <TabsTrigger 
                    value="login" 
                    className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg transition-all duration-300"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Đăng nhập
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-lg transition-all duration-300"
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    Đăng ký
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-5 mt-6">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        Email hoặc Tên đăng nhập
                      </Label>
                      <Input 
                        id="email" 
                        type="text" 
                        placeholder="Nhập email hoặc tên đăng nhập" 
                        className="w-full h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl"
                        value={loginData.identifier}
                        onChange={(e) => setLoginData({...loginData, identifier: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-600" />
                        Mật khẩu
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu"
                          className="w-full h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl pr-12"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-10 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="remember" 
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="remember" className="cursor-pointer">
                          Ghi nhớ đăng nhập
                        </Label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setView("forgot-password")}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          {loadingMessage}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="w-5 h-5" />
                          Đăng nhập
                        </div>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">
                          Hoặc đăng nhập với
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.location.href = 'http://localhost:6969/oauth2/authorization/google'
                        }
                      }}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Đăng nhập với Google
                      </span>
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4 mt-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        Tên người dùng
                      </Label>
                      <Input 
                        id="username" 
                        type="text" 
                        placeholder="Nguyễn Văn A" 
                        className="w-full h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl"
                        value={registerData.username}
                        onChange={(e) => {
                          // Cho phép mọi ký tự, không giới hạn
                          setRegisterData({...registerData, username: e.target.value});
                        }}
                        required
                        minLength={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-sm font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        Email
                      </Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="example@gmail.com" 
                        className="w-full h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl"
                        value={registerData.email}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Nếu đã có @gmail.com thì không cho nhập thêm
                          if (value.includes('@gmail.com') && value.indexOf('@gmail.com') !== value.length - 10) {
                            return; // Không cho nhập thêm sau @gmail.com
                          }
                          setRegisterData({...registerData, email: value});
                        }}
                        required
                        pattern="^[a-zA-Z0-9._%+\-]+@gmail\.com$"
                        title="Email phải có đuôi @gmail.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        Số điện thoại
                      </Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="0912345678" 
                        className="w-full h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl"
                        value={registerData.phone}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          // Nếu không bắt đầu bằng 0 và có nhập số, tự động thêm 0 vào đầu
                          if (value.length > 0 && !value.startsWith('0')) {
                            value = '0' + value;
                          }
                          // Giới hạn tối đa 10 số
                          if (value.length <= 10) {
                            setRegisterData({...registerData, phone: value});
                          }
                        }}
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        required
                        minLength={10}
                        maxLength={10}
                        pattern="^0[35789][0-9]{8}$"
                        title="Số điện thoại phải bắt đầu bằng 03, 05, 07, 08, hoặc 09 và có tổng 10 số"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        Địa chỉ
                      </Label>
                      <Input 
                        id="address" 
                        type="text" 
                        placeholder="Nhập địa chỉ của bạn" 
                        className="w-full h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        Loại tài khoản
                      </Label>
                      <Select
                        value={registerData.selectedRole}
                        onValueChange={(val) => setRegisterData({ ...registerData, selectedRole: val })}
                      >
                        <SelectTrigger className="w-full h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl">
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200 dark:border-gray-700 rounded-xl">
                          <SelectItem value="Customer" className="rounded-lg">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-600" />
                              <span>Khách hàng</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Admin" className="rounded-lg">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-purple-600" />
                              <span>Admin</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Dealer Manager" className="rounded-lg">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-amber-600" />
                              <span>Dealer Manager</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-600" />
                        Mật khẩu
                      </Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Tạo mật khẩu mạnh"
                          className="w-full h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl pr-12"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-10 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-600" />
                        Xác nhận mật khẩu
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Nhập lại mật khẩu"
                          className="w-full h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl pr-12"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-10 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          {loadingMessage}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserCircle className="w-5 h-5" />
                          Đăng ký ngay
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 animate-scale-in">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300"></span>
            <span className="font-medium">Quay lại trang chủ</span>
          </Link>
        </div>
      </div>

      {/* Dialog xác nhận OTP */}
      <AlertDialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <Mail className="w-6 h-6 text-blue-600" />
              Xác thực tài khoản
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3 pt-2">
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Tài khoản chưa được xác thực. Vui lòng nhập mã OTP đã được gửi đến email của bạn.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">Email:</span> {pendingEmail}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mã OTP có hiệu lực trong 10 phút. Vui lòng kiểm tra hộp thư đến hoặc thư rác.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleOtpDialogConfirm}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2.5"
            >
              Xác nhận - Đi đến nhập OTP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
