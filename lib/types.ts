export interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: "customer" | "manager" | "admin"
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// Product Attribute for variable products
export interface ProductAttribute {
  name: string
  values: string[]
  visible: boolean
  variation: boolean
}

// Product Type Details for specific product types
export interface ProductTypeDetails {
  // Boot specific
  sizes?: string
  colors?: string
  mounting?: string
  shell?: string
  upper_material?: string
  inner_lining?: string
  heat_moldable?: boolean
  closure_system?: string
  // Frame specific
  frame_sizes?: string
  frame_colors?: string
  wheel_setup?: string
  frame_length?: string
  mount_separation?: string
  material?: string
  // Wheel specific
  wheel_sizes?: string
  wheel_hardness?: string
  wheel_type?: string
  // Helmet specific
  helmet_sizes?: string
  visor_included?: boolean
  visor_type?: string
  certification?: string
  // Accessory specific
  accessory_type?: string
  thickness?: string
  custom_name?: string
  // Package specific
  boot_sizes?: string
  frame_type?: string
  included_items?: string[]
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  feature_description: string | null
  sku: string
  gtin: string | null
  brand: string | null
  price_in_cents: number
  original_price_in_cents: number | null
  compare_at_price_in_cents: number | null
  cost_per_item_in_cents: number | null
  discount_percentage: number | null
  sale_price_start: string | null
  sale_price_end: string | null
  stock_quantity: number
  low_stock_threshold: number | null
  backorders_allowed: boolean
  sold_individually: boolean
  weight: number | null
  weight_unit: string | null
  length: number | null
  width: number | null
  height: number | null
  product_type: "simple" | "variable" | "boot" | "frame" | "wheel" | "bearing" | "helmet" | "accessory" | "package" | null
  product_type_details: ProductTypeDetails | null
  status: "draft" | "published" | "archived"
  visibility: "visible" | "catalog" | "search" | "hidden"
  is_active: boolean
  is_featured: boolean
  deal_of_the_day: boolean
  allow_reviews: boolean
  purchase_note: string | null
  category_id: string | null
  image_url: string | null
  video_url: string | null
  video_thumbnail: string | null
  meta_title: string | null
  meta_description: string | null
  attributes: ProductAttribute[] | null
  default_attributes: Record<string, string> | null
  upsell_ids: string[] | null
  cross_sell_ids: string[] | null
  grouped_product_ids: string[] | null
  parent_id: string | null
  shipping_class: string | null
  tax_status: "taxable" | "shipping" | "none" | null
  tax_class: string | null
  features: string[] | null
  tags: string[] | null
  specifications: Record<string, string> | null
  created_at: string
  updated_at: string
  category?: Category
  gallery?: ProductGallery[]
  variations?: ProductVariation[]
}

export interface ProductGallery {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  display_order: number
  is_primary: boolean
  created_at: string
}

export interface ProductVariation {
  id: string
  parent_id: string
  sku: string | null
  price_in_cents: number
  original_price_in_cents: number | null
  stock_quantity: number
  image_url: string | null
  attributes: Record<string, string>
  is_active: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface ProductSpecification {
  id: string
  product_id: string
  spec_key: string
  spec_value: string
  display_order: number
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  display_order: number
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  user?: User
}

export interface Order {
  id: string
  user_id: string | null
  total_amount_in_cents: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  stripe_payment_intent_id: string | null
  shipping_address: {
    name: string
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  created_at: string
  updated_at: string
  user?: User
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  quantity: number
  price_in_cents: number
  created_at: string
  product?: Product
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  selected_attributes?: Record<string, string>
  created_at: string
  updated_at: string
  product?: Product
}
