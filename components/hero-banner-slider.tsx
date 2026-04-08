"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowRight, Play } from "lucide-react"
import { cn } from "@/lib/utils"

const banners = [
  {
    id: 1,
    title: "PRO INLINE",
    titleHighlight: "SKATE BOOTS",
    subtitle: "HANDCRAFTED EXCELLENCE",
    description: "Designed with Japanese Carbon Fiber and premium microfiber leather by master craftsmen",
    image: "https://aurigaracing.com/wp-content/uploads/revslider/slider-1/1.png",
    link: "/products",
    buttonText: "Shop Boots",
    stats: [
      { value: "100%", label: "Carbon Fiber" },
      { value: "Handmade", label: "Craftsmanship" },
    ],
  },
  {
    id: 2,
    title: "AERO",
    titleHighlight: "HELMETS",
    subtitle: "WIND TUNNEL TESTED",
    description: "Delivering aerodynamics, pure speed, and unmatched performance for competitive racing",
    image: "https://aurigaracing.com/wp-content/uploads/revslider/slider-1/2.png",
    link: "/products",
    buttonText: "Explore Helmets",
    stats: [
      { value: "-15%", label: "Drag Reduction" },
      { value: "Elite", label: "Performance" },
    ],
  },
  {
    id: 3,
    title: "RACING",
    titleHighlight: "WHEELS",
    subtitle: "ENGINEERED FOR CHAMPIONS",
    description: "Speed, grip, and durability in every roll with Hydrogen Pro & MPC Storm Surge technology",
    image: "https://aurigaracing.com/wp-content/uploads/revslider/slider-1/3.png",
    link: "/products",
    buttonText: "View Wheels",
    stats: [
      { value: "Pro", label: "Grade" },
      { value: "All Weather", label: "Performance" },
    ],
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
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(189, 145, 49, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={cn(
            "absolute inset-0 transition-all duration-1000 ease-out",
            index === currentSlide 
              ? "opacity-100 z-10" 
              : index === (currentSlide - 1 + banners.length) % banners.length
                ? "opacity-0 z-0 -translate-x-full"
                : "opacity-0 z-0 translate-x-full"
          )}
        >
          {/* Content Grid */}
          <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* Left Content */}
            <div className="relative z-20 p-8 md:p-16 lg:p-20 flex flex-col justify-center h-full">
              <div className={cn(
                "space-y-6 max-w-xl transition-all duration-700 delay-200",
                index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}>
                {/* Subtitle Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#bd9131]/30 bg-[#bd9131]/10 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-[#bd9131] animate-pulse" />
                  <span className="text-[#bd9131] text-sm font-semibold tracking-[0.2em] uppercase">
                    {banner.subtitle}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight">
                  {banner.title}
                  <br />
                  <span className="text-gradient-gold">{banner.titleHighlight}</span>
                </h1>

                {/* Description */}
                <p className="text-lg md:text-xl text-neutral-300 leading-relaxed max-w-md">
                  {banner.description}
                </p>

                {/* Stats */}
                <div className="flex gap-8 pt-4">
                  {banner.stats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-[#bd9131]">{stat.value}</div>
                      <div className="text-xs text-neutral-400 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-8 py-6 text-base group transition-all duration-300 hover:shadow-gold-lg"
                  >
                    <Link href={banner.link}>
                      {banner.buttonText}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-[#bd9131]/50 px-8 py-6 backdrop-blur-sm"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Video
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-full hidden lg:flex items-center justify-center">
              <div className={cn(
                "relative w-full h-full transition-all duration-1000 delay-300",
                index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}>
                <Image
                  src={banner.image || "/placeholder.svg"}
                  alt={banner.title}
                  fill
                  className="object-contain object-center"
                  priority={index === 0}
                />
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-radial from-[#bd9131]/10 via-transparent to-transparent opacity-50" />
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
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full border border-white/20 bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 hover:bg-[#bd9131] hover:border-[#bd9131] hover:scale-110 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full border border-white/20 bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 hover:bg-[#bd9131] hover:border-[#bd9131] hover:scale-110 group"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Bottom Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6">
        {/* Slide Counter */}
        <div className="hidden md:flex items-center gap-2 text-white/60 font-mono text-sm">
          <span className="text-[#bd9131] text-lg font-bold">{String(currentSlide + 1).padStart(2, '0')}</span>
          <span>/</span>
          <span>{String(banners.length).padStart(2, '0')}</span>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative group"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div className={cn(
                "w-12 h-1 rounded-full transition-all duration-300",
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

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bd9131]/50 to-transparent" />
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-[#bd9131]/20 to-transparent" />
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-[#bd9131]/20 to-transparent" />
    </div>
  )
}
