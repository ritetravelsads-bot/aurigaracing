import { getDb, ObjectId } from "./client"
import type { Product, ProductCategory } from "./models"

// Helper function to get products by category ID
export async function getProductsByCategory(
  categoryId: string,
  options: {
    isActive?: boolean
    status?: string
    limit?: number
  } = {}
): Promise<Product[]> {
  const db = await getDb()
  if (!db) return []

  // First, get product IDs from the junction table
  const productCategoriesCollection = db.collection<ProductCategory>("product_categories")
  const productCategories = await productCategoriesCollection
    .find({ category_id: categoryId })
    .toArray()

  const productIds = productCategories.map((pc) => new ObjectId(pc.product_id))

  if (productIds.length === 0) return []

  // Then, get the products
  const productsCollection = db.collection<Product>("products")
  const filter: Record<string, unknown> = { _id: { $in: productIds } }

  if (options.isActive !== undefined) {
    filter.is_active = options.isActive
  }

  if (options.status) {
    filter.status = options.status
  }

  let cursor = productsCollection.find(filter)

  if (options.limit) {
    cursor = cursor.limit(options.limit)
  }

  const products = await cursor.toArray()

  return products.map((product) => {
    const { _id, ...rest } = product
    return { ...rest, id: _id.toHexString() } as Product
  })
}

// Helper function to get product IDs by category
export async function getProductIdsByCategory(categoryId: string): Promise<string[]> {
  const db = await getDb()
  if (!db) return []

  const productCategoriesCollection = db.collection<ProductCategory>("product_categories")
  const productCategories = await productCategoriesCollection
    .find({ category_id: categoryId })
    .toArray()

  return productCategories.map((pc) => pc.product_id)
}
