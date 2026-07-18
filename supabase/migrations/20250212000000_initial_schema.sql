/*
# Initial Database Schema for Hesabatk

## Query Description:
This operation creates the initial database structure for the application, migrating the local storage models to PostgreSQL tables. It includes tables for inventory, sales, purchases, and settings.

## Metadata:
- Schema-Category: Structural
- Impact-Level: Low
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Creates tables: categories, products, clients, suppliers, sales, sale_items, purchases, expenses, banks, app_settings.
- Establishes foreign key relationships between products and categories, sales and sale_items, etc.

## Security Implications:
- RLS Status: Enabled on all tables.
- Policy Changes: Added public access policies (since the app currently doesn't use authentication, we allow public access to facilitate the migration. This can be restricted later).
*/

-- 1. Categories Table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    purchase_price NUMERIC NOT NULL DEFAULT 0,
    barcode TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Clients Table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Suppliers Table
CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Sales Table
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_amount NUMERIC NOT NULL DEFAULT 0,
    date TIMESTAMPTZ DEFAULT now(),
    client_name TEXT,
    client_phone TEXT,
    payment_method TEXT,
    bank_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Sale Items Table (For the cart items in a sale)
CREATE TABLE public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Purchases Table
CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_cost NUMERIC NOT NULL DEFAULT 0,
    date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Expenses Table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Banks Table
CREATE TABLE public.banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. App Settings Table
CREATE TABLE public.app_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    currency TEXT DEFAULT 'جنيه سوداني',
    low_stock_threshold INTEGER DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings
INSERT INTO public.app_settings (id, currency, low_stock_threshold) VALUES (1, 'جنيه سوداني', 5) ON CONFLICT DO NOTHING;

-- Insert default banks
INSERT INTO public.banks (name) VALUES 
    ('مصرف الراجحي'),
    ('البنك الأهلي السعودي'),
    ('بنك الرياض'),
    ('بنك الإنماء'),
    ('بنك البلاد'),
    ('البنك الأول'),
    ('أخرى');

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allowing public access for now since the app has no authentication yet)
CREATE POLICY "Allow public access" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow public access" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow public access" ON public.clients FOR ALL USING (true);
CREATE POLICY "Allow public access" ON public.suppliers FOR ALL USING (true);
CREATE POLICY "Allow public access" ON public.sales FOR ALL USING (true);
CREATE POLICY "Allow public access" ON public.sale_items FOR ALL USING (true);
CREATE POLICY "Allow public access" ON public.purchases FOR ALL USING (true);
CREATE POLICY "Allow public access" ON public.expenses FOR ALL USING (true);
CREATE POLICY "Allow public access" ON public.banks FOR ALL USING (true);
CREATE POLICY "Allow public access" ON public.app_settings FOR ALL USING (true);
