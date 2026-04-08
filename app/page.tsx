import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Shield, Clock, Headphones, ArrowRight, ChevronRight, Sparkles, Zap, Award, Star } from "lucide-react"
import { getImageKitUrl } from "@/lib/imagekit"
import { createClient } from "@/lib/supabase/server"
import { getProductsByCategory } from "@/lib/mongodb/helpers"
import { HeroBannerSlider } from "@/components/hero-banner-slider"
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
      {/* Hero Section - Full Width Image Slider (1500x450 banners - 3.33:1 aspect ratio) */}
      <section className="relative bg-black text-white overflow-hidden w-full aspect-[1500/450]">
        <HeroBannerSlider />
      </section>

      {/* Brand Statement */}
      <section className="relative py-8 md:py-10 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#bd9131]/5 via-transparent to-[#bd9131]/5" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#bd9131]" />
            <Award className="w-4 h-4 text-[#bd9131]" />
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#bd9131]" />
          </div>
          <p className="text-base md:text-lg font-light text-white/90 italic text-balance leading-relaxed max-w-3xl mx-auto">
            &quot;Auriga Racing: True Racing... The Outcome of several years of research and hard work&quot;
          </p>
          <div className="mt-3 flex items-center justify-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 text-[#bd9131] fill-[#bd9131]" />
            ))}
          </div>
        </div>
      </section>

      {/* Deal of the Day */}
      {dealProducts && dealProducts.length > 0 && (
        <section className="py-10 md:py-14 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bd9131]/30 to-transparent" />
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                <Zap className="w-3 h-3 text-red-500" />
                <span className="text-red-500 text-xs font-semibold uppercase tracking-wider">Limited Time</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                DEAL OF THE <span className="text-[#bd9131]">DAY</span>
              </h2>
              <p className="text-muted-foreground text-sm mb-4">Grab these exclusive deals before time runs out</p>
              <DealCountdown />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {dealProducts.slice(0, 6).map((product) => (
                <EcommerceProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products?deal=true">
                  View All Deals
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Hoodie Banner */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-white">
              <Badge className="bg-white/20 text-white border-white/30 mb-4 text-xs px-2 py-0.5">
                <Sparkles className="w-3 h-3 mr-1" />
                New Collection
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Auriga Racing <span className="text-[#bd9131]">Hoodies</span>
              </h2>
              <p className="text-sm md:text-base mb-5 text-white/80 leading-relaxed max-w-md">
                Look stylish and fabulous during winters supporting a suave and elegant Auriga Racing hoodies in Navy Blue.
              </p>
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[250px] md:h-[300px] w-full">
              <Image
                src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop"
                alt="Auriga Racing Hoodie"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      {categories && categories.length > 0 && (
        <section className="py-10 md:py-14 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-3 text-xs px-2 py-0.5">
                Browse Collection
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                SHOP BY <span className="text-[#bd9131]">CATEGORY</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Explore our complete range of professional racing equipment
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {categories.map((category) => (
                <Link key={category.id} href={`/products/category/${category.slug}`} className="group">
                  <Card className="overflow-hidden border-0 bg-card shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                    <div className="aspect-square bg-muted overflow-hidden relative">
                      <Image
                        src={getImageKitUrl(category.image_url, { height: 300, width: 300 }) || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardHeader className="text-center py-3">
                      <CardTitle className="text-sm font-semibold group-hover:text-[#bd9131] transition-colors">
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ankle Booties Banner */}
      <section className="py-12 md:py-16 bg-black text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1">
              <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-4 text-xs px-2 py-0.5">
                Premium Quality
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Auriga Racing <span className="text-[#bd9131]">Ankle Booties</span>
              </h2>
              <p className="text-sm md:text-base mb-5 text-neutral-300 leading-relaxed max-w-md">
                Made with special fabric bonded with superfine microfiber Lycra for anti-friction and anti-blisters properties.
              </p>
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[250px] md:h-[300px] w-full">
              <Image
                src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop"
                alt="Ankle Booties"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Inline Speed Skating Products */}
      {inlineProducts && inlineProducts.length > 0 && (
        <section className="py-10 md:py-14 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-3 text-xs px-2 py-0.5">
                Featured Collection
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                INLINE SPEED <span className="text-[#bd9131]">SKATING</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Discover our premium collection of inline speed skating equipment
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {inlineProducts.slice(0, 8).map((product: any) => (
                <EcommerceProductCard key={product.id} product={product} variant="compact" />
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products/category/inline-speed-skating">
                  View All Products
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Pro Boots Banner */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#bd9131] via-[#d4a84b] to-[#a17d27] text-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <Badge className="bg-black/20 text-black border-black/30 mb-4 text-xs px-2 py-0.5">
                Handcrafted Excellence
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Pro Inline Skate Boots
              </h2>
              <p className="text-sm md:text-base mb-5 text-black/80 leading-relaxed max-w-md">
                Designed in India using the finest Japanese Carbon Fiber and microfiber leather, purely handmade.
              </p>
              <Button asChild size="sm" className="bg-black hover:bg-neutral-900 text-white font-semibold px-6">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[250px] md:h-[300px] w-full">
              <Image
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"
                alt="Pro Inline Skate Boots"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Helmets Full Width Banner */}
      <section className="relative h-[300px] md:h-[350px] bg-black overflow-hidden group">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=800&fit=crop"
          alt="Speed Skating Helmets"
          fill
          className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-md">
              <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-3 text-xs px-2 py-0.5">
                Safety First
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Premium <span className="text-[#bd9131]">Helmets</span>
              </h2>
              <p className="text-sm text-white/80 mb-4">
                Aerodynamic design for maximum performance and safety
              </p>
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  Explore Collection
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Aero Helmets Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-neutral-300 via-neutral-400 to-neutral-500 text-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1">
              <Badge className="bg-black/10 text-black border-black/20 mb-4 text-xs px-2 py-0.5">
                Wind Tunnel Tested
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Auriga Racing <span className="text-white drop-shadow-md">Aero Helmets</span>
              </h2>
              <p className="text-sm md:text-base mb-5 text-black/70 leading-relaxed max-w-md">
                Delivering not just aerodynamics but pure speed and unmatched performance.
              </p>
              <Button asChild size="sm" className="bg-white hover:bg-neutral-100 text-black font-semibold px-6 shadow">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[250px] md:h-[300px] w-full">
              <Image
                src="https://images.unsplash.com/photo-1557803175-2f8c4482f92c?w=600&h=600&fit=crop"
                alt="Aero Helmets"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Collection */}
      <section className="py-10 md:py-14 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-3 text-xs px-2 py-0.5">
              Specialized Equipment
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
              SHOP BY <span className="text-[#bd9131]">COLLECTION</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Discover our specialized equipment collections
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {[
              { name: "Boots", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop" },
              { name: "Frames", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" },
              { name: "Wheels", image: "https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=400&h=300&fit=crop" },
              { name: "Bearings", image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400&h=300&fit=crop" },
              { name: "Helmets", image: "https://images.unsplash.com/photo-1557803175-2f8c4482f92c?w=400&h=300&fit=crop" },
              { name: "Skate Packages", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop" }
            ].map((collection) => (
              <Link key={collection.name} href="/products" className="group">
                <Card className="overflow-hidden border-0 bg-card shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-semibold text-sm">{collection.name}</h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Skate Packages Section */}
      {packagesProducts && packagesProducts.length > 0 && (
        <section className="py-10 md:py-14 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-3 text-xs px-2 py-0.5">
                Complete Solutions
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                SKATE <span className="text-[#bd9131]">PACKAGES</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Complete skating solutions for every level
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {packagesProducts.map((product: any) => (
                <EcommerceProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  View All Packages
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Cadet Skates Banner */}
      <section className="py-12 md:py-16 bg-white text-black relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 relative h-[250px] md:h-[300px] w-full">
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"
                alt="Cadet Inline Skates"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <Badge className="bg-[#bd9131]/10 text-[#bd9131] border-[#bd9131]/30 mb-4 text-xs px-2 py-0.5">
                Versatile Design
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Cadet Inline Skates <span className="text-[#bd9131]">4x90 / 3x110</span>
              </h2>
              <p className="text-sm md:text-base mb-5 text-neutral-600 leading-relaxed max-w-md">
                Versatility meets performance. Transform from three wheels to four wheels in the same package.
              </p>
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Boots Full Width Banner */}
      <section className="relative h-[300px] md:h-[350px] bg-black overflow-hidden group">
        <Image
          src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=1920&h=800&fit=crop"
          alt="Inline Skate Boots"
          fill
          className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-end">
          <div className="container mx-auto px-4">
            <div className="max-w-md ml-auto text-right">
              <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-3 text-xs px-2 py-0.5">
                Precision Engineering
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Precision <span className="text-[#bd9131]">Boots</span>
              </h2>
              <p className="text-sm text-white/80 mb-4">
                Handcrafted perfection for elite athletes
              </p>
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  Explore Collection
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Boots Products Section */}
      {bootsProducts && bootsProducts.length > 0 && (
        <section className="py-10 md:py-14 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-3 text-xs px-2 py-0.5">
                Engineered for Champions
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                RACING <span className="text-[#bd9131]">BOOTS</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Crafted with precision for ultimate performance
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {bootsProducts.slice(0, 8).map((product: any) => (
                <EcommerceProductCard key={product.id} product={product} variant="compact" />
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  View All Boots
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Boot Grey Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-neutral-500 via-neutral-600 to-neutral-700 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1">
              <Badge className="bg-white/20 text-white border-white/30 mb-4 text-xs px-2 py-0.5">
                Japanese Carbon Fiber
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Pro Inline <span className="text-[#bd9131]">Skate Boots</span>
              </h2>
              <p className="text-sm md:text-base mb-5 text-white/80 leading-relaxed max-w-md">
                Designed in India and produced by master leather craftsmen. Purely handmade with the finest materials.
              </p>
              <Button asChild size="sm" className="bg-white hover:bg-neutral-100 text-black font-semibold px-6">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[250px] md:h-[300px] w-full">
              <Image
                src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop"
                alt="Pro Inline Skate Boots"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Frames Full Width Banner */}
      <section className="relative h-[300px] md:h-[350px] bg-black overflow-hidden group">
        <Image
          src="https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1920&h=800&fit=crop"
          alt="Inline Skate Frames"
          fill
          className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-md">
              <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-3 text-xs px-2 py-0.5">
                Advanced Engineering
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Performance <span className="text-[#bd9131]">Frames</span>
              </h2>
              <p className="text-sm text-white/80 mb-4">
                Built for speed and stability
              </p>
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  Explore Collection
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Frames Products Section */}
      {framesProducts && framesProducts.length > 0 && (
        <section className="py-10 md:py-14 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-3 text-xs px-2 py-0.5">
                Advanced Engineering
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                RACING <span className="text-[#bd9131]">FRAMES</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Competitive edge through advanced engineering
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {framesProducts.slice(0, 8).map((product: any) => (
                <EcommerceProductCard key={product.id} product={product} variant="compact" />
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  View All Frames
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* OCCULT Frames Banner */}
      <section className="py-12 md:py-16 bg-black text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-4 text-xs px-2 py-0.5">
                High-Speed Racing
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                OCCULT 4x110 <span className="text-[#bd9131]">Inline Frames</span>
              </h2>
              <p className="text-sm md:text-base mb-5 text-neutral-300 leading-relaxed max-w-md">
                Solid frames specially designed and engineered for exceptional performance in high-speed racing.
              </p>
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[250px] md:h-[300px] w-full">
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"
                alt="OCCULT Inline Frames"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Wheels Full Width Banner */}
      <section className="relative h-[300px] md:h-[350px] bg-black overflow-hidden group">
        <Image
          src="https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=1920&h=800&fit=crop"
          alt="Inline Skate Wheels"
          fill
          className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-end">
          <div className="container mx-auto px-4">
            <div className="max-w-md ml-auto text-right">
              <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-3 text-xs px-2 py-0.5">
                Performance Wheels
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                High-Speed <span className="text-[#bd9131]">Wheels</span>
              </h2>
              <p className="text-sm text-white/80 mb-4">
                Engineered for champions
              </p>
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  Explore Collection
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Wheels Products Section */}
      {wheelsProducts && wheelsProducts.length > 0 && (
        <section className="py-10 md:py-14 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-3 text-xs px-2 py-0.5">
                Performance Wheels
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                RACING <span className="text-[#bd9131]">WHEELS</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                High-performance wheels for every condition
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {wheelsProducts.slice(0, 8).map((product: any) => (
                <EcommerceProductCard key={product.id} product={product} variant="compact" />
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  View All Wheels
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* MPC Storm Surge Banner */}
      <section className="py-12 md:py-16 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1">
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 mb-4 text-xs px-2 py-0.5">
                All Weather Performance
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-black">
                MPC Storm Surge <span className="text-[#bd9131]">100mm XFirm</span>
              </h2>
              <p className="text-sm md:text-base mb-5 text-neutral-600 leading-relaxed max-w-md">
                Own the road in the rain. The best wheels ever produced for rain conditions.
              </p>
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[250px] md:h-[300px] w-full">
              <Image
                src="https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=600&h=600&fit=crop"
                alt="MPC Storm Surge Wheels"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-10 md:py-14 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="outline" className="border-[#bd9131]/30 text-[#bd9131] mb-3 text-xs px-2 py-0.5">
              Stay Updated
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
              LATEST <span className="text-[#bd9131]">NEWS</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Stay updated with our latest announcements
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="overflow-hidden border-0 bg-card shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <Image
                    src={`https://images.unsplash.com/photo-${item === 1 ? '1558618666-fcd25c85cd64' : item === 2 ? '1461897104016-0b3b00cc81ee' : '1473496169904-658ba7c44d8a'}?w=600&h=400&fit=crop`}
                    alt={`News ${item}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-[#bd9131] text-black border-0 text-xs">News</Badge>
                  </div>
                </div>
                <CardHeader className="py-3 px-4">
                  <div className="text-xs text-[#bd9131] font-medium mb-1">December 2024</div>
                  <CardTitle className="text-sm font-semibold group-hover:text-[#bd9131] transition-colors line-clamp-2">
                    Latest Updates from Auriga Racing
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <p className="text-muted-foreground text-xs mb-2 line-clamp-2">
                    Discover what&apos;s new in the world of speed skating and our latest innovations.
                  </p>
                  <Button variant="link" className="text-[#bd9131] p-0 h-auto text-xs font-semibold">
                    Read More
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild size="sm" variant="outline" className="border-[#bd9131]/30 text-foreground hover:bg-[#bd9131]/10 px-6">
              <Link href="/blog">View All News</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 md:py-14 bg-gradient-to-b from-background to-[#bd9131]/5">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              { icon: Truck, title: "Free Delivery", desc: "For all orders over $99" },
              { icon: Clock, title: "30 Days Return", desc: "If goods have problems" },
              { icon: Shield, title: "Secure Payment", desc: "100% secure payment" },
              { icon: Headphones, title: "24/7 Support", desc: "Dedicated support team" }
            ].map((feature, index) => (
              <Card key={index} className="text-center border-0 bg-card shadow-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="py-4">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#bd9131]/10">
                    <feature.icon className="h-5 w-5 text-[#bd9131]" />
                  </div>
                  <CardTitle className="text-sm font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-14 md:py-18 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#bd9131]/10 via-transparent to-[#bd9131]/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-4 text-xs px-3 py-1">
            Join the Champions
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to Elevate Your <span className="text-[#bd9131]">Performance?</span>
          </h2>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            Join thousands of athletes who trust Auriga Racing for world-class equipment
          </p>
          <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-8">
            <Link href="/products">
              Start Shopping
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
