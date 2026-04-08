/**
 * Script to seed products from the JSON data file
 * Run with: npx ts-node scripts/seed-products-from-json.ts
 * 
 * This script reads the products.json file and inserts the data into Supabase
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ProductData {
  wp_id: number
  name: string
  slug: string
  sku: string
  brand?: string
  product_type?: string
  short_description?: string
  description?: string
  price_in_cents: number
  original_price_in_cents?: number
  discount_percentage?: number
  category_slugs: string[]
  images: string[]
  product_type_details?: Record<string, any>
  specifications?: Record<string, string>
  features?: string[]
  variations?: Array<{
    attributes: Record<string, string>
    price_in_cents: number
    original_price_in_cents?: number
    stock_quantity: number
  }>
  is_active: boolean
  status: string
  visibility?: string
  allow_reviews?: boolean
}

interface CategoryData {
  name: string
  slug: string
  description?: string
  parent_id?: string | null
  parent_slug?: string
  is_active: boolean
  sort_order: number
}

async function seedDatabase() {
  console.log("Starting database seed...")

  // Read the JSON file
  const jsonPath = path.join(__dirname, "..", "data", "products.json")
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"))

  const { categories, products } = jsonData as {
    categories: CategoryData[]
    products: ProductData[]
  }

  // Create categories first
  console.log(`\nSeeding ${categories.length} categories...`)
  const categoryMap: Record<string, string> = {}

  // First pass: create parent categories
  for (const category of categories.filter((c) => !c.parent_slug)) {
    const { data, error } = await supabase
      .from("categories")
      .upsert(
        {
          name: category.name,
          slug: category.slug,
          description: category.description,
          parent_id: null,
          is_active: category.is_active,
          sort_order: category.sort_order,
        },
        { onConflict: "slug" }
      )
      .select()
      .single()

    if (error) {
      console.error(`Error creating category ${category.name}:`, error)
    } else {
      console.log(`  Created category: ${category.name}`)
      categoryMap[category.slug] = data.id
    }
  }

  // Second pass: create child categories
  for (const category of categories.filter((c) => c.parent_slug)) {
    const parentId = categoryMap[category.parent_slug!]
    const { data, error } = await supabase
      .from("categories")
      .upsert(
        {
          name: category.name,
          slug: category.slug,
          description: category.description,
          parent_id: parentId || null,
          is_active: category.is_active,
          sort_order: category.sort_order,
        },
        { onConflict: "slug" }
      )
      .select()
      .single()

    if (error) {
      console.error(`Error creating category ${category.name}:`, error)
    } else {
      console.log(`  Created category: ${category.name} (child of ${category.parent_slug})`)
      categoryMap[category.slug] = data.id
    }
  }

  // Create products
  console.log(`\nSeeding ${products.length} products...`)

  for (const product of products) {
    // Get primary category ID
    const primaryCategorySlug = product.category_slugs[0]
    const primaryCategoryId = categoryMap[primaryCategorySlug]

    // Prepare product data
    const productData = {
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      brand: product.brand || null,
      product_type: product.product_type || null,
      short_description: product.short_description || null,
      description: product.description || null,
      price_in_cents: product.price_in_cents,
      original_price_in_cents: product.original_price_in_cents || null,
      discount_percentage: product.discount_percentage || null,
      category_id: primaryCategoryId || null,
      image_url: product.images[0] || null,
      product_type_details: product.product_type_details || {},
      specifications: product.specifications || {},
      features: product.features || [],
      is_active: product.is_active,
      status: product.status,
      visibility: product.visibility || "visible",
      allow_reviews: product.allow_reviews ?? true,
      stock_quantity: product.variations?.[0]?.stock_quantity || 10,
    }

    const { data: savedProduct, error } = await supabase
      .from("products")
      .upsert(productData, { onConflict: "slug" })
      .select()
      .single()

    if (error) {
      console.error(`Error creating product ${product.name}:`, error)
      continue
    }

    console.log(`  Created product: ${product.name}`)

    // Link product to all categories
    for (const catSlug of product.category_slugs) {
      const catId = categoryMap[catSlug]
      if (catId) {
        await supabase.from("product_categories").upsert(
          {
            product_id: savedProduct.id,
            category_id: catId,
          },
          { onConflict: "product_id,category_id" }
        )
      }
    }

    // Add gallery images
    if (product.images.length > 1) {
      const galleryData = product.images.slice(1).map((url, index) => ({
        product_id: savedProduct.id,
        image_url: url,
        display_order: index + 1,
        is_primary: false,
      }))

      await supabase.from("product_gallery").upsert(galleryData)
    }

    // Add specifications
    if (product.specifications) {
      const specsData = Object.entries(product.specifications).map(([key, value], index) => ({
        product_id: savedProduct.id,
        spec_key: key,
        spec_value: value,
        display_order: index,
      }))

      await supabase.from("product_specifications").upsert(specsData)
    }

    // Add variations if product is variable
    if (product.variations && product.variations.length > 0) {
      const variationsData = product.variations.map((variation, index) => ({
        parent_id: savedProduct.id,
        price_in_cents: variation.price_in_cents,
        original_price_in_cents: variation.original_price_in_cents || null,
        stock_quantity: variation.stock_quantity,
        attributes: variation.attributes,
        is_active: true,
        position: index,
      }))

      const { error: varError } = await supabase.from("product_variations").upsert(variationsData)

      if (varError) {
        console.error(`  Error creating variations for ${product.name}:`, varError)
      } else {
        console.log(`    Added ${variationsData.length} variations`)
      }
    }
  }

  console.log("\nDatabase seed complete!")
}

seedDatabase().catch(console.error)
