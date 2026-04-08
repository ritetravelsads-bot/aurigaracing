import { ObjectId } from "mongodb"

// User model
export interface User {
  _id?: ObjectId
  id?: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  role: "customer" | "admin" | "manager"
  avatar_url?: string
  phone?: string
  is_active: boolean
  email_verified: boolean
  created_at: Date
  updated_at: Date
}

// Session model for auth
export interface Session {
  _id?: ObjectId
  user_id: string
  token: string
  expires_at: Date
  created_at: Date
}

// Product model
export interface Product {
  _id?: ObjectId
  id?: string
  name: string
  slug: string
  description?: string
  short_description?: string
  sku: string
  brand?: string
  price_in_cents: number
  compare_at_price_in_cents?: number
  cost_per_item_in_cents?: number
  stock_quantity: number
  low_stock_threshold?: number
  weight?: number
  weight_unit?: string
  product_type?: string
  status: "draft" | "published" | "archived"
  is_active: boolean
  is_featured: boolean
  deal_of_the_day: boolean
  image_url?: string
  meta_title?: string
  meta_description?: string
  created_at: Date
  updated_at: Date
}

// Product Category (junction)
export interface ProductCategory {
  _id?: ObjectId
  product_id: string
  category_id: string
}

// Product Gallery
export interface ProductGallery {
  _id?: ObjectId
  product_id: string
  image_url: string
  alt_text?: string
  sort_order: number
}

// Product Specification
export interface ProductSpecification {
  _id?: ObjectId
  product_id: string
  name: string
  value: string
}

// Product Tag
export interface ProductTag {
  _id?: ObjectId
  product_id: string
  tag: string
}

// Category model
export interface Category {
  _id?: ObjectId
  id?: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  is_active: boolean
  sort_order: number
  created_at: Date
  updated_at: Date
}

// Order model
export interface Order {
  _id?: ObjectId
  id?: string
  user_id: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  payment_method?: string
  stripe_session_id?: string
  subtotal_in_cents: number
  shipping_in_cents: number
  tax_in_cents: number
  discount_in_cents: number
  total_in_cents: number
  shipping_address: {
    name: string
    address_line_1: string
    address_line_2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone?: string
  }
  billing_address?: {
    name: string
    address_line_1: string
    address_line_2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone?: string
  }
  notes?: string
  tracking_number?: string
  shipped_at?: Date
  delivered_at?: Date
  created_at: Date
  updated_at: Date
}

// Order Item model
export interface OrderItem {
  _id?: ObjectId
  order_id: string
  product_id: string
  product_name: string
  product_sku: string
  product_image?: string
  quantity: number
  price_in_cents: number
  total_in_cents: number
}

// Cart Item model
export interface CartItem {
  _id?: ObjectId
  id?: string
  user_id: string
  product_id: string
  quantity: number
  created_at: Date
  updated_at: Date
}

// Wishlist model
export interface WishlistItem {
  _id?: ObjectId
  id?: string
  user_id: string
  product_id: string
  created_at: Date
}

// Address model
export interface Address {
  _id?: ObjectId
  id?: string
  user_id: string
  name: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
  is_default: boolean
  type: "shipping" | "billing"
  created_at: Date
  updated_at: Date
}

// Review model
export interface Review {
  _id?: ObjectId
  id?: string
  user_id: string
  product_id: string
  rating: number
  title?: string
  content?: string
  is_approved: boolean
  created_at: Date
  updated_at: Date
}

// Ticket model (support)
export interface Ticket {
  _id?: ObjectId
  id?: string
  user_id: string
  subject: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  created_at: Date
  updated_at: Date
}

// Ticket Reply model
export interface TicketReply {
  _id?: ObjectId
  ticket_id: string
  user_id: string
  message: string
  is_staff: boolean
  created_at: Date
}

// Front Page model (CMS)
export interface FrontPage {
  _id?: ObjectId
  id?: string
  title: string
  slug: string
  content?: string
  meta_title?: string
  meta_description?: string
  is_published: boolean
  created_at: Date
  updated_at: Date
}

// Loyalty Points model
export interface LoyaltyPoints {
  _id?: ObjectId
  user_id: string
  points: number
  lifetime_points: number
  updated_at: Date
}

// Newsletter Subscriber model
export interface NewsletterSubscriber {
  _id?: ObjectId
  email: string
  is_active: boolean
  created_at: Date
}

// Price Alert model
export interface PriceAlert {
  _id?: ObjectId
  user_id: string
  product_id: string
  target_price_in_cents: number
  is_active: boolean
  created_at: Date
}

// Stock Notification model
export interface StockNotification {
  _id?: ObjectId
  user_id: string
  product_id: string
  is_notified: boolean
  created_at: Date
}

// Product Comparison model
export interface ProductComparison {
  _id?: ObjectId
  user_id: string
  product_id: string
  created_at: Date
}

// Recently Viewed model
export interface RecentlyViewed {
  _id?: ObjectId
  user_id: string
  product_id: string
  viewed_at: Date
}

// Product Question model
export interface ProductQuestion {
  _id?: ObjectId
  product_id: string
  user_id: string
  question: string
  answer?: string
  answered_by?: string
  is_approved: boolean
  created_at: Date
  answered_at?: Date
}

// Abandoned Cart model
export interface AbandonedCart {
  _id?: ObjectId
  user_id: string
  cart_items: Array<{
    product_id: string
    quantity: number
  }>
  total_in_cents: number
  created_at: Date
}

// Product Share model
export interface ProductShare {
  _id?: ObjectId
  product_id: string
  user_id?: string
  platform: string
  created_at: Date
}

// Voucher model
export interface Voucher {
  _id?: ObjectId
  id?: string
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_order_value?: number
  max_uses?: number
  used_count: number
  is_active: boolean
  expires_at?: Date
  created_at: Date
}

// Bundle model
export interface Bundle {
  _id?: ObjectId
  id?: string
  name: string
  description?: string
  product_ids: string[]
  discount_percentage: number
  is_active: boolean
  created_at: Date
}
