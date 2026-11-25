CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============ TIENDAS Y USUARIOS ============
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  rate_mode VARCHAR(6) NOT NULL DEFAULT 'auto' CHECK (rate_mode IN ('auto','manual')),
  manual_rate NUMERIC(14,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'seller' CHECK (role IN ('admin','seller')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ CATÁLOGO ============
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  UNIQUE (store_id, name)
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  sku VARCHAR(50),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price_usd NUMERIC(12,2) NOT NULL CHECK (price_usd >= 0),
  cost_usd NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (cost_usd >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock INT NOT NULL DEFAULT 5 CHECK (min_stock >= 0),
  image_url TEXT,
  image_public_id TEXT,                    -- para borrar la imagen en Cloudinary
  is_active BOOLEAN NOT NULL DEFAULT TRUE, -- borrado lógico
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ TASA DE CAMBIO ============
CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  usd_to_bs NUMERIC(14,4) NOT NULL CHECK (usd_to_bs > 0),
  source VARCHAR(30) NOT NULL,             -- 'dolarapi', 'respaldo', etc.
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ CLIENTES Y PROVEEDORES ============
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  cedula VARCHAR(20) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  phone VARCHAR(25),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, cedula)
);

CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(25),
  email VARCHAR(150),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ COMPRAS (ENTRADAS DE MERCANCÍA) ============
CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id),
  supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
  user_id INT NOT NULL REFERENCES users(id),
  total_cost_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_items (
  id SERIAL PRIMARY KEY,
  purchase_id INT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_cost_usd NUMERIC(12,2) NOT NULL CHECK (unit_cost_usd >= 0)
);

-- ============ VENTAS ============
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id),
  user_id INT NOT NULL REFERENCES users(id),
  customer_id INT REFERENCES customers(id),
  status VARCHAR(10) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','cancelled')),
  payment_status VARCHAR(8) NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid','partial','pending')),
  total_usd NUMERIC(12,2) NOT NULL CHECK (total_usd >= 0),
  exchange_rate NUMERIC(14,4) NOT NULL,
  total_bs NUMERIC(16,2) NOT NULL,
  amount_paid_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date DATE,
  note TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by INT REFERENCES users(id),
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (payment_status = 'paid' OR customer_id IS NOT NULL)   -- el fiado exige cliente
);

CREATE TABLE sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id),
  product_name VARCHAR(150) NOT NULL,      -- foto del nombre al vender
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price_usd NUMERIC(12,2) NOT NULL,
  unit_price_bs NUMERIC(16,2) NOT NULL,
  unit_cost_usd NUMERIC(12,2) NOT NULL DEFAULT 0   -- para calcular ganancia
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id),
  sale_id INT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id),
  method VARCHAR(20) NOT NULL CHECK (method IN
    ('efectivo_usd','efectivo_bs','pago_movil','transferencia','zelle','punto_venta')),
  amount_usd NUMERIC(12,2) NOT NULL CHECK (amount_usd > 0),
  amount_bs NUMERIC(16,2) NOT NULL CHECK (amount_bs > 0),
  exchange_rate NUMERIC(14,4) NOT NULL,
  reference VARCHAR(60),                   -- nº de referencia (pago móvil, transferencia, Zelle)
  voided_at TIMESTAMPTZ,                   -- se llena al anular la venta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ KARDEX ============
CREATE TABLE stock_movements (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id),
  product_id INT NOT NULL REFERENCES products(id),
  user_id INT REFERENCES users(id),
  type VARCHAR(12) NOT NULL CHECK (type IN ('sale','sale_cancel','purchase','adjustment','return')),
  quantity INT NOT NULL CHECK (quantity <> 0),   -- negativo = salida
  sale_id INT REFERENCES sales(id),
  purchase_id INT REFERENCES purchases(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ CIERRE DE CAJA ============
CREATE TABLE cash_closures (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id),
  user_id INT NOT NULL REFERENCES users(id),
  closure_date DATE NOT NULL,
  exchange_rate NUMERIC(14,4) NOT NULL,
  total_sales_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  expected_by_method JSONB NOT NULL DEFAULT '{}',
  counted_by_method JSONB NOT NULL DEFAULT '{}',
  difference_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, closure_date)
);

-- ============ ÍNDICES ============
CREATE INDEX idx_products_store ON products (store_id) WHERE is_active;
CREATE UNIQUE INDEX uq_products_store_sku ON products (store_id, sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_customers_fullname_trgm ON customers USING gin ((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX idx_sales_store_date ON sales (store_id, created_at DESC);
CREATE INDEX idx_sales_customer ON sales (customer_id);
CREATE INDEX idx_sale_items_sale ON sale_items (sale_id);
CREATE INDEX idx_sale_items_product ON sale_items (product_id);
CREATE INDEX idx_payments_store_date ON payments (store_id, created_at DESC);
CREATE INDEX idx_payments_sale ON payments (sale_id);
CREATE INDEX idx_movements_product ON stock_movements (product_id, created_at DESC);
CREATE INDEX idx_exchange_rates_date ON exchange_rates (fetched_at DESC);
