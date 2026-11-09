-- ==============================================================================
-- ACHAR & CO. — COMPLETE SUPABASE DATABASE SCHEMA, RLS & STORAGE SETUP
-- Product Management System & Customer Enquiries
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Trigger Function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. TABLE: product_categories
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. TABLE: products
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  regular_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_price NUMERIC(10, 2),
  pack_size TEXT DEFAULT '250g',
  ingredients TEXT,
  flavour_profile TEXT,
  storage_instructions TEXT,
  shelf_life TEXT,
  allergen_information TEXT,
  weight TEXT DEFAULT '250g',
  availability_status TEXT NOT NULL DEFAULT 'In Stock' CHECK (availability_status IN ('In Stock', 'Out of Stock', 'Pre-Order', 'Limited Stock')),
  product_status TEXT NOT NULL DEFAULT 'Active' CHECK (product_status IN ('Active', 'Draft', 'Inactive')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(product_status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);

DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 5. TABLE: product_images
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON public.product_images(product_id, is_primary);

-- ==============================================================================
-- 6. TABLE: enquiries (Existing and preserved)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Completed', 'Rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);

DROP TRIGGER IF EXISTS tr_enquiries_updated_at ON public.enquiries;
CREATE TRIGGER tr_enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- 7.1 product_categories Policies
DROP POLICY IF EXISTS "Public can view product categories" ON public.product_categories;
CREATE POLICY "Public can view product categories"
  ON public.product_categories FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated admins can manage product categories" ON public.product_categories;
CREATE POLICY "Authenticated admins can manage product categories"
  ON public.product_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7.2 products Policies
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (product_status = 'Active');

DROP POLICY IF EXISTS "Authenticated admins can manage all products" ON public.products;
CREATE POLICY "Authenticated admins can manage all products"
  ON public.products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7.3 product_images Policies
DROP POLICY IF EXISTS "Public can view product images" ON public.product_images;
CREATE POLICY "Public can view product images"
  ON public.product_images FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
      AND (p.product_status = 'Active' OR auth.role() = 'authenticated')
    )
  );

DROP POLICY IF EXISTS "Authenticated admins can manage product images" ON public.product_images;
CREATE POLICY "Authenticated admins can manage product images"
  ON public.product_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7.4 enquiries Policies
DROP POLICY IF EXISTS "Public can insert enquiries" ON public.enquiries;
CREATE POLICY "Public can insert enquiries"
  ON public.enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(full_name)) > 0 AND
    length(trim(phone)) >= 7 AND
    length(trim(message)) > 0
  );

DROP POLICY IF EXISTS "Authenticated admins can view and manage enquiries" ON public.enquiries;
CREATE POLICY "Authenticated admins can view and manage enquiries"
  ON public.enquiries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 8. STORAGE BUCKET FOR PRODUCT IMAGES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated admins can upload product images" ON storage.objects;
CREATE POLICY "Authenticated admins can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated admins can update product images" ON storage.objects;
CREATE POLICY "Authenticated admins can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated admins can delete product images" ON storage.objects;
CREATE POLICY "Authenticated admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- ==============================================================================
-- 9. INITIAL SEED DATA & MIGRATION OF EXISTING PRODUCTS
-- ==============================================================================

-- 9.1 Seed Categories
INSERT INTO public.product_categories (name, slug)
VALUES
  ('Mango Pickle', 'mango-pickle'),
  ('Lemon Pickle', 'lemon-pickle'),
  ('Special Pickles', 'special-pickles'),
  ('Vegetable Pickle', 'vegetable-pickle'),
  ('Seafood & Coastal', 'seafood-coastal')
ON CONFLICT (slug) DO NOTHING;

-- 9.2 Seed Initial Heritage Products (Migrated from existing catalogue)
INSERT INTO public.products (
  id, name, slug, short_description, description, regular_price, discount_price,
  pack_size, ingredients, flavour_profile, storage_instructions, shelf_life, allergen_information,
  weight, availability_status, product_status, is_featured
)
VALUES
(
  'a1000000-0000-0000-0000-000000000001',
  'Kerala Cut Mango Pickle',
  'kerala-cut-mango-pickle',
  'Crisp green raw mango cubes cured with stone-pounded Kashmiri chilli, roasted fenugreek, and cold-pressed gingelly oil.',
  'Our signature heirloom recipe inspired by traditional Central Travancore households. Hand-cut crisp green mangoes are salted until tender, then simmered in fragrant cold-pressed sesame oil with roasted mustard, fenugreek, and fragrant asafoetida.',
  190.00,
  NULL,
  '250g',
  'Raw Country Mangoes, Cold-Pressed Gingelly (Sesame) Oil, Kashmiri Chilli Powder, Fenugreek Powder, Mustard Seeds, Asafoetida (Hing), Turmeric, Rock Salt, Curry Leaves.',
  'Crisp, tangy, balanced spice with rich roasted fenugreek aroma',
  'Store in a cool, dry place away from direct sunlight. Always use a clean, bone-dry spoon. Ensure the layer of gingelly oil covers the surface.',
  '9 months from packaging date',
  'Contains Sesame. Processed in a facility that handles mustard seeds.',
  '250g',
  'In Stock',
  'Active',
  true
),
(
  'a1000000-0000-0000-0000-000000000002',
  'Vadukapuli Naranga Pickle',
  'vadukapuli-naranga-pickle',
  'Piquant Kerala wild citron (Vadukapuli) slowly simmered with fiery green chillies and roasted spices. An indispensable Onam feast classic.',
  'Vadukapuli (large thick-skinned wild lemon) is the crown jewel of Kerala Sadhya feasts. Hand-chopped with its fragrant rind intact, balanced with a subtle bitter-tart kick that aids digestion and elevates any rice meal.',
  180.00,
  NULL,
  '250g',
  'Vadukapuli (Kerala Wild Citron), Cold-Pressed Gingelly Oil, Red Chilli Powder, Turmeric, Fenugreek, Mustard Seeds, Rock Salt, Green Chillies, Asafoetida.',
  'Bittersweet citrus zest, tart, fiery brine kick',
  'Keep in an airtight earthenware bharani or glass jar. Do not expose to moisture. Keep oil layer intact.',
  '12 months from packaging date',
  'Contains Sesame and Mustard.',
  '250g',
  'In Stock',
  'Active',
  true
),
(
  'a1000000-0000-0000-0000-000000000003',
  'Kanthari Mulaku Pickle',
  'kanthari-mulaku-pickle',
  'Fiery local bird''s eye chillies cured in brine, garlic, and gingelly oil. Unmatched natural heat with medicinal Kerala folklore pedigree.',
  'Grown in backyards across Kerala, the tiny ivory Kanthari chilli packs intense clean heat and distinct medicinal character. We gently prick each chilli so the sun-steeped brine, lime, and warm spices penetrate to the core.',
  240.00,
  220.00,
  '250g',
  'Fresh Green & White Kanthari Chillies, Garlic Cloves, Lime Juice, Cold-Pressed Sesame Oil, Fenugreek, Mustard Seeds, Rock Salt, Asafoetida.',
  'Pungent, clean, fiery heat with zesty lime finish',
  'Store in a cool dry pantry. Use a dry spoon. Keep tightly closed.',
  '6 months from packaging date',
  'Contains Sesame and Mustard.',
  '250g',
  'In Stock',
  'Active',
  true
),
(
  'a1000000-0000-0000-0000-000000000004',
  'Spiced Garlic Pickle',
  'spiced-garlic-pickle',
  'Plump peeled garlic cloves simmered tender in a thick, velvety roasted red masala with curry leaves and pure sesame oil.',
  'Whole garlic cloves slowly confited in simmering gingelly oil with hand-ground spices until tender and mellow. Rich, savoury, and deeply aromatic, pairs exquisitely with Kanji or layered Biryani.',
  220.00,
  NULL,
  '250g',
  'Select Whole Garlic Cloves, Cold-Pressed Sesame Oil, Kashmiri Chilli Powder, Fenugreek, Mustard Seeds, Tamarind Pulp, Asafoetida, Rock Salt, Curry Leaves.',
  'Mellow garlic richness, deep roasted chili warmth',
  'Store at ambient room temperature. Do not refrigerate before opening.',
  '9 months from packaging date',
  'Contains Sesame and Mustard.',
  '250g',
  'In Stock',
  'Active',
  false
),
(
  'a1000000-0000-0000-0000-000000000005',
  'Festive Inji Puli (Ginger Curry Pickle)',
  'festive-inji-puli',
  'Finely sliced ginger fried crisp, simmered in aged Malabar tamarind, jaggery, green chillies, and roasted cumin.',
  'Considered in Kerala culinary lore to equal the digestive power of 101 curries. Thinly shredded fresh ginger is slow-fried in gingelly oil, married with thick dark Kodampuli/Tamarind paste and organic palm jaggery for the definitive sweet-sour-spicy symphony.',
  230.00,
  NULL,
  '250g',
  'Fresh Country Ginger, Dark Tamarind Extract, Organic Palm Jaggery, Green Chillies, Gingelly Oil, Fenugreek, Mustard Seeds, Curry Leaves, Rock Salt.',
  'Sweet, tangy tamarind with warm ginger pungency',
  'Refrigerate after opening to preserve the delicate balance of tamarind and jaggery.',
  '12 months from packaging date',
  'Contains Sesame and Mustard.',
  '250g',
  'In Stock',
  'Active',
  false
),
(
  'a1000000-0000-0000-0000-000000000006',
  'Kannimanga Whole Tender Mango',
  'kannimanga-whole-tender-mango',
  'Intact whole baby mangoes aged in terracotta bharanis with brine and crushed red chillies. Nostalgic crunchy burst.',
  'Harvested during the early weeks of summer when mangoes are no larger than a betel nut with soft, developing seeds. Preserved whole in heavy ceramic bharani jars for months until the brine and spices thoroughly permeate each fruit.',
  260.00,
  NULL,
  '250g',
  'Whole Baby Tender Mangoes (Kannimanga), Mustard-Chilli Paste, Rock Salt Brine, Gingelly Oil, Fenugreek, Asafoetida.',
  'Nostalgic crunchy burst, salty-sour-spicy brine infusion',
  'Keep fully submerged under the spiced brine layer in a glass or ceramic container.',
  '12 months from packaging date',
  'Contains Sesame and Mustard.',
  '250g',
  'In Stock',
  'Active',
  false
),
(
  'a1000000-0000-0000-0000-000000000007',
  'Coastal Kerala Prawn Pickle',
  'coastal-kerala-prawn-pickle',
  'Succulent sea prawns shallow fried in coconut-gingelly oil, steeped in roasted shallots, garlic, and fiery Malabar spices.',
  'A celebrated delicacy from the fishing hamlets of Alappuzha and Kollam. Fresh prawns are sun-cured with turmeric and pepper, pan-crisped and gently infused into an aromatic ginger-garlic gravy that mellows with each passing week.',
  320.00,
  299.00,
  '250g',
  'Fresh Marine Prawns, Cold-Pressed Gingelly & Coconut Oil, Garlic, Ginger, Kashmiri Chilli, Natural Vinegar, Fenugreek, Mustard Seeds, Curry Leaves, Salt.',
  'Deep coastal seafood richness, garlicky, spicy vinegar reduction',
  'Refrigerate upon arrival. Always use a dry spoon and ensure the oil layer rests on top.',
  '6 months from packaging date',
  'Contains Crustaceans (Prawns), Sesame, Mustard.',
  '250g',
  'In Stock',
  'Active',
  true
),
(
  'a1000000-0000-0000-0000-000000000008',
  'Traditional Malabar Fish Pickle',
  'traditional-malabar-fish-pickle',
  'Firm seer fish cubes marinated in crushed peppercorns and fried crisp before marrying with aged vinegar and fragrant spice reduction.',
  'Prepared in the authentic North Malabar seaside tradition. Fresh firm sea fish steaks are diced, gently spiced, flash-fried, and preserved in deep crimson oil enriched with shallots, garlic slivers, and green chillies.',
  310.00,
  NULL,
  '250g',
  'Firm Sea Fish, Cold-Pressed Gingelly Oil, Garlic, Shallots, Kashmiri Chilli, Green Chillies, Fenugreek, Mustard, Natural Brewed Vinegar, Curry Leaves, Salt.',
  'Firm crisped fish bite, tangy-spicy pickled reduction',
  'Keep refrigerated after opening. Do not introduce water or moisture.',
  '6 months from packaging date',
  'Contains Fish, Sesame, Mustard.',
  '250g',
  'In Stock',
  'Active',
  false
)
ON CONFLICT (slug) DO NOTHING;

-- 9.3 Link Seed Products to Categories
UPDATE public.products SET category_id = (SELECT id FROM public.product_categories WHERE slug = 'mango-pickle') WHERE slug IN ('kerala-cut-mango-pickle', 'kannimanga-whole-tender-mango');
UPDATE public.products SET category_id = (SELECT id FROM public.product_categories WHERE slug = 'lemon-pickle') WHERE slug = 'vadukapuli-naranga-pickle';
UPDATE public.products SET category_id = (SELECT id FROM public.product_categories WHERE slug = 'special-pickles') WHERE slug IN ('kanthari-mulaku-pickle', 'festive-inji-puli');
UPDATE public.products SET category_id = (SELECT id FROM public.product_categories WHERE slug = 'vegetable-pickle') WHERE slug = 'spiced-garlic-pickle';
UPDATE public.products SET category_id = (SELECT id FROM public.product_categories WHERE slug = 'seafood-coastal') WHERE slug IN ('coastal-kerala-prawn-pickle', 'traditional-malabar-fish-pickle');

-- 9.4 Seed Product Primary Images
INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=85', 'Kerala Cut Mango Pickle in bowl', 0, true),
  ('a1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=85', 'Vadukapuli Lemon Pickle', 0, true),
  ('a1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=1000&q=85', 'Kanthari Mulaku Pickle', 0, true),
  ('a1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=1000&q=85', 'Spiced Garlic Pickle', 0, true),
  ('a1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1000&q=85', 'Festive Inji Puli Pickle', 0, true),
  ('a1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85', 'Kannimanga Tender Mango Pickle', 0, true),
  ('a1000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1000&q=85', 'Coastal Kerala Prawn Pickle', 0, true),
  ('a1000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=85', 'Traditional Malabar Fish Pickle', 0, true)
ON CONFLICT DO NOTHING;
