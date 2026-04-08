import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Shield, Clock, Headphones, ArrowRight, ChevronRight, Sparkles, Zap, Award, Star } from "lucide-react"
import { getImageKitUrl } from "@/lib/imagekit"
import { Hero3DScene } from "@/components/hero-3d-scene"
import { AnimatedParticles } from "@/components/animated-particles"
import { Hoodie3D } from "@/components/hoodie-3d"
import { createClient } from "@/lib/supabase/server"
import { getProductsByCategory } from "@/lib/mongodb/helpers"
import Bootie3D from "@/components/bootie-3d"
import { Helmet3D } from "@/components/helmet-3d"
import { HeroBannerSlider } from "@/components/hero-banner-slider"
import Frame3DClouds from "@/components/frame-3d-clouds"
import BootGrey3D from "@/components/boot-grey-3d"
import Wheel3D from "@/components/wheel-3d"
import { CadetSkate3D } from "@/components/cadet-skate-3d"
import { BootBanner3D } from "@/components/boot-banner-3d"
import { EcommerceProductCard } from "@/components/ecommerce-product-card"
import { DealCountdown } from "@/components/deal-countdown"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: dealProducts, error: dealError } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("deal_of_the_day", true)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6)

  if (dealError) {
    console.error("[v0] Error fetching deal products:", dealError)
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .is("parent_id", null)
    .order("name")

  if (categoriesError) {
    console.error("[v0] Error fetching categories:", categoriesError)
  }

  const { data: inlineSkatingCategory, error: inlineError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "inline-speed-skating")
    .eq("is_active", true)
    .maybeSingle()

  if (inlineError) {
    console.error("[v0] Error fetching inline category:", inlineError)
  }

  const { data: bootsCategory, error: bootsError } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", "%boots%")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle()

  if (bootsError) {
    console.error("[v0] Error fetching boots category:", bootsError)
  }

  const { data: framesCategory, error: framesError } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", "%frames%")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle()

  if (framesError) {
    console.error("[v0] Error fetching frames category:", framesError)
  }

  const { data: wheelsCategory, error: wheelsError } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", "%wheels%")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle()

  if (wheelsError) {
    console.error("[v0] Error fetching wheels category:", wheelsError)
  }

  const { data: packagesCategory, error: packagesError } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", "%packages%")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle()

  if (packagesError) {
    console.error("[v0] Error fetching packages category:", packagesError)
  }

  let inlineProducts: any[] = []
  let bootsProducts: any[] = []
  let framesProducts: any[] = []
  let wheelsProducts: any[] = []
  let packagesProducts: any[] = []

  if (inlineSkatingCategory?.id) {
    try {
      inlineProducts = await getProductsByCategory(inlineSkatingCategory.id, {
        isActive: true,
        status: "published",
        limit: 8,
      })
    } catch (error) {
      console.error("[v0] Error fetching inline products:", error)
    }
  }

  if (bootsCategory?.id) {
    try {
      bootsProducts = await getProductsByCategory(bootsCategory.id, {
        isActive: true,
        status: "published",
        limit: 8,
      })
    } catch (error) {
      console.error("[v0] Error fetching boots products:", error)
    }
  }

  if (framesCategory?.id) {
    try {
      framesProducts = await getProductsByCategory(framesCategory.id, {
        isActive: true,
        status: "published",
        limit: 8,
      })
    } catch (error) {
      console.error("[v0] Error fetching frames products:", error)
    }
  }

  if (wheelsCategory?.id) {
    try {
      wheelsProducts = await getProductsByCategory(wheelsCategory.id, {
        isActive: true,
        status: "published",
        limit: 8,
      })
    } catch (error) {
      console.error("[v0] Error fetching wheels products:", error)
    }
  }

  if (packagesCategory?.id) {
    try {
      packagesProducts = await getProductsByCategory(packagesCategory.id, {
        isActive: true,
        status: "published",
        limit: 8,
      })
    } catch (error) {
      console.error("[v0] Error fetching packages products:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden h-[600px] md:h-[700px] lg:h-[800px]">
        <Hero3DScene />
        <AnimatedParticles />
        <HeroBannerSlider />
      </section>

      {/* Brand Statement */}
      <section className="relative py-16 md:py-20 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#bd9131]/5 via-transparent to-[#bd9131]/5" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#bd9131]" />
            <Award className="w-6 h-6 text-[#bd9131]" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#bd9131]" />
          </div>
          <p className="text-xl md:text-2xl lg:text-3xl font-light text-white/90 italic text-balance leading-relaxed max-w-4xl mx-auto">
            &quot;Auriga Racing: True Racing... The Outcome of several years of research and hard work&quot;
          </p>
          <div className="mt-6 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-[#bd9131] fill-[#bd9131]" />
            ))}
          </div>
        </div>
      </section>

      {/* Deal of the Day */}
      {dealProducts && dealProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bd9131]/30 to-transparent" />
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
                <Zap className="w-4 h-4 text-red-500" />
                <span className="text-red-500 text-sm font-semibold uppercase tracking-wider">Limited Time Offer</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
                DEAL OF THE <span className="text-gradient-gold">DAY</span>
              </h2>
              <p className="text-muted-foreground mb-8">Grab these exclusive deals before time runs out</p>
              <DealCountdown />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {dealProducts.slice(0, 6).map((product) => (
                <EcommerceProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 text-base shadow-gold group">
                <Link href="/products?deal=true">
                  View All Deals
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Hoodie Banner */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-white">
              <Badge className="bg-white/20 text-white border-white/30 mb-6 px-4 py-1.5">
                <Sparkles className="w-4 h-4 mr-2" />
                New Collection
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-balance leading-tight">
                Auriga Racing<br />
                <span className="text-[#bd9131]">Hoodies</span>
              </h2>
              <p className="text-lg md:text-xl mb-8 text-white/80 leading-relaxed max-w-md">
                Look stylish and fabulous during the winters supporting a suave and elegant Auriga Racing hoodies in Navy Blue color.
              </p>
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 text-base shadow-gold-lg group">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[400px] md:h-[500px] w-full">
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bd9131]"></div></div>}>
                <Hoodie3D />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      {categories && categories.length > 0 && (
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-6 px-4 py-1.5">
                Browse Collection
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                SHOP BY <span className="text-gradient-gold">CATEGORY</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our complete range of professional racing equipment
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
              {categories.map((category, index) => (
                <Link key={category.id} href={`/products/category/${category.slug}`} className="group">
                  <Card className="overflow-hidden border-0 bg-card shadow-sm hover:shadow-xl transition-all duration-500 h-full group-hover:scale-[1.02]">
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 overflow-hidden relative">
                      <Image
                        src={getImageKitUrl(category.image_url, { height: 400, width: 400 }) || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        <Button className="w-full bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold">
                          Explore <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="text-center py-6">
                      <CardTitle className="text-lg font-bold group-hover:text-[#bd9131] transition-colors">
                        {category.name}
                      </CardTitle>
                      {category.description && (
                        <CardDescription className="line-clamp-2 text-sm">
                          {category.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ankle Booties Banner */}
      <section className="py-20 md:py-28 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-neutral-900 to-black" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1">
              <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-6 px-4 py-1.5">
                Premium Quality
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-balance leading-tight">
                Auriga Racing<br />
                <span className="text-[#bd9131]">Ankle Booties</span>
              </h2>
              <p className="text-lg md:text-xl mb-8 text-neutral-300 leading-relaxed max-w-md">
                Made with special fabric bonded with superfine microfiber Lycra for the most advanced anti-friction and anti-blisters properties.
              </p>
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 text-base shadow-gold-lg group">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[400px] md:h-[500px] w-full">
              <Bootie3D />
            </div>
          </div>
        </div>
      </section>

      {/* Inline Speed Skating Products */}
      {inlineProducts && inlineProducts.length > 0 && (
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-6 px-4 py-1.5">
                Featured Collection
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                INLINE SPEED <span className="text-gradient-gold">SKATING</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover our premium collection of inline speed skating equipment
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
              {inlineProducts.slice(0, 8).map((product: any) => (
                <EcommerceProductCard key={product.id} product={product} variant="compact" />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 text-base shadow-gold group">
                <Link href="/products/category/inline-speed-skating">
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Pro Boots Banner */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#bd9131] via-[#d4a84b] to-[#a17d27] text-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.2) 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <Badge className="bg-black/20 text-black border-black/30 mb-6 px-4 py-1.5">
                Handcrafted Excellence
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-balance leading-tight">
                Pro Inline<br />Skate Boots
              </h2>
              <p className="text-lg md:text-xl mb-8 text-black/80 leading-relaxed max-w-md">
                Designed in India using the finest Japanese Carbon Fiber and microfiber leather, purely handmade with love by master craftsmen.
              </p>
              <Button asChild size="lg" className="bg-black hover:bg-neutral-900 text-white font-bold px-10 py-6 text-base group">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[400px] md:h-[500px] w-full">
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>}>
                <BootBanner3D />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Helmets Full Width Banner */}
      <section className="relative h-[500px] md:h-[600px] bg-black overflow-hidden group">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop"
          alt="Speed Skating Helmets"
          fill
          className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-xl">
              <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-6 px-4 py-1.5">
                Safety First
              </Badge>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 animate-slide-in-left">
                Premium<br /><span className="text-[#bd9131]">Helmets</span>
              </h2>
              <p className="text-xl text-white/80 mb-8 animate-slide-in-left animation-delay-200">
                Aerodynamic design for maximum performance and safety
              </p>
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 animate-slide-in-left animation-delay-300 group">
                <Link href="/products">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Aero Helmets 3D Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-neutral-300 via-neutral-400 to-neutral-500 text-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1">
              <Badge className="bg-black/10 text-black border-black/20 mb-6 px-4 py-1.5">
                Wind Tunnel Tested
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-balance leading-tight">
                Auriga Racing<br /><span className="text-white drop-shadow-lg">Aero Helmets</span>
              </h2>
              <p className="text-lg md:text-xl mb-8 text-black/70 leading-relaxed max-w-md">
                Delivering not just aerodynamics but pure speed and unmatched performance. Proven results in wind tunnel testing.
              </p>
              <Button asChild size="lg" className="bg-white hover:bg-neutral-100 text-black font-bold px-10 py-6 text-base shadow-lg group">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[400px] md:h-[500px] w-full">
              <Helmet3D />
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Collection */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-6 px-4 py-1.5">
              Specialized Equipment
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
              SHOP BY <span className="text-gradient-gold">COLLECTION</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our specialized equipment collections for every need
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {[
              { name: "Boots", icon: "boot" },
              { name: "Frames", icon: "frame" },
              { name: "Wheels", icon: "wheel" },
              { name: "Bearings", icon: "bearing" },
              { name: "Helmets", icon: "helmet" },
              { name: "Skate Packages", icon: "package" }
            ].map((collection) => (
              <Link key={collection.name} href="/products" className="group">
                <Card className="overflow-hidden border-0 bg-card shadow-sm hover:shadow-xl transition-all duration-500 group-hover:scale-[1.02]">
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-[#bd9131]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Sparkles className="w-10 h-10 text-[#bd9131]" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <CardHeader className="text-center py-6">
                    <CardTitle className="text-xl font-bold group-hover:text-[#bd9131] transition-colors">
                      {collection.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                    <Button className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold">
                      Explore <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Skate Packages Section */}
      {packagesProducts && packagesProducts.length > 0 && (
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-6 px-4 py-1.5">
                Complete Solutions
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                SKATE <span className="text-gradient-gold">PACKAGES</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete skating solutions for every level
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {packagesProducts.map((product: any) => (
                <EcommerceProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 text-base shadow-gold group">
                <Link href="/products">
                  View All Packages
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Cadet Skates Banner */}
      <section className="py-20 md:py-28 bg-white text-black relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 relative h-[400px] md:h-[500px] w-full">
              <CadetSkate3D />
            </div>
            <div className="flex-1">
              <Badge className="bg-[#bd9131]/10 text-[#bd9131] border-[#bd9131]/30 mb-6 px-4 py-1.5">
                Versatile Design
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-balance leading-tight">
                Cadet Inline Skates<br /><span className="text-[#bd9131]">4x90 / 3x110</span>
              </h2>
              <p className="text-lg md:text-xl mb-8 text-neutral-600 leading-relaxed max-w-md">
                Versatility meets performance. Transform from three wheels to four wheels race setup in the same skate package.
              </p>
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 text-base shadow-gold group">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Boots Full Width Banner */}
      <section className="relative h-[500px] md:h-[600px] bg-black overflow-hidden group">
        <Image
          src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=1920&h=1080&fit=crop"
          alt="Inline Skate Boots"
          fill
          className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-end">
          <div className="container mx-auto px-4">
            <div className="max-w-xl ml-auto text-right">
              <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-6 px-4 py-1.5">
                Precision Engineering
              </Badge>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6">
                Precision<br /><span className="text-[#bd9131]">Boots</span>
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Handcrafted perfection for elite athletes
              </p>
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 group">
                <Link href="/products">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Boots Products Section */}
      {bootsProducts && bootsProducts.length > 0 && (
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-6 px-4 py-1.5">
                Engineered for Champions
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                RACING <span className="text-gradient-gold">BOOTS</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Crafted with precision for ultimate performance
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
              {bootsProducts.slice(0, 8).map((product: any) => (
                <EcommerceProductCard key={product.id} product={product} variant="compact" />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 text-base shadow-gold group">
                <Link href="/products">
                  View All Boots
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Boot Grey 3D Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-neutral-500 via-neutral-600 to-neutral-700 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1">
              <Badge className="bg-white/20 text-white border-white/30 mb-6 px-4 py-1.5">
                Japanese Carbon Fiber
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-balance leading-tight">
                Pro Inline<br /><span className="text-[#bd9131]">Skate Boots</span>
              </h2>
              <p className="text-lg md:text-xl mb-8 text-white/80 leading-relaxed max-w-md">
                Designed in India and produced by master leather craftsmen. Purely handmade with the finest materials.
              </p>
              <Button asChild size="lg" className="bg-white hover:bg-neutral-100 text-black font-bold px-10 py-6 text-base group">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[400px] md:h-[500px] w-full">
              <BootGrey3D />
            </div>
          </div>
        </div>
      </section>

      {/* Frames Full Width Banner */}
      <section className="relative h-[500px] md:h-[600px] bg-black overflow-hidden group">
        <Image
          src="https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1920&h=1080&fit=crop"
          alt="Inline Skate Frames"
          fill
          className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-xl">
              <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-6 px-4 py-1.5">
                Advanced Engineering
              </Badge>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6">
                Performance<br /><span className="text-[#bd9131]">Frames</span>
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Built for speed and stability
              </p>
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 group">
                <Link href="/products">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Frames Products Section */}
      {framesProducts && framesProducts.length > 0 && (
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-6 px-4 py-1.5">
                Advanced Engineering
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                RACING <span className="text-gradient-gold">FRAMES</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Competitive edge through advanced engineering
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
              {framesProducts.slice(0, 8).map((product: any) => (
                <EcommerceProductCard key={product.id} product={product} variant="compact" />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 text-base shadow-gold group">
                <Link href="/products">
                  View All Frames
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* OCCULT Frames Banner */}
      <section className="py-20 md:py-28 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(189, 145, 49, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-6 px-4 py-1.5">
                High-Speed Racing
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-balance leading-tight">
                OCCULT 4x110<br /><span className="text-[#bd9131]">Inline Frames</span>
              </h2>
              <p className="text-lg md:text-xl mb-8 text-neutral-300 leading-relaxed max-w-md">
                Solid frames specially designed and engineered for exceptional performance in intense high-speed racing.
              </p>
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 text-base shadow-gold-lg group">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[400px] md:h-[500px] w-full">
              <Frame3DClouds />
            </div>
          </div>
        </div>
      </section>

      {/* Wheels Full Width Banner */}
      <section className="relative h-[500px] md:h-[600px] bg-black overflow-hidden group">
        <Image
          src="https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=1920&h=1080&fit=crop"
          alt="Inline Skate Wheels"
          fill
          className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-end">
          <div className="container mx-auto px-4">
            <div className="max-w-xl ml-auto text-right">
              <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-6 px-4 py-1.5">
                Performance Wheels
              </Badge>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6">
                High-Speed<br /><span className="text-[#bd9131]">Wheels</span>
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Engineered for champions
              </p>
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 group">
                <Link href="/products">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Wheels Products Section */}
      {wheelsProducts && wheelsProducts.length > 0 && (
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-6 px-4 py-1.5">
                Performance Wheels
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                RACING <span className="text-gradient-gold">WHEELS</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                High-performance wheels for every condition
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
              {wheelsProducts.slice(0, 8).map((product: any) => (
                <EcommerceProductCard key={product.id} product={product} variant="compact" />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 text-base shadow-gold group">
                <Link href="/products">
                  View All Wheels
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* MPC Storm Surge Banner */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1">
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 mb-6 px-4 py-1.5">
                All Weather Performance
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-balance leading-tight text-black">
                MPC Storm Surge<br /><span className="text-[#bd9131]">100mm XFirm</span>
              </h2>
              <p className="text-lg md:text-xl mb-8 text-neutral-600 leading-relaxed max-w-md">
                Own the road in the rain. The best wheels ever produced for rain conditions.
              </p>
              <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-10 py-6 text-base shadow-gold group">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[400px] md:h-[500px] w-full">
              <Wheel3D />
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-6 px-4 py-1.5">
              Stay Updated
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
              LATEST <span className="text-gradient-gold">NEWS</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay updated with our latest announcements and stories
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="overflow-hidden border-0 bg-card shadow-sm hover:shadow-xl transition-all duration-500 group hover:scale-[1.02]">
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                  <Image
                    src={`https://images.unsplash.com/photo-${item === 1 ? '1558618666-fcd25c85cd64' : item === 2 ? '1461897104016-0b3b00cc81ee' : '1473496169904-658ba7c44d8a'}?w=600&h=400&fit=crop`}
                    alt={`News ${item}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-[#bd9131] text-black border-0">News</Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="text-sm text-[#bd9131] font-medium mb-2">December 2024</div>
                  <CardTitle className="text-xl font-bold group-hover:text-[#bd9131] transition-colors">
                    Latest Updates from Auriga Racing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Discover what&apos;s new in the world of speed skating and our latest product innovations.
                  </p>
                  <Button variant="link" className="text-[#bd9131] p-0 h-auto font-semibold group/btn">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="border-[#bd9131]/30 text-foreground hover:bg-[#bd9131]/10 hover:border-[#bd9131]/50 px-10 py-6">
              <Link href="/blog">View All News</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-[#bd9131]/5">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {[
              { icon: Truck, title: "Free Delivery", desc: "For all orders over $99" },
              { icon: Clock, title: "30 Days Return", desc: "If goods have problems" },
              { icon: Shield, title: "Secure Payment", desc: "100% secure payment" },
              { icon: Headphones, title: "24/7 Support", desc: "Dedicated support team" }
            ].map((feature, index) => (
              <Card key={index} className="text-center border-0 bg-card shadow-sm hover:shadow-xl transition-all duration-500 group hover:scale-[1.02]">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#bd9131]/10 group-hover:bg-[#bd9131]/20 transition-colors">
                    <feature.icon className="h-8 w-8 text-[#bd9131]" />
                  </div>
                  <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#bd9131]/10 via-transparent to-[#bd9131]/10" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(189, 145, 49, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-8 px-6 py-2">
            Join the Champions
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 text-balance leading-tight">
            Ready to Elevate Your<br /><span className="text-gradient-gold">Performance?</span>
          </h2>
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of athletes who trust Auriga Racing for world-class speed skating equipment
          </p>
          <Button asChild size="lg" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold px-12 py-7 text-lg shadow-gold-lg group">
            <Link href="/products">
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
