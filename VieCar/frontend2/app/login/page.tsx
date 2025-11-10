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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

  useEffect(() => {
    if (user && user.role?.name !== 'Guest') {
      router.replace('/')
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      await login(loginData)
      setSuccess("Đăng nhập thành công!")
      router.push('/')
    } catch (error: any) {
      setError(error?.message || "Đăng nhập thất bại. Vui lòng kiểm tra thông tin.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

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
      const response = await register(registerPayload)
      console.log('✅ Backend response:', response)
      setSuccess("Đăng ký thành công!")
      router.push('/')
    } catch (error: any) {
      console.error('❌ Lỗi từ backend:', error)
      console.error('❌ Error message:', error?.message)
      console.error('❌ Error response:', error?.response?.data)
      setError(error?.message || "Đăng ký thất bại. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
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
                      <Link href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                        Quên mật khẩu?
                      </Link>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Đang đăng nhập...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="w-5 h-5" />
                          Đăng nhập
                        </div>
                      )}
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
                          <SelectItem value="EVM Staff" className="rounded-lg">
                            <div className="flex items-center gap-2">
                              <UserCircle className="h-4 w-4 text-cyan-600" />
                              <span>EVM Staff</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Dealer Manager" className="rounded-lg">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-amber-600" />
                              <span>Dealer Manager</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Dealer Staff" className="rounded-lg">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-green-600" />
                              <span>Dealer Staff</span>
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
                          Đang đăng ký...
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
    </div>
  )
}
