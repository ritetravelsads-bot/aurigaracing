"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const banners = [
  {
    id: 1,
    title: "PRO INLINE",
    titleHighlight: "SKATE BOOTS",
    subtitle: "HANDCRAFTED EXCELLENCE",
    description: "Designed with Japanese Carbon Fiber and premium microfiber leather",
    image: "https://aurigaracing.com/wp-content/uploads/revslider/slider-1/1.png",
    link: "/products",
    buttonText: "Shop Boots",
  },
  {
    id: 2,
    title: "AERO",
    titleHighlight: "HELMETS",
    subtitle: "WIND TUNNEL TESTED",
    description: "Pure speed and unmatched performance for competitive racing",
    image: "https://aurigaracing.com/wp-content/uploads/revslider/slider-1/2.png",
    link: "/products",
    buttonText: "Explore Helmets",
  },
  {
    id: 3,
    title: "RACING",
    titleHighlight: "WHEELS",
    subtitle: "ENGINEERED FOR CHAMPIONS",
    description: "Speed, grip, and durability with Hydrogen Pro & MPC technology",
    image: "https://aurigaracing.com/wp-content/uploads/revslider/slider-1/3.png",
    link: "/products",
    buttonText: "View Wheels",
  },
]

export function HeroBannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [progress, setProgress] = useState(0)

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
    setProgress(0)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
    setProgress(0)
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
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-out",
            index === currentSlide 
              ? "opacity-100 z-10" 
              : "opacity-0 z-0"
          )}
        >
          {/* Content Grid */}
          <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* Left Content */}
            <div className="relative z-20 p-6 md:p-10 lg:p-14 flex flex-col justify-center h-full">
              <div className={cn(
                "space-y-3 max-w-lg transition-all duration-500 delay-100",
                index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                {/* Subtitle Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#bd9131]/30 bg-[#bd9131]/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#bd9131]" />
                  <span className="text-[#bd9131] text-xs font-semibold tracking-wider uppercase">
                    {banner.subtitle}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {banner.title}
                  <br />
                  <span className="text-[#bd9131]">{banner.titleHighlight}</span>
                </h1>

                {/* Description */}
                <p className="text-sm md:text-base text-neutral-300 leading-relaxed max-w-sm">
                  {banner.description}
                </p>

                {/* CTA Button */}
                <div className="pt-2">
                  <Button
                    asChild
                    size="sm"
                    className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-5"
                  >
                    <Link href={banner.link}>
                      {banner.buttonText}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-full hidden lg:flex items-center justify-center">
              <div className={cn(
                "relative w-full h-full transition-all duration-700 delay-200",
                index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}>
                <Image
                  src={banner.image || "/placeholder.svg"}
                  alt={banner.title}
                  fill
                  className="object-contain object-center"
                  priority={index === 0}
                />
              </div>
            </div>
          </div>

          {/* Mobile Background Image */}
          <div className="absolute inset-0 lg:hidden">
            <Image
              src={banner.image || "/placeholder.svg"}
              alt={banner.title}
              fill
              className="object-contain object-bottom opacity-30"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full border border-white/20 bg-black/50 text-white flex items-center justify-center transition-all hover:bg-[#bd9131] hover:border-[#bd9131]"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full border border-white/20 bg-black/50 text-white flex items-center justify-center transition-all hover:bg-[#bd9131] hover:border-[#bd9131]"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Bottom Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
        {/* Slide Counter */}
        <div className="hidden md:flex items-center gap-1 text-white/60 font-mono text-xs">
          <span className="text-[#bd9131] font-bold">{String(currentSlide + 1).padStart(2, '0')}</span>
          <span>/</span>
          <span>{String(banners.length).padStart(2, '0')}</span>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div className={cn(
                "w-8 h-0.5 rounded-full transition-all",
                index === currentSlide ? "bg-white/30" : "bg-white/10 hover:bg-white/20"
              )}>
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

      {/* Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bd9131]/50 to-transparent" />
    </div>
  )
}
