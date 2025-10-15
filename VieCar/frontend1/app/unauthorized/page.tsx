import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Truy cập bị từ chối</CardTitle>
          <CardDescription>
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn tin rằng đây là lỗi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Những gì bạn có thể làm:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Quay lại trang chủ</li>
              <li>• Liên hệ với quản trị viên</li>
              <li>• Đăng xuất và đăng nhập bằng tài khoản khác</li>
            </ul>
          </div>
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại trang chủ
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login" className="w-full">
                Đăng nhập lại
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}