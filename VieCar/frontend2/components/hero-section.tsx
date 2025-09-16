"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, RefreshCw } from "lucide-react"
import Image from "next/image"


export function HeroSection() {
  // Toggle between VF3, DatBike, and Pega media
  const [brand, setBrand] = useState<"vf3" | "datbike" | "pega">("vf3")
  const [btnAnim, setBtnAnim] = useState(false)
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* // Background images with crossfade */}
      <Image
        src="/vinfast-vf3.jpg"
        alt="VinFast VF3 background"
        fill
        priority
        className={`absolute inset-0 object-cover transition-opacity duration-500 ${brand === "vf3" ? "opacity-100" : "opacity-0"}`}
      />
      <Image
        src="/datbike.jpg"
        alt="DatBike background"
        fill
        priority
        className={`absolute inset-0 object-cover transition-opacity duration-500 ${brand === "datbike" ? "opacity-100" : "opacity-0"}`}
      />
      <Image
        src="/pega.jpg"
        alt="Pega background"
        fill
        priority
        className={`absolute inset-0 object-cover transition-opacity duration-500 ${brand === "pega" ? "opacity-100" : "opacity-0"}`}
      />
      {/* // Dark overlay to improve text contrast */}
      <div className="absolute inset-0 bg-black/40" aria-hidden />

      <div className="container mx-auto relative z-10 px-4 md:px-6">
        {/* // Content grid: left text, right media */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            {/* // Headline + tagline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl xl:text-7xl/none font-bold tracking-tighter leading-tight text-white text-balance">
                Khám phá thế giới
                <span className="text-yellow-400"> xe điện </span>
                tuyệt vời
              </h1>
              <p className="max-w-[700px] text-white/85 md:text-2xl leading-relaxed text-pretty">
                Tìm kiếm chiếc xe hoàn hảo cho bạn với bộ sưu tập đa dạng từ các thương hiệu hàng đầu Việt Nam. Chất
                lượng cao, giá cả hợp lý, dịch vụ tận tâm.
              </p>
            </div>
            {/* // Primary CTA + jump to video */}
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="inline-flex items-center justify-center">
                Xem bộ sưu tập
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <a href="#hero-media" className="inline-flex">
                <Button variant="outline" size="lg" className="inline-flex items-center justify-center bg-transparent">
                <Play className="mr-2 h-4 w-4" />
                Xem video giới thiệu
                </Button>
              </a>
            </div>
          </div>
          {/* // Media player area (right column) */}
          <div className="flex items-center justify-center" id="hero-media">
            {/* // Video wrapper */}
            <div className="relative aspect-video w-full max-w-[600px] overflow-hidden rounded-xl shadow-lg" onContextMenu={(e) => e.preventDefault()}>
              {/* // Toggle button inside video overlay (switch media) */}
              <button
                type="button"
                onClick={() => {
                  setBrand((b) => (b === "vf3" ? "datbike" : b === "datbike" ? "pega" : "vf3"))
                  setBtnAnim(true)
                  setTimeout(() => setBtnAnim(false), 500)
                }}
                className="absolute top-0 right-0 end-0 left-auto z-10 inline-flex items-center gap-2 rounded-tl-md rounded-bl-md bg-white/85 px-3 py-1.5 text-sm font-medium text-gray-900 backdrop-blur hover:bg-white shadow transition active:scale-95 relative overflow-hidden origin-top-right"
                style={{ right: 0, left: "auto", top: 0 }}
                aria-label="Chuyển video khác"
              >
                {btnAnim && (
                  <span className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-white/60 animate-ping" />
                )}
                <RefreshCw className={`h-4 w-4 ${btnAnim ? "animate-spin" : ""}`} />
                Video khác
              </button>
              {/* // Layer: VF3 video */}
              <div
                className="absolute inset-0 transition-opacity duration-500 will-change-transform"
                style={{
                  opacity: brand === "vf3" ? 1 : 0,
                  transform: brand === "vf3" ? "scale(1)" : "scale(1.02)",
                  transition: "opacity 500ms, transform 500ms",
                }}
              >
                <HeroAutoplayVideo src="/vinfast.mp4" poster="/vinfast-vf3.jpg" />
              </div>
              {/* // Layer: DatBike video */}
              <div
                className="absolute inset-0 transition-opacity duration-500 will-change-transform"
                style={{
                  opacity: brand === "datbike" ? 1 : 0,
                  transform: brand === "datbike" ? "scale(1)" : "scale(1.02)",
                  transition: "opacity 500ms, transform 500ms",
                }}
              >
                <HeroAutoplayVideo src="/datbike.mp4" poster="/datbike.jpg" />
              </div>
              {/* // Layer: Pega video */}
              <div
                className="absolute inset-0 transition-opacity duration-500 will-change-transform"
                style={{
                  opacity: brand === "pega" ? 1 : 0,
                  transform: brand === "pega" ? "scale(1)" : "scale(1.02)",
                  transition: "opacity 500ms, transform 500ms",
                }}
              >
                <HeroAutoplayVideo src="/pegas.mp4" poster="/pega.jpg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroAutoplayVideo({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    // Try to autoplay video (muted)
    const v = videoRef.current
    if (!v) return

    const tryPlay = () => {
      if (!v) return
      v.muted = true
      const p = v.play()
      if (p && typeof p.then === "function") {
        p.catch(() => {
          // Autoplay might be blocked; keep muted and attempt later on visibility change
        })
      }
    }

    // Resume play when tab becomes visible again
    const handleVisibility = () => {
      if (document.visibilityState === "visible") tryPlay()
    }

    tryPlay()
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full"
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      // Prevent pausing: if paused by any means, resume
      onPause={(e) => {
        const v = e.currentTarget
        // Do not auto-resume if the video already ended
        if (v.ended) return
        v.muted = true
        v.play().catch(() => {})
      }}
      // Extra: discourage PIP/remote playback
      disablePictureInPicture
      controlsList="noplaybackrate nodownload noremoteplayback"
    />
  )
}
