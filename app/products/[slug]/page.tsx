import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  ChevronLeft, Star, Package, Truck, Shield, Tag, 
  Award, Clock, Zap, CheckCircle2, Heart
} from "lucide-react"
import { ReviewSection } from "@/components/review-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductDetailClient } from "@/components/product-detail-client"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { ProductQASection } from "@/components/product-qa-section"
import { RecentlyViewedProducts } from "@/components/recently-viewed-products"
import { TrackProductView } from "@/components/track-product-view"
import { Card, CardContent } from "@/components/ui/card"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!product) {
    notFound()
  }

  const { data: galleryImages } = await supabase
    .from("product_gallery")
    .select("*")
    .eq("product_id", product.id)
    .order("display_order", { ascending: true })

  const { data: specifications } = await supabase
    .from("product_specifications")
    .select("*")
    .eq("product_id", product.id)
    .order("display_order", { ascending: true })

  const { data: tags } = await supabase.from("product_tags").select("*").eq("product_id", product.id)

  const { data: productCategories } = await supabase
    .from("product_categories")
    .select("category:categories(*)")
    .eq("product_id", product.id)

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, user:users(first_name, last_name)")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false })

  const averageRating =
    reviews && reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  const allImages =
    galleryImages && galleryImages.length > 0
      ? galleryImages.map((img) => img.image_url)
      : product.image_url
        ? [product.image_url]
        : []

  const hasDiscount = product.original_price_in_cents && product.original_price_in_cents > product.price_in_cents
  const discountPercentage = hasDiscount
    ? Math.round(((product.original_price_in_cents - product.price_in_cents) / product.original_price_in_cents) * 100)
    : 0

  // Parse product type details for variations
  const productTypeDetails = product.product_type_details || {}
  const hasVariations = product.product_type && Object.keys(productTypeDetails).some(
    key => productTypeDetails[key] && typeof productTypeDetails[key] === 'string' && productTypeDetails[key].includes(',')
  )

  return (
    <div className="min-h-screen bg-background">
      <TrackProductView productId={product.id} />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link href={`/products/category/${product.category.slug}`} className="hover:text-foreground transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Main Product Section */}
        <div className="grid gap-8 lg:grid-cols-2 mb-16">
          {/* Image Gallery with Animation */}
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <ProductImageGallery
              images={allImages}
              productName={product.name}
              dealOfTheDay={product.deal_of_the_day}
              hasDiscount={hasDiscount}
              discountPercentage={discountPercentage}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
            {/* Categories & Brand */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {productCategories &&
                productCategories.map((pc: any) => (
                  <Link
                    key={pc.category.id}
                    href={`/products/category/${pc.category.slug}`}
                    className="text-xs font-medium text-primary hover:underline uppercase tracking-wider"
                  >
                    {pc.category.name}
                  </Link>
                ))}
              {product.brand && (
                <Badge variant="secondary" className="ml-2 font-semibold">
                  {product.brand}
                </Badge>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">{product.name}</h1>

            {/* SKU */}
            {product.sku && (
              <p className="text-sm text-muted-foreground mb-4 font-mono">SKU: {product.sku}</p>
            )}

            {/* Rating */}
            {reviews && reviews.length > 0 && (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 transition-colors ${
                        star <= Math.round(averageRating) 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            {/* Price Section */}
            <div className="mb-6 p-4 bg-muted/50 rounded-xl">
              {hasDiscount ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary">
                      ${(product.price_in_cents / 100).toFixed(2)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      ${(product.original_price_in_cents / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-sm font-bold px-3 py-1 animate-pulse">
                      {discountPercentage}% OFF
                    </Badge>
                    <span className="text-sm text-green-600 font-medium">
                      You save ${((product.original_price_in_cents - product.price_in_cents) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-4xl font-bold">${(product.price_in_cents / 100).toFixed(2)}</div>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-muted-foreground leading-relaxed mb-6 text-lg">{product.short_description}</p>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock_quantity > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle2 className="h-5 w-5" />
                    In Stock
                  </span>
                  {product.stock_quantity <= 10 && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Only {product.stock_quantity} left!
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-destructive font-medium flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Out of Stock
                </p>
              )}
            </div>

            {/* Product Type Variations Display */}
            {hasVariations && (
              <div className="mb-6 space-y-4">
                {productTypeDetails.sizes && (
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Available Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {productTypeDetails.sizes.split(',').map((size: string) => (
                        <Badge key={size.trim()} variant="outline" className="px-3 py-1">
                          {size.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {productTypeDetails.colors && (
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Available Colors</label>
                    <div className="flex flex-wrap gap-2">
                      {productTypeDetails.colors.split(',').map((color: string) => (
                        <Badge key={color.trim()} variant="outline" className="px-3 py-1">
                          {color.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add to Cart & Wishlist */}
            <ProductDetailClient
              productId={product.id}
              productName={product.name}
              productImage={product.image_url}
              productType={product.product_type}
              productTypeDetails={product.product_type_details}
              stockQuantity={product.stock_quantity}
              priceInCents={product.price_in_cents}
            />

            {/* Features List */}
            {product.features && Array.isArray(product.features) && product.features.length > 0 && (
              <div className="mt-6 p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Key Features
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-3 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${index * 50}ms` }}>
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t">
              <div className="text-center group cursor-pointer">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs font-medium">Free Shipping</p>
                <p className="text-[10px] text-muted-foreground">On orders $100+</p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs font-medium">2 Year Warranty</p>
                <p className="text-[10px] text-muted-foreground">Full coverage</p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs font-medium">Pro Quality</p>
                <p className="text-[10px] text-muted-foreground">Race tested</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <Tabs defaultValue="description" className="mb-16">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="description" className="text-sm">Description</TabsTrigger>
              <TabsTrigger value="specifications" className="text-sm">Specifications</TabsTrigger>
              <TabsTrigger value="details" className="text-sm">Details</TabsTrigger>
              <TabsTrigger value="shipping" className="text-sm">Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  {product.description && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Product Description</h3>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
                    </div>
                  )}

                  {product.feature_description && (
                    <div className="pt-6 border-t">
                      <h3 className="text-xl font-bold mb-4">Features Overview</h3>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {product.feature_description}
                      </p>
                    </div>
                  )}

                  {!product.description && !product.feature_description && (
                    <p className="text-muted-foreground">No description available for this product.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {specifications && specifications.length > 0 ? (
                    <div className="divide-y">
                      {specifications.map((spec: any, index: number) => (
                        <div 
                          key={spec.id} 
                          className="flex py-4 first:pt-0 last:pb-0 animate-in fade-in slide-in-from-left-2"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <span className="font-semibold w-1/3 text-sm">{spec.spec_key}</span>
                          <span className="text-muted-foreground w-2/3 text-sm">{spec.spec_value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No specifications available for this product.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  {product.product_type && (
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-sm capitalize">
                        {product.product_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Product Type</span>
                    </div>
                  )}

                  {product.product_type_details && Object.keys(product.product_type_details).length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(product.product_type_details).map(([key, value]) => {
                        if (!value) return null
                        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        return (
                          <div key={key} className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{formattedKey}</p>
                            <p className="font-medium">{String(value)}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {product.video_url && (
                    <div className="pt-6 border-t">
                      <h4 className="font-bold mb-4">Product Video</h4>
                      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                        <iframe
                          src={product.video_url}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {product.purchase_note && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Note:</strong> {product.purchase_note}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-bold flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        Shipping Information
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Free shipping on orders over $100
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Standard delivery: 5-7 business days
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Express delivery available
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          International shipping available
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Returns & Exchanges
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          30-day return policy
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Free returns on unused items
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Exchange for different size/color
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Full refund within 14 days
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mb-12 flex items-center gap-3 flex-wrap animate-in fade-in duration-500">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {tags.map((tag: any, index: number) => (
              <Badge 
                key={tag.id} 
                variant="secondary" 
                className="animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {tag.tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Reviews Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <ReviewSection productId={product.id} reviews={reviews || []} />
        </div>

        {/* Q&A Section */}
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <ProductQASection productId={product.id} />
        </div>

        {/* Recently Viewed */}
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
          <RecentlyViewedProducts />
        </div>
      </div>
    </div>
  )
}
