-- Migration: Add WooCommerce-style fields to products table
-- This migration adds additional fields to support WooCommerce product data import

-- Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS feature_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gtin VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price_in_cents INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percentage INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS backorders_allowed BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sold_individually BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS length DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS width DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS height DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'visible';
ALTER TABLE products ADD COLUMN IF NOT EXISTS allow_reviews BOOLEAN DEFAULT TRUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_note TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_thumbnail VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS default_attributes JSONB DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS upsell_ids TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS cross_sell_ids TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS grouped_product_ids TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_class VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_status VARCHAR(50) DEFAULT 'taxable';
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_class VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type_details JSONB DEFAULT '{}'::jsonb;

-- Create index for parent products (for variable products)
CREATE INDEX IF NOT EXISTS idx_products_parent_id ON products(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_visibility ON products(visibility);

-- Create product_variations table for variable products
CREATE TABLE IF NOT EXISTS product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(255),
  price_in_cents INTEGER NOT NULL,
  original_price_in_cents INTEGER,
  stock_quantity INTEGER DEFAULT 0,
  image_url VARCHAR(500),
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for product_variations
CREATE INDEX IF NOT EXISTS idx_product_variations_parent_id ON product_variations(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_sku ON product_variations(sku);

-- Enable RLS on product_variations
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_variations
CREATE POLICY "Anyone can view active variations" ON product_variations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage variations" ON product_variations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    )
  );

-- Update product_type column to support new types
ALTER TABLE products 
  DROP CONSTRAINT IF EXISTS products_product_type_check;
  
ALTER TABLE products 
  ADD CONSTRAINT products_product_type_check 
  CHECK (product_type IN ('simple', 'variable', 'boot', 'frame', 'wheel', 'bearing', 'helmet', 'accessory', 'package'));

-- Update visibility constraint
ALTER TABLE products 
  DROP CONSTRAINT IF EXISTS products_visibility_check;
  
ALTER TABLE products 
  ADD CONSTRAINT products_visibility_check 
  CHECK (visibility IN ('visible', 'catalog', 'search', 'hidden'));

-- Add updated_at trigger for product_variations
CREATE OR REPLACE FUNCTION update_product_variations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_product_variations_updated_at ON product_variations;
CREATE TRIGGER trigger_product_variations_updated_at
  BEFORE UPDATE ON product_variations
  FOR EACH ROW
  EXECUTE FUNCTION update_product_variations_updated_at();
