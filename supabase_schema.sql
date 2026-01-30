-- Tabla para almacenar el contenido del sitio
CREATE TABLE IF NOT EXISTS site_content (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos iniciales (valores por defecto)
INSERT INTO site_content (key, value) VALUES
('links', '[
  {"id": 1, "title": "Sitio Web Oficial", "url": "https://www.drgiovannifuentes.com", "icon": "Globe", "type": "primary"},
  {"id": 2, "title": "Instagram", "url": "https://instagram.com/drgiovannifuentes", "icon": "Instagram", "type": "social"},
  {"id": 3, "title": "TikTok", "url": "https://tiktok.com/@drgiovannifuentes", "icon": "MessageCircle", "type": "social"},
  {"id": 4, "title": "Agendar Cita / Valoración", "url": "#", "icon": "MessageCircle", "type": "action"}
]'::jsonb),
('videos', '{"presentation": {"title": "Presentación", "url": "https://www.youtube.com/embed/dQw4w9WgXcQ"}, "history": {"title": "Nuestra Historia", "url": "https://www.youtube.com/embed/dQw4w9WgXcQ"}}'::jsonb),
('profile', '{"name": "Dr. Giovanni Fuentes", "title": "Cirujano Plástico | 440 Clinic", "hashtag": "#LaBelleza440", "image": "/dr_gio_profile.png"}'::jsonb),
('footer', '{"text": "440 Clinic. Todos los derechos reservados."}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas anteriores para evitar conflictos si se vuelve a correr el script
DROP POLICY IF EXISTS "Allow public read access" ON site_content;
DROP POLICY IF EXISTS "Allow public write access" ON site_content;
DROP POLICY IF EXISTS "Allow authenticated update" ON site_content;
DROP POLICY IF EXISTS "Allow authenticated insert" ON site_content;

-- Políticas de seguridad CORRECTAS:
-- 1. Cualquiera puede LEER (SELECT)
CREATE POLICY "Allow public read access" ON site_content FOR SELECT USING (true);

-- 2. Solo usuarios AUTENTICADOS (Logueados en Supabase) pueden INSERTAR, ACTUALIZAR o BORRAR
CREATE POLICY "Allow authenticated insert" ON site_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON site_content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON site_content FOR DELETE USING (auth.role() = 'authenticated');

