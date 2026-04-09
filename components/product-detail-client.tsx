"use client"

import { useState } from "react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { WishlistButton } from "@/components/wishlist-button"
import { ProductComparisonButton } from "@/components/product-comparison-button"
import { PriceAlertButton } from "@/components/price-alert-button"
import { StockNotificationButton } from "@/components/stock-notification-button"
import { SocialShareButtons } from "@/components/social-share-buttons"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ProductDetailClientProps {
  productId: string
  productName: string
  productImage?: string
  productType: string | null
  productTypeDetails: any
  stockQuantity: number
  priceInCents: number
}

export function ProductDetailClient({
  productId,
  productName,
  productImage,
  productType,
  productTypeDetails,
  stockQuantity,
  priceInCents,
}: ProductDetailClientProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [showError, setShowError] = useState(false)

  // Get variation options from productTypeDetails
  const getVariationOptions = () => {
    if (!productTypeDetails || typeof productTypeDetails !== 'object') return {}
    
    const variations: Record<string, string[]> = {}
    
    // Map field names to display names
    const fieldMap: Record<string, string> = {
      sizes: 'Size',
      colors: 'Color',
      frame_sizes: 'Frame Size',
      frame_colors: 'Frame Color',
      wheel_sizes: 'Wheel Size',
      wheel_hardness: 'Hardness',
      helmet_sizes: 'Helmet Size',
      boot_sizes: 'Boot Size',
    }
    
    for (const [key, value] of Object.entries(productTypeDetails)) {
      if (value && typeof value === 'string' && value.includes(',') && fieldMap[key]) {
        const options = value.split(',').map((v: string) => v.trim()).filter(Boolean)
        if (options.length > 0) {
          variations[fieldMap[key]] = options
        }
      }
    }
    
    return variations
  }

  const variations = getVariationOptions()
  const hasVariations = Object.keys(variations).length > 0

  const handleOptionSelect = (optionType: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionType]: value
    }))
    setShowError(false)
  }

  const handleAddToCart = () => {
    // Check if all required options are selected
    if (hasVariations) {
      const allSelected = Object.keys(variations).every(key => selectedOptions[key])
      
      if (!allSelected) {
        setShowError(true)
        return false
      }
    }

    setShowError(false)
    return true
  }

  return (
    <div className="space-y-6">
      {/* Variation Selectors */}
      {hasVariations && (
        <div className="space-y-4">
          {Object.entries(variations).map(([optionType, options]) => (
            <div key={optionType} className="space-y-2">
              <Label className="text-sm font-semibold flex items-center justify-between">
                <span>{optionType}</span>
                {selectedOptions[optionType] && (
                  <span className="text-primary font-normal">
                    Selected: {selectedOptions[optionType]}
                  </span>
                )}
              </Label>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleOptionSelect(optionType, option)}
                    className={cn(
                      "px-4 py-2 text-sm border rounded-lg transition-all duration-200",
                      "hover:border-primary hover:bg-primary/5",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50",
                      selectedOptions[optionType] === option
                        ? "border-primary bg-primary text-primary-foreground font-medium shadow-sm"
                        : "border-input bg-background"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <p className="text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-2">
          Please select all options before adding to cart
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <div className="flex-1">
          <AddToCartButton
            productId={productId}
            disabled={stockQuantity === 0}
            selectedOptions={selectedOptions}
            onBeforeAdd={handleAddToCart}
          />
        </div>
        <WishlistButton productId={productId} />
      </div>

      {/* Out of Stock Notification */}
      {stockQuantity === 0 && (
        <StockNotificationButton productId={productId} productName={productName} isInStock={false} />
      )}

      {/* Secondary Actions */}
      <div className="flex gap-3">
        <ProductComparisonButton productId={productId} />
        <PriceAlertButton productId={productId} currentPrice={priceInCents} />
      </div>

      {/* Social Share */}
      <div className="border-t pt-6">
        <SocialShareButtons productId={productId} productName={productName} productImage={productImage} />
      </div>
    </div>
  )
}
