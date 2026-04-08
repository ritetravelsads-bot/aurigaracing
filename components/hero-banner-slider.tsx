"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const banners = [
  {
    id: 1,
    image: "https://aurigaracing.com/wp-content/uploads/revslider/slider-1/1.png",
    alt: "Pro Inline Skate Boots - Handcrafted Excellence",
  },
  {
    id: 2,
    image: "https://aurigaracing.com/wp-content/uploads/revslider/slider-1/2.png",
    alt: "Aero Helmets - Wind Tunnel Tested",
  },
  {
    id: 3,
    image: "https://aurigaracing.com/wp-content/uploads/revslider/slider-1/3.png",
    alt: "Racing Wheels - Engineered for Champions",
  },
]

export function HeroBannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [progress, setProgress] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
    setProgress(0)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
    setProgress(0)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((current) => (current + 1) % banners.length)
          return 0
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [isAutoPlaying, currentSlide])

  const handleNavigation = (direction: "prev" | "next") => {
    if (direction === "prev") {
      prevSlide()
    } else {
      nextSlide()
    }
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setProgress(0)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Slides - Full Width Images */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-out",
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={banner.image || "/placeholder.svg"}
            alt={banner.alt}
            fill
            className="object-cover object-center"
            priority={index === 0}
            sizes="100vw"
          />
          {/* Subtle gradient overlay for better visibility of navigation */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={() => handleNavigation("prev")}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-white/30 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:bg-[#bd9131] hover:border-[#bd9131] hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => handleNavigation("next")}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-white/30 bg-black/40 backdrop-blur-sm text-white flex items-center justify-center transition-all hover:bg-[#bd9131] hover:border-[#bd9131] hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Bottom Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
        {/* Slide Counter */}
        <div className="hidden md:flex items-center gap-1.5 text-white/80 font-mono text-sm bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="text-[#bd9131] font-bold">{String(currentSlide + 1).padStart(2, "0")}</span>
          <span className="text-white/50">/</span>
          <span>{String(banners.length).padStart(2, "0")}</span>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-3 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative group"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={cn(
                  "w-10 h-1 rounded-full transition-all",
                  index === currentSlide ? "bg-white/40" : "bg-white/20 hover:bg-white/30"
                )}
              >
                {index === currentSlide && (
                  <div
                    className="h-full bg-[#bd9131] rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Border Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#bd9131]/60 to-transparent" />
    </div>
  )
}
