-- Datos de ejemplo para desarrollo. Ejecutar después de las migraciones.
-- Idempotente: se puede ejecutar más de una vez.

insert into public.associations (slug, name, summary_es, summary_en, lat, lon)
values
  ('el-angolo', 'Coto de Caza El Angolo',
   'El corazón del bosque seco: colinas de algarrobos, hualtacos y palo santo.',
   'The heart of the dry forest: hills of carob, hualtaco and palo santo trees.',
   -4.35, -80.85),
  ('lancones', 'Bosques de Lancones',
   'Caseríos en medio del algarrobal donde se produce miel y algarrobina.',
   'Hamlets in the carob grove where honey and algarrobina syrup are made.',
   -4.58, -80.55)
on conflict (slug) do nothing;

-- Caso de referencia: ATEC Amotape (espacio con dos subespacios + espacio de prueba).
do $$
declare
  a        uuid;
  sp       uuid;
  rica     uuid;
  caucho   uuid;
  p_food   uuid;
  p_lodge  uuid;
  p_guide  uuid;
  p_guide2 uuid;
begin
  if exists (select 1 from public.associations where slug = 'atec-amotape') then
    return;
  end if;

  insert into public.associations
    (slug, name, acronym, region, endorsed_by, summary_es, summary_en)
  values
    ('atec-amotape',
     'Asociación de Turismo Ecológico Comunitario Amotape Sostenible', 'ATEC Amotape',
     'Tumbes · Piura', 'AIDER',
     'Turismo comunitario en el Parque Nacional Cerros de Amotape.',
     'Community tourism in Cerros de Amotape National Park.')
  returning id into a;

  insert into public.spaces
    (association_id, name, acronym, departments, kind, location_es, location_en,
     description_es, description_en, lat, lon)
  values
    (a, 'Parque Nacional Cerros de Amotape', 'PNCA', array['Tumbes', 'Piura'],
     'Parque nacional', 'Zona de amortiguamiento', 'Buffer zone',
     'Bosque seco y bosque tropical del Pacífico en un mismo recorrido.',
     'Dry forest and Pacific tropical forest along a single route.', -3.95, -80.55)
  returning id into sp;

  insert into public.spaces (association_id, name, departments, sort_order)
  values (a, 'Segundo espacio de prueba', array['Tumbes'], 1);

  insert into public.subspaces
    (association_id, space_id, name, attractions_es, attractions_en, description_es, description_en)
  values
    (a, sp, 'Sector Rica Playa',
     array['Puerta principal de ingreso', 'Quebrada de Ucumares', 'Bocana Carrillo'],
     array['Main entrance', 'Ucumares ravine', 'Bocana Carrillo'],
     'Puerta principal de ingreso al parque.', 'Main entrance to the park.')
  returning id into rica;

  insert into public.subspaces
    (association_id, space_id, name, attractions_es, attractions_en, description_es, description_en)
  values
    (a, sp, 'Sector El Caucho',
     array['Bosque Tropical del Pacífico', 'Quebrada Faical', 'Poza del Pato'],
     array['Pacific tropical forest', 'Faical ravine', 'Poza del Pato'],
     'Bosque tropical del Pacífico y quebradas.', 'Pacific tropical forest and ravines.')
  returning id into caucho;

  insert into public.providers (association_id, name, kind, specialty_es, specialty_en)
  values (a, 'Isabel Mendoza', 'food', 'Chivo y seco de cabrito', 'Goat and seco de cabrito')
  returning id into p_food;

  insert into public.providers (association_id, name, kind, specialty_es, specialty_en)
  values (a, 'Mauricio Zapata', 'lodging', 'Albergue y campamento en Rica Playa',
          'Lodge and campsite in Rica Playa')
  returning id into p_lodge;

  insert into public.providers (association_id, name, kind, specialty_es, specialty_en, whatsapp)
  values (a, 'Felipe Torres', 'guide', 'Aves y trekking', 'Birdwatching and trekking', '+51900000001')
  returning id into p_guide;

  insert into public.providers (association_id, name, kind, specialty_es, specialty_en, whatsapp)
  values (a, 'Guía de prueba', 'guide', 'Trekking', 'Trekking', '+51900000002')
  returning id into p_guide2;

  insert into public.subspace_providers (subspace_id, provider_id) values
    (rica, p_lodge), (caucho, p_guide), (caucho, p_guide2), (caucho, p_food);

  insert into public.activities
    (association_id, subspace_id, provider_id, name_es, name_en, duration_minutes,
     price, price_unit_es, price_unit_en, max_capacity)
  values
    (a, caucho, p_guide, 'Trekking guiado Quebrada Faical', 'Guided trekking Faical ravine',
     240, 80, 'por grupo', 'per group', 6),
    (a, caucho, p_guide, 'Avistamiento de aves', 'Birdwatching',
     null, 100, 'por jornada matutina', 'per morning session', null),
    (a, null, p_food, 'Plato típico', 'Local dish', null, 25, 'por porción', 'per serving', null);

  insert into public.payment_methods (association_id, kind, note_es, note_en) values
    (a, 'cash', null, null),
    (a, 'yape', 'Señal limitada: pagar al retornar al pueblo.',
                'Limited signal: pay when you return to town.');
end $$;

-- Cuentas: crear los usuarios en Supabase Auth (Dashboard → Authentication) y luego
--   insert into public.profiles (id, full_name, role, association_id)
--   values ('<uuid-admin>', 'Admin', 'admin', null),
--          ('<uuid-lider>', 'Líder', 'leader',
--           (select id from public.associations where slug = 'atec-amotape'));
