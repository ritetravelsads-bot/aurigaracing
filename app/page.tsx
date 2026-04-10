import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Shield, Clock, Headphones, ArrowRight, ChevronRight, Sparkles, Zap, Award, Star } from "lucide-react"
import { getImageKitUrl } from "@/lib/imagekit"
import { createClient } from "@/lib/supabase/server"
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

  // Helper to fetch products by category from Supabase
  async function fetchProductsByCategory(categoryId: string, limit: number = 8) {
    const { data: productCategories } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", categoryId)

    const productIds = productCategories?.map((pc) => pc.product_id) || []
    if (productIds.length === 0) return []

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds)
      .eq("is_active", true)
      .eq("status", "published")
      .limit(limit)

    return products || []
  }

  if (inlineSkatingCategory?.id) {
    try {
      inlineProducts = await fetchProductsByCategory(inlineSkatingCategory.id, 8)
    } catch (error) {
      console.error("[v0] Error fetching inline products:", error)
    }
  }

  if (bootsCategory?.id) {
    try {
      bootsProducts = await fetchProductsByCategory(bootsCategory.id, 8)
    } catch (error) {
      console.error("[v0] Error fetching boots products:", error)
    }
  }

  if (framesCategory?.id) {
    try {
      framesProducts = await fetchProductsByCategory(framesCategory.id, 8)
    } catch (error) {
      console.error("[v0] Error fetching frames products:", error)
    }
  }

  if (wheelsCategory?.id) {
    try {
      wheelsProducts = await fetchProductsByCategory(wheelsCategory.id, 8)
    } catch (error) {
      console.error("[v0] Error fetching wheels products:", error)
    }
  }

  if (packagesCategory?.id) {
    try {
      packagesProducts = await fetchProductsByCategory(packagesCategory.id, 8)
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
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#4a4a4a] via-[#5a5a5a] to-[#3a3a3a] relative overflow-hidden">
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
            <div className="flex-1 relative h-[280px] md:h-[400px] w-full group/img">
              <div className="absolute inset-4 bg-white/10 rounded-[2rem] blur-2xl opacity-60 group-hover/img:opacity-80 transition-opacity duration-500" />
              <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-black/30">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/auriga-racing-hoodies.png-cBibuVEmZLBKUYaXFLgSKnOoZELXpB.jpeg"
                  alt="Auriga Racing Hoodie"
                  fill
                  className="object-contain scale-95 drop-shadow-2xl transition-transform duration-500 group-hover/img:scale-100"
                />
              </div>
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
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a] text-white relative overflow-hidden">
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
            <div className="flex-1 relative h-[280px] md:h-[400px] w-full group/img">
              <div className="absolute inset-4 bg-[#bd9131]/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover/img:opacity-70 transition-opacity duration-500" />
              <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/40">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/auriga-racing-ankle-booties.png-1DkzgTQWmDJ8KjkQn0lsO54uRBbb64.jpeg"
                  alt="Auriga Racing Ankle Booties"
                  fill
                  className="object-contain scale-95 drop-shadow-2xl transition-transform duration-500 group-hover/img:scale-100"
                />
              </div>
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
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#f5f5f5] via-[#e8e8e8] to-[#d0d0d0] text-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <Badge className="bg-[#bd9131]/20 text-[#bd9131] border-[#bd9131]/30 mb-4 text-xs px-2 py-0.5">
                Handcrafted Excellence
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Pro Inline <span className="text-[#bd9131]">Skate Boots</span>
              </h2>
              <p className="text-sm md:text-base mb-5 text-black/70 leading-relaxed max-w-md">
                Designed in India using the finest Japanese Carbon Fiber and microfiber leather, purely handmade.
              </p>
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[280px] md:h-[400px] w-full group/img">
              <div className="absolute inset-4 bg-[#bd9131]/30 rounded-[3rem] blur-2xl opacity-50 group-hover/img:opacity-70 transition-opacity duration-500" />
              <div className="relative h-full w-full rounded-[3rem] overflow-hidden shadow-2xl shadow-black/20">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/japanese-carbon-fiber-pro-inline-skate-boots.png-DtEEhJ8C5mbrsAyADpqy940ihQG2LD.jpeg"
                  alt="Japanese Carbon Fiber Pro Inline Skate Boots"
                  fill
                  className="object-contain scale-95 drop-shadow-2xl transition-transform duration-500 group-hover/img:scale-100"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Helmets Full Width Banner */}
      <Link href="/products?category=helmets" className="block">
        <section className="relative w-full aspect-[1400/350] bg-black overflow-hidden group cursor-pointer">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/helmet%20banner.png-uBOFWYiQBgShACYyH5PskDyM5snSQZ.jpeg"
            alt="Auriga Racing Helmets"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </section>
      </Link>

      {/* Aero Helmets Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1">
              <Badge className="bg-[#6366f1]/20 text-[#a5b4fc] border-[#6366f1]/30 mb-4 text-xs px-2 py-0.5">
                Wind Tunnel Tested
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Auriga Racing <span className="text-[#a5b4fc]">Aero Helmets</span>
              </h2>
              <p className="text-sm md:text-base mb-5 text-white/70 leading-relaxed max-w-md">
                Delivering not just aerodynamics but pure speed and unmatched performance.
              </p>
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[300px] md:h-[420px] w-full group/img">
              <div className="absolute inset-4 bg-[#6366f1]/30 rounded-[2rem] blur-3xl opacity-50 group-hover/img:opacity-70 transition-opacity duration-500" />
              <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-purple-500/30">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/auriga-racinga-aero-helmets.png-z68SeF9TcQZYpxkZaO7m5ui7tQQcLM.jpeg"
                  alt="Auriga Racing Aero Helmets"
                  fill
                  className="object-contain scale-95 drop-shadow-2xl transition-transform duration-500 group-hover/img:scale-100"
                />
              </div>
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

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {[
              { name: "Boots", slug: "boots", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/boots-collection-card-51eQfr39w1HEJxQZuszK50vMSo6rZ1.jpg" },
              { name: "Frames", slug: "frames", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/frames-collection-card-d73I4y53Q9sN4FtiShtH1BUa1EyhMO.jpg" },
              { name: "Wheels", slug: "wheels", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wheels-collection-card-NpuK0Nmgxlzi40B2IOeV6wn7mDXDm4.jpg" },
              { name: "Bearings", slug: "bearings", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bearings-collection-card-LLUfycS9TAzKkNjfnpUpvRFZeuhpty.jpg" },
              { name: "Helmets", slug: "helmets", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/helmets-collection-card-OcJ3JmJ4OBub3D9rMNIh67NZgtYGBW.jpg" },
              { name: "Skate Packages", slug: "skate-packages", image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skate-packeges-collection-card-KbzSUS1LAINulQCyCPq6f63Sc4KuTF.jpg" }
            ].map((collection) => (
              <Link key={collection.name} href={`/products?category=${collection.slug}`} className="group">
                <Card className="overflow-hidden border-0 bg-black shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={collection.image}
                      alt={`${collection.name} - Auriga Racing Collection`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
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
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#5a7a8a] via-[#4a6a7a] to-[#3a5a6a] text-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 relative h-[300px] md:h-[420px] w-full group/img">
              <div className="absolute inset-4 bg-white/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover/img:opacity-70 transition-opacity duration-500" />
              <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/30">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cadet-inline-skates.png-41DDjpspnVjwnWKlM2840gvbP11RrI.jpeg"
                  alt="Auriga Racing Cadet Inline Skates"
                  fill
                  className="object-contain scale-95 drop-shadow-2xl transition-transform duration-500 group-hover/img:scale-100"
                />
              </div>
            </div>
            <div className="flex-1">
              <Badge className="bg-white/20 text-white border-white/30 mb-4 text-xs px-2 py-0.5">
                Versatile Design
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Cadet Inline Skates <span className="text-[#bd9131]">4x90 / 3x110</span>
              </h2>
              <p className="text-sm md:text-base mb-5 text-white/80 leading-relaxed max-w-md">
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
      <Link href="/products?category=boots" className="block">
        <section className="relative w-full aspect-[1400/350] bg-black overflow-hidden group cursor-pointer">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/boots%20banner.png-nWYUMWEuuxXDmkm9XbGypSImTxeSCM.jpeg"
            alt="Auriga Racing Boots - Engineered for Speed and Precision"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </section>
      </Link>

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
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#2a2a2a] via-[#1f1f1f] to-[#151515] text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1">
              <Badge className="bg-[#ec4899]/20 text-[#f472b6] border-[#ec4899]/30 mb-4 text-xs px-2 py-0.5">
                Holographic Design
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Pro Inline <span className="text-[#ec4899]">Skate Boots</span>
              </h2>
              <p className="text-sm md:text-base mb-5 text-white/80 leading-relaxed max-w-md">
                Designed in India and produced by master leather craftsmen. Purely handmade with the finest materials.
              </p>
              <Button asChild size="sm" className="bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold px-6">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 relative h-[300px] md:h-[420px] w-full group/img">
              <div className="absolute inset-4 bg-[#ec4899]/30 rounded-[2rem] blur-2xl opacity-50 group-hover/img:opacity-70 transition-opacity duration-500" />
              <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-pink-500/30">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pro-inline-skate-boots.png-qUtxaSMbSu6KIKh7WRzSxl5Xm6dHHf.jpeg"
                  alt="Pro Inline Skate Boots with Holographic Design"
                  fill
                  className="object-contain scale-95 drop-shadow-2xl transition-transform duration-500 group-hover/img:scale-100"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frames Full Width Banner */}
      <Link href="/products?category=frames" className="block">
        <section className="relative w-full aspect-[1400/350] bg-black overflow-hidden group cursor-pointer">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/frame%20banner.png-dwscOhFyi1f9pphfTCB16a2KAlPmz9.jpeg"
            alt="Auriga Racing Inline Skate Frames - Ultra-Precision AL-7075-T6"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </section>
      </Link>

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
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#1a2a3a] via-[#0f1f2f] to-[#0a1520] text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
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
            <div className="flex-1 relative h-[220px] md:h-[320px] w-full group/img">
              <div className="absolute inset-4 bg-[#bd9131]/20 rounded-[1.5rem] blur-2xl opacity-50 group-hover/img:opacity-70 transition-opacity duration-500" />
              <div className="relative h-full w-full rounded-[1.5rem] overflow-hidden shadow-2xl shadow-black/40">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/occult-inline-frames.png-JiuNt2UCgdbtoOybzlKFzENFqPfShE.jpeg"
                  alt="OCCULT Inline Frames with Pink Wheels"
                  fill
                  className="object-contain scale-95 drop-shadow-2xl transition-transform duration-500 group-hover/img:scale-100"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wheels Full Width Banner */}
      <Link href="/products?category=wheels" className="block">
        <section className="relative w-full aspect-[1400/350] bg-black overflow-hidden group cursor-pointer">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wheel%20banner.png-Gap8XKX502nDWQSK9n4InPIMvlNCgM.jpeg"
            alt="Auriga Racing Wheels - Speed Performance Control"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </section>
      </Link>

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
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#e8e8e8] via-[#f0f0f0] to-[#e0e0e0] relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1">
              <Badge className="bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/30 mb-4 text-xs px-2 py-0.5">
                All Weather Performance
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-black">
                MPC Storm Surge <span className="text-[#f97316]">125mm XGrip</span>
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
            <div className="flex-1 relative h-[300px] md:h-[420px] w-full group/img">
              <div className="absolute inset-4 bg-[#3b82f6]/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover/img:opacity-70 transition-opacity duration-500" />
              <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mpc-storm-surge-wheel.png-LpwozFhcl9PQW7LbUmq4hBxMs26Ny1.jpeg"
                  alt="MPC Storm Surge 125mm XGrip Wheel"
                  fill
                  className="object-contain scale-95 drop-shadow-2xl transition-transform duration-500 group-hover/img:scale-100"
                />
              </div>
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
