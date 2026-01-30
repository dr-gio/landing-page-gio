-- Tabla para almacenar el contenido del sitio
CREATE TABLE IF NOT EXISTS site_content (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar usuarios administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad: Todos pueden leer, solo autenticados pueden escribir
CREATE POLICY "Allow public read access" ON site_content FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write access" ON site_content FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write access" ON admin_users FOR ALL USING (true);
