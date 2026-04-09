"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageKitUpload } from "@/components/imagekit-upload"
import { Loader2, AlertCircle, CheckCircle2, Plus, X, Trash2, ChevronLeft, ChevronRight, GripVertical, Package } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductVariation {
  id?: string
  sku: string
  price: string
  originalPrice: string
  stockQuantity: string
  imageUrl: string
  attributes: Record<string, string>
  isActive: boolean
}

interface ProductFormProps {
  product?: any
  categories: any[]
}

const TAB_ORDER = ["basic", "pricing", "media", "variations", "type", "details", "inventory"]

export function ProductForm({ product, categories }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [name, setName] = useState(product?.name || "")
  const [sku, setSku] = useState(product?.sku || "")
  const [slug, setSlug] = useState(product?.slug || "")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!product?.slug)
  const [description, setDescription] = useState(product?.description || "")
  const [shortDescription, setShortDescription] = useState(product?.short_description || "")
  const [featureDescription, setFeatureDescription] = useState(product?.feature_description || "")
  const [price, setPrice] = useState(product ? (product.price_in_cents / 100).toString() : "")
  const [originalPrice, setOriginalPrice] = useState(
    product?.original_price_in_cents ? (product.original_price_in_cents / 100).toString() : "",
  )
  const [discountPercentage, setDiscountPercentage] = useState(product?.discount_percentage?.toString() || "")
  const [categoryIds, setCategoryIds] = useState<string[]>(product?.categoryIds || [])
  const [imageUrl, setImageUrl] = useState(product?.image_url || "")
  const [gallery, setGallery] = useState<string[]>(product?.gallery || [])
  const [tags, setTags] = useState<string[]>(product?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [brand, setBrand] = useState(product?.brand || "")
  const [videoUrl, setVideoUrl] = useState(product?.video_url || "")
  const [status, setStatus] = useState(product?.status || "draft")
  const [visibility, setVisibility] = useState(product?.visibility || "visible")
  const [stockQuantity, setStockQuantity] = useState(product?.stock_quantity?.toString() || "0")
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [allowReviews, setAllowReviews] = useState(product?.allow_reviews ?? true)
  const [backordersAllowed, setBackordersAllowed] = useState(product?.backorders_allowed ?? false)
  const [soldIndividually, setSoldIndividually] = useState(product?.sold_individually ?? false)
  const [gtin, setGtin] = useState(product?.gtin || "")
  const [purchaseNote, setPurchaseNote] = useState(product?.purchase_note || "")
  const [productType, setProductType] = useState(product?.product_type || "simple")
  const [productTypeDetails, setProductTypeDetails] = useState<any>(product?.product_type_details || {})
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>(
    product?.specifications
      ? Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value) }))
      : [],
  )
  const [features, setFeatures] = useState<string[]>(product?.features || [])
  const [featureInput, setFeatureInput] = useState("")

  // Variations state
  const [variations, setVariations] = useState<ProductVariation[]>(product?.variations || [])
  const [variationAttributes, setVariationAttributes] = useState<{ name: string; values: string[] }[]>(
    product?.attributes || [{ name: "Size", values: [] }, { name: "Color", values: [] }]
  )

  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  // Load variations on mount for existing products
  useEffect(() => {
    if (product?.id) {
      loadVariations()
    }
  }, [product?.id])

  const loadVariations = async () => {
    if (!product?.id) return
    
    const supabase = createBrowserClient()
    const { data: variationsData, error } = await supabase
      .from("product_variations")
      .select("*")
      .eq("parent_id", product.id)
      .order("position")

    if (error) {
      console.error("[v0] Error loading variations:", error)
      return
    }

    if (variationsData && variationsData.length > 0) {
      setVariations(variationsData.map((v: any) => ({
        id: v.id,
        sku: v.sku || "",
        price: v.price_in_cents ? (v.price_in_cents / 100).toString() : "",
        originalPrice: v.original_price_in_cents ? (v.original_price_in_cents / 100).toString() : "",
        stockQuantity: v.stock_quantity?.toString() || "0",
        imageUrl: v.image_url || "",
        attributes: v.attributes || {},
        isActive: v.is_active ?? true,
      })))
    }
  }

  // Generate SKU from name
  useEffect(() => {
    if (!product && name && !sku) {
      const generatedSku = name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 20)
      setSku(`SKU-${generatedSku}-${Date.now().toString().slice(-4)}`)
    }
  }, [name, product, sku])

  // Generate slug from name (only if not manually edited)
  const generateSlug = useCallback((text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }, [])

  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setSlug(generateSlug(name))
    }
  }, [name, slugManuallyEdited, generateSlug])

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setSlug(generateSlug(value))
  }

  // Calculate discount percentage
  useEffect(() => {
    if (originalPrice && price) {
      const original = Number.parseFloat(originalPrice)
      const sale = Number.parseFloat(price)
      if (original > 0 && sale > 0 && original > sale) {
        const discount = Math.round(((original - sale) / original) * 100)
        setDiscountPercentage(discount.toString())
      } else {
        setDiscountPercentage("")
      }
    }
  }, [originalPrice, price])

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const addFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()])
      setFeatureInput("")
    }
  }

  const removeFeature = (feature: string) => {
    setFeatures(features.filter((f) => f !== feature))
  }

  const addGalleryImage = (url: string) => {
    if (url && !gallery.includes(url)) {
      setGallery([...gallery, url])
    }
  }

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index))
  }

  const toggleCategory = (categoryId: string) => {
    setCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Variation functions
  const addVariation = () => {
    const newVariation: ProductVariation = {
      sku: `${sku}-VAR-${variations.length + 1}`,
      price: price,
      originalPrice: originalPrice,
      stockQuantity: "0",
      imageUrl: "",
      attributes: {},
      isActive: true,
    }
    setVariations([...variations, newVariation])
  }

  const updateVariation = (index: number, field: keyof ProductVariation, value: any) => {
    const updated = [...variations]
    updated[index] = { ...updated[index], [field]: value }
    setVariations(updated)
  }

  const updateVariationAttribute = (index: number, attrName: string, value: string) => {
    const updated = [...variations]
    updated[index] = {
      ...updated[index],
      attributes: { ...updated[index].attributes, [attrName]: value }
    }
    setVariations(updated)
  }

  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index))
  }

  const addAttributeValue = (attrIndex: number, value: string) => {
    if (!value.trim()) return
    const updated = [...variationAttributes]
    if (!updated[attrIndex].values.includes(value.trim())) {
      updated[attrIndex].values.push(value.trim())
      setVariationAttributes(updated)
    }
  }

  const removeAttributeValue = (attrIndex: number, valueIndex: number) => {
    const updated = [...variationAttributes]
    updated[attrIndex].values.splice(valueIndex, 1)
    setVariationAttributes(updated)
  }

  // Tab navigation
  const currentTabIndex = TAB_ORDER.indexOf(activeTab)
  const canGoPrevious = currentTabIndex > 0
  const canGoNext = currentTabIndex < TAB_ORDER.length - 1
  const isLastTab = currentTabIndex === TAB_ORDER.length - 1

  const goToPreviousTab = () => {
    if (canGoPrevious) {
      setActiveTab(TAB_ORDER[currentTabIndex - 1])
    }
  }

  const goToNextTab = () => {
    if (canGoNext) {
      setActiveTab(TAB_ORDER[currentTabIndex + 1])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Form submission started")
    setIsSaving(true)
    setMessage(null)

    const supabase = createBrowserClient()

    try {
      if (!name.trim()) throw new Error("Product name is required")
      if (!slug.trim()) throw new Error("Product slug is required")
      if (!imageUrl) throw new Error("Please upload a product image")
      if (categoryIds.length === 0) throw new Error("Please select at least one category")

      const priceInCents = Math.round(Number.parseFloat(price) * 100)
      const stock = Number.parseInt(stockQuantity)

      if (isNaN(priceInCents) || priceInCents <= 0) {
        throw new Error("Please enter a valid price")
      }

      if (isNaN(stock) || stock < 0) {
        throw new Error("Please enter a valid stock quantity")
      }

      console.log("[v0] Validation passed")

      const productData = {
        name: name.trim(),
        sku: sku.trim(),
        slug: slug.trim(),
        description: description.trim(),
        short_description: shortDescription.trim(),
        feature_description: featureDescription.trim(),
        price_in_cents: priceInCents,
        original_price_in_cents: originalPrice ? Math.round(Number.parseFloat(originalPrice) * 100) : null,
        discount_percentage: discountPercentage ? Number.parseInt(discountPercentage) : null,
        category_id: categoryIds[0],
        image_url: imageUrl,
        brand: brand.trim() || null,
        video_url: videoUrl.trim() || null,
        gtin: gtin.trim() || null,
        purchase_note: purchaseNote.trim() || null,
        status: status,
        visibility: visibility,
        stock_quantity: stock,
        is_active: isActive,
        allow_reviews: allowReviews,
        backorders_allowed: backordersAllowed,
        sold_individually: soldIndividually,
        product_type: productType || "simple",
        product_type_details: productTypeDetails,
        attributes: variationAttributes.filter(attr => attr.values.length > 0),
        specifications: specifications.reduce((acc, spec) => {
          if (spec.key && spec.value) {
            acc[spec.key] = spec.value
          }
          return acc
        }, {} as Record<string, string>),
        features: features,
        tags: tags,
        updated_at: new Date().toISOString(),
      }

      console.log("[v0] Product data prepared:", productData)

      let productId: string

      if (product) {
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id)

        if (updateError) {
          console.error("[v0] Update error:", updateError)
          throw new Error(updateError.message || "Failed to update product")
        }
        productId = product.id
        console.log("[v0] Product updated with ID:", productId)
      } else {
        const { data: insertedProduct, error: insertError } = await supabase
          .from("products")
          .insert(productData)
          .select("id")
          .single()

        if (insertError) {
          console.error("[v0] Insert error:", insertError)
          throw new Error(insertError.message || "Failed to create product")
        }

        if (!insertedProduct || !insertedProduct.id) {
          throw new Error("Product was created but no ID was returned. Please try again.")
        }

        productId = insertedProduct.id
        console.log("[v0] Product created with ID:", productId)
      }

      // Save product categories
      await supabase.from("product_categories").delete().eq("product_id", productId)
      if (categoryIds.length > 0) {
        const categoryData = categoryIds.map((catId) => ({
          product_id: productId,
          category_id: catId,
        }))
        const { error: catError } = await supabase.from("product_categories").insert(categoryData)
        if (catError) {
          console.error("[v0] Category insert error:", catError)
        }
      }

      // Save gallery images
      await supabase.from("product_gallery").delete().eq("product_id", productId)
      if (gallery.length > 0) {
        const galleryData = gallery.map((url, index) => ({
          product_id: productId,
          image_url: url,
          display_order: index,
          is_primary: index === 0,
        }))
        const { error: galleryError } = await supabase.from("product_gallery").insert(galleryData)
        if (galleryError) {
          console.error("[v0] Gallery insert error:", galleryError)
        }
      }

      // Save specifications
      await supabase.from("product_specifications").delete().eq("product_id", productId)
      const specificationsToInsert = specifications
        .filter((spec) => spec.key && spec.value)
        .map((spec, index) => ({
          product_id: productId,
          spec_key: spec.key,
          spec_value: spec.value,
          display_order: index,
        }))
      if (specificationsToInsert.length > 0) {
        const { error: specsError } = await supabase.from("product_specifications").insert(specificationsToInsert)
        if (specsError) {
          console.error("[v0] Specifications save error:", specsError)
        }
      }

      // Save tags
      await supabase.from("product_tags").delete().eq("product_id", productId)
      if (tags.length > 0) {
        const tagsData = tags.map((tag) => ({
          product_id: productId,
          tag: tag,
        }))
        const { error: tagsError } = await supabase.from("product_tags").insert(tagsData)
        if (tagsError) {
          console.error("[v0] Tags insert error:", tagsError)
        }
      }

      // Save variations (for variable products)
      if (productType === "variable" && variations.length > 0) {
        await supabase.from("product_variations").delete().eq("parent_id", productId)
        
        const variationsData = variations.map((v, index) => ({
          parent_id: productId,
          sku: v.sku || `${sku}-VAR-${index + 1}`,
          price_in_cents: v.price ? Math.round(Number.parseFloat(v.price) * 100) : priceInCents,
          original_price_in_cents: v.originalPrice ? Math.round(Number.parseFloat(v.originalPrice) * 100) : null,
          stock_quantity: Number.parseInt(v.stockQuantity) || 0,
          image_url: v.imageUrl || null,
          attributes: v.attributes,
          is_active: v.isActive,
          position: index,
        }))

        const { error: variationsError } = await supabase.from("product_variations").insert(variationsData)
        if (variationsError) {
          console.error("[v0] Variations save error:", variationsError)
        }
      }

      console.log("[v0] Product saved successfully!")
      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      console.error("[v0] Form submission error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save product"
      setMessage({ type: "error", text: errorMessage })
    } finally {
      setIsSaving(false)
    }
  }

  const renderProductTypeFields = () => {
    switch (productType) {
      case "boot":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Sizes (comma separated)</Label>
                <Input
                  value={productTypeDetails.sizes || ""}
                  onChange={(e) => setProductTypeDetails({ ...productTypeDetails, sizes: e.target.value })}
                  placeholder="36, 37, 38, 39, 40, 41, 42"
                />
              </div>
              <div className="space-y-2">
                <Label>Colors (comma separated)</Label>
                <Input
                  value={productTypeDetails.colors || ""}
                  onChange={(e) => setProductTypeDetails({ ...productTypeDetails, colors: e.target.value })}
                  placeholder="Black, White, Red"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Mounting</Label>
                <Input
                  value={productTypeDetails.mounting || ""}
                  onChange={(e) => setProductTypeDetails({ ...productTypeDetails, mounting: e.target.value })}
                  placeholder="165mm, 195mm"
                />
              </div>
              <div className="space-y-2">
                <Label>Shell Material</Label>
                <Input
                  value={productTypeDetails.shell || ""}
                  onChange={(e) => setProductTypeDetails({ ...productTypeDetails, shell: e.target.value })}
                  placeholder="Carbon Fiber, Fiberglass"
                />
              </div>
            </div>
          </div>
        )

      case "frame":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Frame Sizes (comma separated)</Label>
                <Input
                  value={productTypeDetails.frame_sizes || ""}
                  onChange={(e) => setProductTypeDetails({ ...productTypeDetails, frame_sizes: e.target.value })}
                  placeholder="12.8, 13.0, 13.4, 14.0"
                />
              </div>
              <div className="space-y-2">
                <Label>Frame Colors (comma separated)</Label>
                <Input
                  value={productTypeDetails.frame_colors || ""}
                  onChange={(e) => setProductTypeDetails({ ...productTypeDetails, frame_colors: e.target.value })}
                  placeholder="Black, Silver, Gold"
                />
              </div>
            </div>
          </div>
        )

      case "wheel":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Wheel Sizes (comma separated)</Label>
                <Input
                  value={productTypeDetails.wheel_sizes || ""}
                  onChange={(e) => setProductTypeDetails({ ...productTypeDetails, wheel_sizes: e.target.value })}
                  placeholder="100mm, 110mm, 125mm"
                />
              </div>
              <div className="space-y-2">
                <Label>Wheel Hardness (comma separated)</Label>
                <Input
                  value={productTypeDetails.wheel_hardness || ""}
                  onChange={(e) => setProductTypeDetails({ ...productTypeDetails, wheel_hardness: e.target.value })}
                  placeholder="85A, 88A, 90A"
                />
              </div>
            </div>
          </div>
        )

      case "bearing":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bearing Features</Label>
              <Textarea
                value={productTypeDetails.bearing_features || ""}
                onChange={(e) => setProductTypeDetails({ ...productTypeDetails, bearing_features: e.target.value })}
                placeholder="ABEC-9, Ceramic, Swiss"
                rows={3}
              />
            </div>
          </div>
        )

      case "helmet":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Helmet Sizes (comma separated)</Label>
              <Input
                value={productTypeDetails.helmet_sizes || ""}
                onChange={(e) => setProductTypeDetails({ ...productTypeDetails, helmet_sizes: e.target.value })}
                placeholder="S, M, L, XL"
              />
            </div>
          </div>
        )

      case "accessory":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Accessory Type</Label>
              <Select
                value={productTypeDetails.accessory_type || ""}
                onValueChange={(value) => setProductTypeDetails({ ...productTypeDetails, accessory_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="speed_suits">Speed Suits</SelectItem>
                  <SelectItem value="ankle_bootie">Ankle Bootie</SelectItem>
                  <SelectItem value="gloves">Gloves</SelectItem>
                  <SelectItem value="hoodies">Hoodies</SelectItem>
                  <SelectItem value="wheel_bag">Wheel Bag</SelectItem>
                  <SelectItem value="backpack">Backpack</SelectItem>
                  <SelectItem value="spacers">Spacers</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(productTypeDetails.accessory_type === "speed_suits" ||
              productTypeDetails.accessory_type === "hoodies" ||
              productTypeDetails.accessory_type === "gloves") && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Sizes (comma separated)</Label>
                  <Input
                    value={productTypeDetails.sizes || ""}
                    onChange={(e) => setProductTypeDetails({ ...productTypeDetails, sizes: e.target.value })}
                    placeholder="XS, S, M, L, XL, XXL"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Colors (comma separated)</Label>
                  <Input
                    value={productTypeDetails.colors || ""}
                    onChange={(e) => setProductTypeDetails({ ...productTypeDetails, colors: e.target.value })}
                    placeholder="Black, Blue, Red"
                  />
                </div>
              </div>
            )}
            {productTypeDetails.accessory_type === "custom" && (
              <div className="space-y-2">
                <Label>Custom Name *</Label>
                <Input
                  value={productTypeDetails.custom_name || ""}
                  onChange={(e) => setProductTypeDetails({ ...productTypeDetails, custom_name: e.target.value })}
                  placeholder="Enter custom accessory name"
                />
              </div>
            )}
          </div>
        )

      case "package":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Skate Boot Sizes (comma separated)</Label>
                <Input
                  value={productTypeDetails.boot_sizes || ""}
                  onChange={(e) => setProductTypeDetails({ ...productTypeDetails, boot_sizes: e.target.value })}
                  placeholder="36, 37, 38, 39, 40, 41"
                />
              </div>
              <div className="space-y-2">
                <Label>Colors (comma separated)</Label>
                <Input
                  value={productTypeDetails.colors || ""}
                  onChange={(e) => setProductTypeDetails({ ...productTypeDetails, colors: e.target.value })}
                  placeholder="Black, White, Blue"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Inline Skate Frame</Label>
              <Input
                value={productTypeDetails.frame_type || ""}
                onChange={(e) => setProductTypeDetails({ ...productTypeDetails, frame_type: e.target.value })}
                placeholder="e.g., 4x100mm, 3x125mm"
              />
            </div>
          </div>
        )

      case "variable":
        return (
          <p className="text-sm text-muted-foreground">
            Configure variations in the Variations tab to manage different product options like size, color, etc.
          </p>
        )

      default:
        return <p className="text-sm text-muted-foreground">Simple product with no additional type-specific fields</p>
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className="border-2">
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <AlertDescription className="font-medium">{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Step {currentTabIndex + 1} of {TAB_ORDER.length}</span>
          <span className="text-foreground font-medium capitalize">{activeTab}</span>
        </div>
        <div className="flex gap-1">
          {TAB_ORDER.map((tab, index) => (
            <div
              key={tab}
              className={`h-2 w-8 rounded-full transition-colors ${
                index <= currentTabIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 h-auto p-1">
          {TAB_ORDER.map((tab, index) => (
            <TabsTrigger 
              key={tab} 
              value={tab}
              className="text-xs sm:text-sm py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="hidden sm:inline capitalize">{tab}</span>
              <span className="sm:hidden">{index + 1}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Basic Information</CardTitle>
              <CardDescription>Core product details and descriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Product Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Speed Skating Boots"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-sm font-medium">SKU *</Label>
                  <Input 
                    id="sku" 
                    value={sku} 
                    onChange={(e) => setSku(e.target.value)} 
                    placeholder="Auto-generated"
                    className="h-11" 
                  />
                  <p className="text-xs text-muted-foreground">Unique product identifier</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium">URL Slug *</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="speed-skating-boots"
                    className="h-11"
                    required
                  />
                  {slugManuallyEdited && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setSlugManuallyEdited(false)
                        setSlug(generateSlug(name))
                      }}
                      className="shrink-0"
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  URL: /products/{slug || "your-product-slug"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand" className="text-sm font-medium">Brand</Label>
                <Input 
                  id="brand" 
                  value={brand} 
                  onChange={(e) => setBrand(e.target.value)} 
                  placeholder="Auriga"
                  className="h-11" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description" className="text-sm font-medium">Short Description</Label>
                <Textarea
                  id="short_description"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief product summary..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Full Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product description..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feature_description" className="text-sm font-medium">Feature Description</Label>
                <Textarea
                  id="feature_description"
                  value={featureDescription}
                  onChange={(e) => setFeatureDescription(e.target.value)}
                  placeholder="Highlight key features..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Categories *</CardTitle>
              <CardDescription>Select one or more categories for this product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      categoryIds.includes(category.id) 
                        ? "border-primary bg-primary/5 ring-1 ring-primary" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Tags</CardTitle>
              <CardDescription>Add searchable tags for this product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Enter tag and press Enter"
                  className="h-11"
                />
                <Button type="button" onClick={addTag} variant="outline" size="icon" className="h-11 w-11 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1.5 text-sm">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Pricing Information</CardTitle>
              <CardDescription>Set product prices and discounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="original_price" className="text-sm font-medium">Original Price (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="pl-8 h-11"
                      placeholder="199.99"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">Sale Price (USD) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="pl-8 h-11"
                      placeholder="149.99"
                      required
                    />
                  </div>
                </div>
              </div>

              {discountPercentage && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="font-medium">
                    Discount: {discountPercentage}% off original price
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Product Images</CardTitle>
              <CardDescription>Upload product images and videos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Main Product Image *</Label>
                <ImageKitUpload value={imageUrl} onChange={setImageUrl} folder="products" />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Product Gallery</Label>
                <p className="text-xs text-muted-foreground">
                  Add additional images to showcase your product from different angles
                </p>
                <ImageKitUpload value="" onChange={addGalleryImage} folder="products/gallery" />
                
                {gallery.length > 0 && (
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mt-4">
                    {gallery.map((url, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="bg-destructive text-destructive-foreground p-2 rounded-full hover:bg-destructive/90 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <Badge className="absolute top-2 left-2 text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="video_url" className="text-sm font-medium">Product Video URL</Label>
                <Input
                  id="video_url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variations" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Variations
              </CardTitle>
              <CardDescription>
                Create variations for products with different options like size, color, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Type Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Enable Variations</Label>
                <div className="flex items-center gap-4">
                  <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${productType !== "variable" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <input
                      type="radio"
                      checked={productType !== "variable"}
                      onChange={() => setProductType("simple")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Simple Product</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${productType === "variable" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <input
                      type="radio"
                      checked={productType === "variable"}
                      onChange={() => setProductType("variable")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Variable Product</span>
                  </label>
                </div>
              </div>

              {productType === "variable" && (
                <>
                  <Separator />

                  {/* Attribute Configuration */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Variation Attributes</Label>
                    <p className="text-xs text-muted-foreground">
                      Define the attributes that will differentiate your variations (e.g., Size, Color)
                    </p>
                    
                    {variationAttributes.map((attr, attrIndex) => (
                      <div key={attrIndex} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Input
                            value={attr.name}
                            onChange={(e) => {
                              const updated = [...variationAttributes]
                              updated[attrIndex].name = e.target.value
                              setVariationAttributes(updated)
                            }}
                            placeholder="Attribute Name (e.g., Size)"
                            className="h-10 max-w-[200px]"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setVariationAttributes(variationAttributes.filter((_, i) => i !== attrIndex))}
                            className="shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 items-center">
                          {attr.values.map((value, valueIndex) => (
                            <Badge key={valueIndex} variant="secondary" className="gap-1 px-2 py-1">
                              {value}
                              <button
                                type="button"
                                onClick={() => removeAttributeValue(attrIndex, valueIndex)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          <Input
                            placeholder={`Add ${attr.name || "value"}...`}
                            className="h-8 w-32"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addAttributeValue(attrIndex, (e.target as HTMLInputElement).value)
                                ;(e.target as HTMLInputElement).value = ""
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setVariationAttributes([...variationAttributes, { name: "", values: [] }])}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Attribute
                    </Button>
                  </div>

                  <Separator />

                  {/* Variations List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Variations ({variations.length})</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addVariation}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Variation
                      </Button>
                    </div>
                    
                    {variations.length === 0 ? (
                      <div className="text-center py-8 border rounded-lg border-dashed">
                        <Package className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No variations yet</p>
                        <p className="text-xs text-muted-foreground">Click "Add Variation" to create product variations</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {variations.map((variation, index) => (
                          <div key={index} className="p-4 border rounded-lg space-y-4 bg-background">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                                <Badge variant="outline">Variation {index + 1}</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={variation.isActive}
                                  onCheckedChange={(checked) => updateVariation(index, "isActive", checked)}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeVariation(index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Attributes */}
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {variationAttributes.filter(attr => attr.name && attr.values.length > 0).map((attr) => (
                                <div key={attr.name} className="space-y-1">
                                  <Label className="text-xs">{attr.name}</Label>
                                  <Select
                                    value={variation.attributes[attr.name] || ""}
                                    onValueChange={(value) => updateVariationAttribute(index, attr.name, value)}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder={`Select ${attr.name}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {attr.values.map((value) => (
                                        <SelectItem key={value} value={value}>
                                          {value}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ))}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              <div className="space-y-1">
                                <Label className="text-xs">SKU</Label>
                                <Input
                                  value={variation.sku}
                                  onChange={(e) => updateVariation(index, "sku", e.target.value)}
                                  placeholder="Variation SKU"
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Price ($)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={variation.price}
                                  onChange={(e) => updateVariation(index, "price", e.target.value)}
                                  placeholder="0.00"
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Original Price ($)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={variation.originalPrice}
                                  onChange={(e) => updateVariation(index, "originalPrice", e.target.value)}
                                  placeholder="0.00"
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Stock</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={variation.stockQuantity}
                                  onChange={(e) => updateVariation(index, "stockQuantity", e.target.value)}
                                  placeholder="0"
                                  className="h-9"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Variation Image</Label>
                              <ImageKitUpload
                                value={variation.imageUrl}
                                onChange={(url) => updateVariation(index, "imageUrl", url)}
                                folder="products/variations"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="type" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Product Type</CardTitle>
              <CardDescription>Define product category-specific attributes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="product_type" className="text-sm font-medium">Product Type</Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple Product</SelectItem>
                    <SelectItem value="variable">Variable Product</SelectItem>
                    <SelectItem value="boot">Boot</SelectItem>
                    <SelectItem value="frame">Frame</SelectItem>
                    <SelectItem value="wheel">Wheel</SelectItem>
                    <SelectItem value="bearing">Bearing</SelectItem>
                    <SelectItem value="helmet">Helmet</SelectItem>
                    <SelectItem value="accessory">Accessory</SelectItem>
                    <SelectItem value="package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {renderProductTypeFields()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Product Features</CardTitle>
              <CardDescription>List key product features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  placeholder="Enter feature and press Enter"
                  className="h-11"
                />
                <Button type="button" onClick={addFeature} variant="outline" size="icon" className="h-11 w-11 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">{feature}</span>
                    <button 
                      type="button" 
                      onClick={() => removeFeature(feature)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Specifications</CardTitle>
              <CardDescription>Add technical specifications for the product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={spec.key}
                      onChange={(e) => {
                        const newSpecs = [...specifications]
                        newSpecs[index].key = e.target.value
                        setSpecifications(newSpecs)
                      }}
                      placeholder="e.g., Weight, Material, Size"
                      className="h-10"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Value</Label>
                    <Input
                      value={spec.value}
                      onChange={(e) => {
                        const newSpecs = [...specifications]
                        newSpecs[index].value = e.target.value
                        setSpecifications(newSpecs)
                      }}
                      placeholder="e.g., 36kg, Carbon Fiber, Large"
                      className="h-10"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSpecifications(specifications.filter((_, i) => i !== index))
                    }}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSpecifications([...specifications, { key: "", value: "" }])
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Specification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Stock & Status</CardTitle>
              <CardDescription>Manage inventory and product visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-medium">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gtin" className="text-sm font-medium">GTIN / UPC / EAN / ISBN</Label>
                  <Input
                    id="gtin"
                    value={gtin}
                    onChange={(e) => setGtin(e.target.value)}
                    placeholder="e.g., 012345678901"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">Product Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility" className="text-sm font-medium">Catalog Visibility</Label>
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visible">Shop and Search</SelectItem>
                      <SelectItem value="catalog">Shop Only</SelectItem>
                      <SelectItem value="search">Search Only</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label htmlFor="active" className="text-sm font-medium">Active Status</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isActive ? "Product is visible to customers" : "Product is hidden from store"}
                    </p>
                  </div>
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label htmlFor="allow_reviews" className="text-sm font-medium">Allow Reviews</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {allowReviews ? "Customers can leave reviews" : "Reviews disabled for this product"}
                    </p>
                  </div>
                  <Switch id="allow_reviews" checked={allowReviews} onCheckedChange={setAllowReviews} />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label htmlFor="backorders" className="text-sm font-medium">Allow Backorders</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {backordersAllowed ? "Allow orders when out of stock" : "No backorders allowed"}
                    </p>
                  </div>
                  <Switch id="backorders" checked={backordersAllowed} onCheckedChange={setBackordersAllowed} />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label htmlFor="sold_individually" className="text-sm font-medium">Sold Individually</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {soldIndividually ? "Limit to 1 item per order" : "No quantity limit per order"}
                    </p>
                  </div>
                  <Switch id="sold_individually" checked={soldIndividually} onCheckedChange={setSoldIndividually} />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="purchase_note" className="text-sm font-medium">Purchase Note</Label>
                <Textarea
                  id="purchase_note"
                  value={purchaseNote}
                  onChange={(e) => setPurchaseNote(e.target.value)}
                  placeholder="Note to display after purchase (e.g., sizing info, care instructions)"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousTab}
              disabled={!canGoPrevious || isSaving}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.back()} 
                disabled={isSaving}
              >
                Cancel
              </Button>
              
              {isLastTab ? (
                <Button 
                  type="submit" 
                  disabled={isSaving || !imageUrl || categoryIds.length === 0}
                  className="gap-2 min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {product ? "Update Product" : "Create Product"}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={goToNextTab}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
