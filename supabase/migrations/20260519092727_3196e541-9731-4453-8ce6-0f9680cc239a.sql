
-- Site content key-value store
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(section, field_key)
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  "order" INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gallery items
CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('image','video')),
  url TEXT NOT NULL,
  caption TEXT,
  "order" INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact submissions
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read site_content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Public read visible products" ON public.products FOR SELECT USING (visible = true);
CREATE POLICY "Public read visible gallery" ON public.gallery_items FOR SELECT USING (visible = true);

-- Anyone can submit contact form
CREATE POLICY "Anyone can submit contact" ON public.contact_submissions FOR INSERT WITH CHECK (true);

-- Authenticated full access (admin)
CREATE POLICY "Auth full site_content" ON public.site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full gallery" ON public.gallery_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth read contacts" ON public.contact_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth delete contacts" ON public.contact_submissions FOR DELETE TO authenticated USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('rb-textile-media', 'rb-textile-media', true);

CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'rb-textile-media');
CREATE POLICY "Auth upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'rb-textile-media');
CREATE POLICY "Auth update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'rb-textile-media');
CREATE POLICY "Auth delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'rb-textile-media');

-- Seed default content
INSERT INTO public.site_content (section, field_key, field_value) VALUES
('hero', 'headline', 'Engineered Textiles. Built in Bangladesh.'),
('hero', 'subheadline', 'RB Textile Mills delivers precision-spun yarns and woven fabrics for global apparel manufacturers.'),
('hero', 'cta_label', 'Request a Quote'),
('about', 'body', 'Founded in 1998, RB Textile Mills operates one of Bangladesh''s most advanced spinning and weaving facilities. Three decades of disciplined manufacturing, vertically integrated from fiber to finished fabric.'),
('about', 'year_established', '1998'),
('about', 'stat_looms', '420'),
('about', 'stat_capacity', '12M m/yr'),
('about', 'stat_workforce', '1,800+'),
('contact_info', 'address', 'Plot 47, BSCIC Industrial Estate, Narayanganj, Bangladesh'),
('contact_info', 'phone', '+880 2 7654 3210'),
('contact_info', 'email', 'sales@rbtextile.com.bd');

INSERT INTO public.products (name, description, "order") VALUES
('Combed Cotton Yarn', 'Premium ring-spun combed cotton yarn, Ne 20s–60s. Suitable for high-end knitwear and shirting.', 1),
('Woven Shirting Fabric', '100% cotton plain and twill weaves, GSM 110–180. Mercerized finish available.', 2),
('Denim Fabric', 'Indigo-dyed denim 8oz–14oz, ring/ring and slub variants for premium apparel programs.', 3),
('Blended Yarn', 'Polyester/cotton, CVC, and viscose blends engineered for durability and drape.', 4);
