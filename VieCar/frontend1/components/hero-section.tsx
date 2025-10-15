"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

function HeroAutoplayVideo({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        video.muted = true;
        await video.play();
        setIsLoading(false);
      } catch (error) {
        console.log("Autoplay prevented:", error);
        setIsLoading(false);
      }
    };

    const handleLoadedData = () => {
      setVideoError(false);
      playVideo();
    };
    
    const handleError = () => {
      console.error("Video failed to load:", src);
      setVideoError(true);
      setIsLoading(false);
    };

    const handleCanPlay = () => playVideo();
    
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    
    if (video.readyState >= 3) {
      playVideo();
    }
    
    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [src]);

  if (videoError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl group">
        <Image
          src={poster || "/vinfast-vf3.jpg"}
          alt="VinFast Video"
          fill
          className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-xl z-10">
          <div className="text-white text-sm animate-pulse">Đang tải video...</div>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
        loop
        muted
        playsInline
        autoPlay
        preload="metadata"
        poster={poster}
        style={{ minHeight: '300px' }}
      >
        <source src={src} type="video/mp4" />
        Trình duyệt của bạn không hỗ trợ video.
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Image
        src="/vinfast-vf3.jpg"
        alt="VinFast VF3 background"
        fill
        priority
        className="absolute inset-0 object-cover"
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden />

      <div className="container mx-auto relative z-10 px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16 xl:gap-20 items-center">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl/none font-bold tracking-tighter leading-tight text-white text-balance">
                Khám phá thế giới
                <span className="text-yellow-400"> xe điện </span>
                VinFast
              </h1>
              <p className="max-w-[600px] text-gray-200 md:text-xl leading-relaxed">
                Trải nghiệm công nghệ xe điện tiên tiến từ VinFast - thương hiệu xe điện hàng đầu Việt Nam với thiết kế hiện đại và tính năng thông minh
              </p>
            </div>

            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500">
                Đăng ký lái ngay
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:order-last">
            <div className="relative w-full max-w-3xl aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl bg-gray-900 border-2 border-yellow-400/30 transform hover:scale-[1.02] transition-all duration-500">
              <HeroAutoplayVideo src="/vinfast.mp4" poster="/vinfast-vf3.jpg" />
              <div className="absolute inset-0 rounded-2xl ring-2 ring-yellow-400/40 ring-inset"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/10 via-yellow-500/20 to-yellow-400/10 rounded-2xl blur-lg -z-10"></div>
              <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent rounded-3xl blur-2xl -z-20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}