CREATE TABLE IF NOT EXISTS properties (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  operation TEXT NOT NULL CHECK (operation IN ('renta', 'venta')),
  property_type TEXT NOT NULL,
  location TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL,
  href TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_alt TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS properties_operation_idx ON properties (operation);
CREATE INDEX IF NOT EXISTS properties_published_sort_idx ON properties (is_published, sort_order, id);

INSERT INTO properties (
  slug,
  operation,
  property_type,
  location,
  title,
  summary,
  price,
  href,
  image_url,
  image_alt,
  sort_order
) VALUES
  (
    'renta-casa-hacienda-del-comendador',
    'renta',
    'Casa',
    'Hacienda del Comendador, Antigua Guatemala',
    'Casa en renta',
    'Casa amueblada de dos niveles dentro de condominio residencial con amenidades.',
    'US$1,450 / mes',
    'ficha_renta_casa_hacienda_del_comendador.html',
    'https://drive.google.com/thumbnail?id=1BjZQJqH1BuZ0klgmNuCTKSybDMMoQ1eJ&sz=w1600',
    'Casa en renta en Hacienda del Comendador',
    10
  ),
  (
    'renta-casa-los-franciscanos',
    'renta',
    'Casa',
    'Los Franciscanos Club Residencial',
    'Casa en renta',
    'Casa en residencial con seguridad, áreas verdes y amenidades familiares.',
    'USD 1,700 / mes',
    'ficha_renta_casa_los_franciscanos.html',
    'https://drive.google.com/thumbnail?id=11pbGbM57FiI2Oz3zlyMx9HKaHlm0-CoZ&sz=w1600',
    'Casa en renta en Los Franciscanos Club Residencial',
    20
  ),
  (
    'renta-cabana-las-macadamias',
    'renta',
    'Cabaña',
    'San Miguel Dueñas, Las Macadamias',
    'Cabaña en renta',
    'Cabaña de lujo en entorno natural, con pérgola, jacuzzi y espacios funcionales.',
    'USD 1,700 / mes',
    'ficha_renta_cabana_las_macadamias.html',
    'https://drive.google.com/thumbnail?id=12SDMjS7T66CqOo2rdw3PxSIj6scZFTf1&sz=w1600',
    'Cabaña en renta en Las Macadamias',
    30
  ),
  (
    'venta-cabana-las-macadamias',
    'venta',
    'Cabaña',
    'San Miguel Dueñas, Las Macadamias',
    'Cabaña en venta',
    'Cabaña de lujo con 550.30 m² de terreno y 210 m² de construcción.',
    'USD 395,000',
    'ficha_venta_cabana_las_macadamias.html',
    'https://drive.google.com/thumbnail?id=12SDMjS7T66CqOo2rdw3PxSIj6scZFTf1&sz=w1600',
    'Cabaña en venta en Las Macadamias',
    40
  ),
  (
    'venta-casa-antigua-guatemala-sanfrancisco',
    'venta',
    'Casa',
    'Casco de Antigua Guatemala',
    'Casa en venta',
    'Casa ubicada en el casco de Antigua Guatemala, cerca de San Francisco El Grande.',
    'Q3,700,000',
    'ficha_venta_casa_antigua_guatemala_sanfrancisco.html',
    'https://drive.google.com/thumbnail?id=12y2unavM4KN9XZ6lQeJhJQ_5kPfqbeLM&sz=w1600',
    'Casa en venta en La Antigua Guatemala',
    50
  )
ON CONFLICT (slug) DO NOTHING;
