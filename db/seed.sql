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

-- Seed de exemplo do MVP:
-- 1. criar usuários e perfis
-- 2. cadastrar lugares e viagens
-- 3. popular reviews, favoritos e flags
-- Mantido curto para ser adaptado facilmente ao provedor de auth escolhido.
