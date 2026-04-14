insert into place_categories (slug, name, icon)
values
  ('restaurante', 'Restaurante', 'utensils'),
  ('pousada', 'Pousada / Hospedagem', 'bed'),
  ('posto', 'Posto de Combustível', 'fuel'),
  ('oficina', 'Oficina', 'wrench'),
  ('parada-panoramica', 'Parada Panorâmica', 'mountain'),
  ('ponto-turistico', 'Ponto Turístico', 'camera'),
  ('alerta', 'Alerta / Trecho de Atenção', 'triangle-alert')
on conflict (slug) do nothing;

-- Em Supabase, auth.users e profiles nascem pelo fluxo de Auth.
-- Use este seed primeiro para categorias fixas e depois popule:
-- 1. places
-- 2. trips
-- 3. trip_stops
-- 4. trip_photos
-- 5. reviews / favorites quando o app já estiver usando banco.
