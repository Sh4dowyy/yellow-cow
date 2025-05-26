-- Add image_urls column to products table
ALTER TABLE products 
ADD COLUMN image_urls TEXT[];

-- Add comment
COMMENT ON COLUMN products.image_urls IS 'Array of additional image URLs for the product'; 