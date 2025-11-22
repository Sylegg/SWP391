"use client"
import React from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"
type Product = {
  id: string
  name: string
  image: string
  price: string
  oldPrice?: string
  discount?: string // e.g. "-15%"
  colorPrice?: string
}

type BrandGroup = {
  id: string
  title: string // e.g. "XE VINFAST"
  products: Product[]
}


export function VehicleShowcase() {
  return (
    <section id="vehicles" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-balance">VinFast - Xe Điện Hàng Đầu</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-pretty">
              VinFast — Thương hiệu xe điện hàng đầu Việt Nam với công nghệ tiên tiến và thiết kế hiện đại
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-16">
          {brands.map((brand, idx) => (
            <section key={brand.id} className="space-y-6">
              {idx > 0 && (
                <div className="relative mx-auto w-full max-w-6xl px-2 md:px-4">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
              )}

              <div className="mx-auto w-full max-w-6xl px-2 md:px-4">
                {/* Anchor that aligns the brand title correctly under sticky header */}
                <span id={brand.id} className="block scroll-mt-24 md:scroll-mt-28" />
                <div className="flex items-center justify-center gap-4">
                  <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md">
                    <ShoppingCart className="h-4 w-4" />
                    {brand.title}
                  </div>
                  <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />
                </div>
              </div>

              <BrandScroller products={brand.products} />
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}

const brands: BrandGroup[] = [
  {
    id: "vinfast-car",
    title: "XE Ô TÔ ĐIỆN VINFAST",
    products: [
      { id: "vf3", name: "VinFast VF 3", image: "/xe%20oto%20vinfast/VF3.jpg", price: "299.000.000đ" },
      { id: "vf5", name: "VinFast VF 5", image: "/xe%20oto%20vinfast/VF5.jpg", price: "529.000.000đ" },
      { id: "vf6", name: "VinFast VF 6", image: "/xe%20oto%20vinfast/VF6.jpg", price: "694.000.000đ" },
      { id: "vf7", name: "VinFast VF 7", image: "/xe%20oto%20vinfast/VF7.jpg", price: "799.000.000đ" },
      { id: "vf8", name: "VinFast VF 8", image: "/xe%20oto%20vinfast/VF8.jpg", price: "1.019.000.000đ" },
      { id: "vf9", name: "VinFast VF 9", image: "/xe%20oto%20vinfast/VF9.jpg", price: "1.499.000.000đ" },
      { id: "limogreen", name: "VinFast Limo Green", image: "/xe%20oto%20vinfast/LimoGreen.jpg", price: "749.000.000đ" },
    ],
  },
]

// Small, reusable card for a product
function ProductCard({ product }: { product: Product }) {
  const router = useRouter();

  const handleTestDrive = () => {
    router.push('/dashboard/customer/test-drive');
  };

  return (
    <Card className="w-[260px] shrink-0 snap-start overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        {product.discount ? (
          <div className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow">
            {product.discount}
          </div>
        ) : null}
        <img src={product.image || "/placeholder.jpg"} alt={product.name} className="h-full w-full object-contain transition-transform duration-300 hover:scale-105" />
      </div>
      <div className="p-4">
        <div className="mt-1 line-clamp-2 text-base font-semibold leading-snug">{product.name}</div>
        <div className="mt-4">
          <Button size="sm" className="w-full" onClick={handleTestDrive}>Đăng ký lái thử xe</Button>
        </div>
      </div>
    </Card>
  )
}



type BrandScrollerProps = { products: Product[] }

function BrandScroller({ products }: BrandScrollerProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [isOverflowing, setIsOverflowing] = React.useState(false)

  const scrollBy = (delta: number) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: delta, behavior: "smooth" })
  }

  // Check whether content overflows horizontally to decide showing nav buttons
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setIsOverflowing(el.scrollWidth > el.clientWidth + 1)
    check()
    const ro = new ResizeObserver(() => check())
    ro.observe(el)
    window.addEventListener("resize", check)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", check)
    }
  }, [products])

  return (
  <div className="relative mx-auto w-full max-w-6xl px-2 md:px-4 group">
      {isOverflowing && (
        <button
          aria-label="Scroll left"
          onClick={() => scrollBy(-320)}
          className="absolute -left-2 top-1/2 z-10 hidden md:flex -translate-y-1/2 rounded-full border bg-background/90 p-2 shadow hover:bg-accent transition-opacity duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div ref={ref} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none]">
        <style>{`.snap-mandatory::-webkit-scrollbar{display:none}`}</style>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {isOverflowing && (
        <button
          aria-label="Scroll right"
          onClick={() => scrollBy(320)}
          className="absolute -right-2 top-1/2 z-10 hidden md:flex -translate-y-1/2 rounded-full border bg-background/90 p-2 shadow hover:bg-accent transition-opacity duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
