"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const banners = [
  {
    id: 1,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-ulzW1fQW32GSccDd5OYURcOlH9Batv.png",
    alt: "Inferno Boots - Custom Fit Guaranteed",
    link: "/products?category=boots",
  },
  {
    id: 2,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-q4pJRJXV3JBOO0Zyq6JQ2jHbgTrCPW.png",
    alt: "TENET HI-LO Frames - Podium Proven",
    link: "/products?category=frames",
  },
  {
    id: 3,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-J5GTy7qRCWkMfPmKwKG8uwmOfLl9qy.png",
    alt: "TENET Frames - Precision and Power Redefined",
    link: "/products?category=frames",
  },
]

export function HeroBannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left")

  useEffect(() => {
    if (!isAutoPlaying) return

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setSlideDirection("left")
          setCurrentSlide((current) => (current + 1) % banners.length)
          return 0
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [isAutoPlaying, currentSlide])

  const goToSlide = (index: number) => {
    setSlideDirection(index > currentSlide ? "left" : "right")
    setCurrentSlide(index)
    setProgress(0)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Slides - Full Width Images with Slide Animation */}
      {banners.map((banner, index) => {
        const isActive = index === currentSlide
        const isPrev = index === (currentSlide - 1 + banners.length) % banners.length
        const isNext = index === (currentSlide + 1) % banners.length

        return (
          <Link
            href={banner.link}
            key={banner.id}
            className={cn(
              "absolute inset-0 cursor-pointer transition-transform duration-700 ease-in-out",
              isActive && "z-20 translate-x-0",
              !isActive && slideDirection === "left" && isPrev && "z-10 -translate-x-full",
              !isActive && slideDirection === "left" && isNext && "z-10 translate-x-full",
              !isActive && slideDirection === "right" && isPrev && "z-10 -translate-x-full",
              !isActive && slideDirection === "right" && isNext && "z-10 translate-x-full",
              !isActive && !isPrev && !isNext && "z-0 translate-x-full opacity-0"
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
          </Link>
        )
      })}

      {/* Bottom Navigation - Progress Dots Only */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
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
