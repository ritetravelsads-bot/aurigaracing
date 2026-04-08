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
          "group relative overflow-hidden h-full transition-all duration-300",
          "bg-card border-0 shadow-sm hover:shadow-lg"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-neutral-50 dark:bg-neutral-900">
          {/* Product Image */}
          <div className={cn(
            "absolute inset-2 transition-transform duration-500",
            isHovered ? "scale-105" : "scale-100"
          )}>
            <Image
              src={
                getImageKitUrl(product.image_url, {
                  height: variant === "compact" ? 300 : 400,
                  width: variant === "compact" ? 300 : 400,
                }) || "/placeholder.svg"
              }
              alt={product.name}
              fill
              className={cn(
                "object-contain transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
          </div>

          {/* Top Left Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {isOnSale && product.discount_percentage && (
              <Badge className="bg-red-600 text-white font-semibold px-1.5 py-0.5 text-[10px] border-0">
                -{product.discount_percentage}%
              </Badge>
            )}
            {product.is_new && (
              <Badge className="bg-emerald-600 text-white font-semibold px-1.5 py-0.5 text-[10px] border-0">
                NEW
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-[#bd9131] text-black font-semibold px-1.5 py-0.5 text-[10px] border-0 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" />
                HOT
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className={cn(
            "absolute top-2 right-2 z-10 flex flex-col gap-1 transition-all duration-200",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-7 w-7 rounded-full bg-white/90 dark:bg-black/90 border-0",
                "hover:bg-[#bd9131] hover:text-black",
                isWishlisted && "bg-red-500 text-white"
              )}
              onClick={handleWishlist}
            >
              <Heart className={cn("h-3 w-3", isWishlisted && "fill-current")} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-7 w-7 rounded-full bg-white/90 dark:bg-black/90 border-0 hover:bg-[#bd9131] hover:text-black"
              onClick={handleQuickView}
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>

          {/* Out of Stock */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
              <div className="text-center">
                <Package className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                <span className="text-white font-semibold text-xs">Sold Out</span>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          {!isOutOfStock && (
            <div className={cn(
              "absolute bottom-0 left-0 right-0 p-2 z-10 transition-all duration-300",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
            )}>
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="w-full bg-[#bd9131] hover:bg-[#a17d27] text-black font-semibold text-xs py-2"
              >
                <ShoppingCart className="mr-1 h-3 w-3" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-3 space-y-1.5">
          {/* Brand */}
          {product.brand && (
            <p className="text-[10px] text-[#bd9131] font-semibold uppercase tracking-wider">
              {product.brand}
            </p>
          )}

          {/* Name */}
          <h3 className={cn(
            "font-medium text-xs leading-tight line-clamp-2 min-h-[2rem] transition-colors",
            isHovered ? "text-[#bd9131]" : "text-foreground"
          )}>
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating !== undefined && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-2.5 w-2.5",
                      i < Math.floor(product.rating!)
                        ? "text-[#bd9131] fill-[#bd9131]"
                        : "text-neutral-300"
                    )}
                  />
                ))}
              </div>
              {product.review_count && (
                <span className="text-[10px] text-muted-foreground">({product.review_count})</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-end justify-between pt-1 border-t border-border/30">
            <div>
              {isOnSale ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-[#bd9131]">
                    ${(product.price_in_cents / 100).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-muted-foreground line-through">
                    ${(product.original_price_in_cents! / 100).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-bold text-[#bd9131]">
                  ${(product.price_in_cents / 100).toFixed(2)}
                </span>
              )}
            </div>

            {isLowStock && (
              <Badge variant="outline" className="text-[8px] border-orange-500/50 text-orange-600 px-1 py-0">
                {product.stock_quantity} left
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
