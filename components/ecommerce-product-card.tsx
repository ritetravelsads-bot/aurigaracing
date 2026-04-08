"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getImageKitUrl } from "@/lib/imagekit"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Heart, ShoppingCart, Eye, Star, Zap, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface EcommerceProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    image_url: string
    short_description?: string
    brand?: string
    price_in_cents: number
    original_price_in_cents?: number
    discount_percentage?: number
    stock_quantity?: number
    is_featured?: boolean
    is_new?: boolean
    rating?: number
    review_count?: number
  }
  variant?: "default" | "compact"
  onAddToCart?: (productId: string) => void
  onAddToWishlist?: (productId: string) => void
  onQuickView?: (productId: string) => void
}

export function EcommerceProductCard({
  product,
  variant = "default",
  onAddToCart,
  onAddToWishlist,
  onQuickView,
}: EcommerceProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const isOnSale = product.original_price_in_cents && product.original_price_in_cents > product.price_in_cents
  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0
  const isLowStock = product.stock_quantity !== undefined && product.stock_quantity > 0 && product.stock_quantity <= 5

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isOutOfStock && onAddToCart) {
      onAddToCart(product.id)
    }
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    if (onAddToWishlist) {
      onAddToWishlist(product.id)
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onQuickView) {
      onQuickView(product.id)
    }
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <Card 
        className={cn(
          "group relative overflow-hidden h-full transition-all duration-500",
          "bg-card border-0 shadow-sm",
          "hover:shadow-xl hover:shadow-[#bd9131]/10",
          isHovered && "scale-[1.02]"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
          {/* Subtle Pattern Background */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }} />

          {/* Product Image */}
          <div className={cn(
            "absolute inset-4 transition-all duration-700 ease-out",
            isHovered ? "scale-110" : "scale-100"
          )}>
            <Image
              src={
                getImageKitUrl(product.image_url, {
                  height: variant === "compact" ? 400 : 500,
                  width: variant === "compact" ? 400 : 500,
                }) || "/placeholder.svg"
              }
              alt={product.name}
              fill
              className={cn(
                "object-contain transition-all duration-500",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
          </div>

          {/* Gradient Overlay on Hover */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500",
            isHovered ? "opacity-100" : "opacity-0"
          )} />

          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {isOnSale && product.discount_percentage && (
              <Badge className="bg-red-600 hover:bg-red-600 text-white font-bold px-2.5 py-1 text-xs shadow-lg border-0">
                -{product.discount_percentage}%
              </Badge>
            )}
            {product.is_new && (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold px-2.5 py-1 text-xs shadow-lg border-0">
                NEW
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-[#bd9131] hover:bg-[#bd9131] text-black font-bold px-2.5 py-1 text-xs shadow-lg border-0 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                HOT
              </Badge>
            )}
          </div>

          {/* Quick Action Buttons - Vertical Stack */}
          <div className={cn(
            "absolute top-3 right-3 z-10 flex flex-col gap-2 transition-all duration-300",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}>
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-9 w-9 rounded-full shadow-lg bg-white/90 dark:bg-black/90 backdrop-blur-sm border-0",
                "hover:bg-[#bd9131] hover:text-black transition-all duration-200",
                isWishlisted && "bg-red-500 text-white hover:bg-red-600"
              )}
              onClick={handleWishlist}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full shadow-lg bg-white/90 dark:bg-black/90 backdrop-blur-sm border-0 hover:bg-[#bd9131] hover:text-black transition-all duration-200"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="text-center">
                <Package className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                <span className="text-white font-bold text-sm uppercase tracking-wider">Sold Out</span>
              </div>
            </div>
          )}

          {/* Add to Cart Button - Bottom */}
          {!isOutOfStock && (
            <div className={cn(
              "absolute bottom-0 left-0 right-0 p-3 z-10 transition-all duration-500",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
            )}>
              <Button
                onClick={handleAddToCart}
                className="w-full bg-[#bd9131] hover:bg-[#a17d27] text-black font-bold py-5 shadow-xl transition-all duration-200 group/btn"
              >
                <ShoppingCart className="mr-2 h-4 w-4 transition-transform group-hover/btn:scale-110" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-4 space-y-3 relative">
          {/* Brand Label */}
          {product.brand && (
            <p className="text-xs text-[#bd9131] font-semibold uppercase tracking-[0.15em]">
              {product.brand}
            </p>
          )}

          {/* Product Name */}
          <h3 className={cn(
            "font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] transition-colors duration-300",
            isHovered ? "text-[#bd9131]" : "text-foreground"
          )}>
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating !== undefined && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < Math.floor(product.rating!)
                        ? "text-[#bd9131] fill-[#bd9131]"
                        : "text-neutral-300 dark:text-neutral-700"
                    )}
                  />
                ))}
              </div>
              {product.review_count && (
                <span className="text-xs text-muted-foreground">
                  ({product.review_count})
                </span>
              )}
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-end justify-between pt-2 border-t border-border/50">
            <div className="space-y-0.5">
              {isOnSale ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-[#bd9131]">
                      ${(product.price_in_cents / 100).toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${(product.original_price_in_cents! / 100).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Save ${((product.original_price_in_cents! - product.price_in_cents) / 100).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-[#bd9131]">
                  ${(product.price_in_cents / 100).toFixed(2)}
                </span>
              )}
            </div>

            {/* Low Stock Indicator */}
            {isLowStock && (
              <Badge variant="outline" className="text-[10px] border-orange-500/50 text-orange-600 dark:text-orange-400 px-2 py-0.5">
                {product.stock_quantity} left
              </Badge>
            )}
          </div>

          {/* Free Shipping Indicator */}
          {product.price_in_cents >= 5000 && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              Free Shipping
            </div>
          )}
        </CardContent>

        {/* Hover Border Accent */}
        <div className={cn(
          "absolute inset-0 rounded-lg border-2 transition-all duration-300 pointer-events-none",
          isHovered ? "border-[#bd9131]/50" : "border-transparent"
        )} />
      </Card>
    </Link>
  )
}
