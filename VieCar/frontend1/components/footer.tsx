import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Logo và thông tin công ty */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Logo" width={130} height={130} priority />
            </div>
            <p className="text-muted-foreground text-sm">
              Đại lý xe hơi uy tín hàng đầu Việt Nam với hơn 15 năm kinh nghiệm trong ngành.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Youtube className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Sản phẩm */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sản phẩm</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#vinfast-car" className="hover:text-primary">
                  Ô tô điện VinFast
                </a>
              </li>
            </ul>
          </div>

          {/* Dịch vụ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dịch vụ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary">
                  Bảo dưỡng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Sửa chữa
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Bảo hiểm
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Hỗ trợ tài chính
                </a>
              </li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📍 123 Đường ABC, Quận 1, TP.HCM</li>
              <li>📞 (028) 1234 5678</li>
              <li>✉️ info@example.com</li>
              <li>🕒 8:00 - 18:00 (Thứ 2 - Chủ nhật)</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
