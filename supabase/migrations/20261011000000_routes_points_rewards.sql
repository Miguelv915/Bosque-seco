-- EcoRumbo · datos que la app móvil necesita del portal (ver DATOS-PORTAL-WEB.md)
--   · espacio: señal de celular y acceso ("Antes de ir")
--   · prestadores: transporte, tarifa referencial y WhatsApp en cualquier tipo
--   · rutas y puntos (código = texto del QR del cartel)
--   · productos para canjear puntos
--   · una cuenta de la app (rol guide) por asociación
-- El teléfono del líder sigue sin existir en la base pública.

-- ============================================================
-- 1. Espacio: ficha "Antes de ir"
-- ============================================================
alter table public.spaces
  add column signal_es text,
  add column signal_en text,
  add column access_es text,
  add column access_en text;

-- ============================================================
-- 2. Prestadores
-- ============================================================
alter type public.provider_kind add value if not exists 'transport';

alter table public.providers
  add column rate_text_es text,   -- "Desde S/ 50 por grupo"
  add column rate_text_en text;

-- El contacto por WhatsApp es de cada servicio (guía, comida, hospedaje,
-- transporte); lo que nunca se publica es el teléfono del líder.
alter table public.providers drop constraint providers_whatsapp_guides_only;
alter table public.providers add constraint providers_whatsapp_format check (
  whatsapp is null
  or whatsapp ~ '^(9[0-9]{8}|\+[1-9][0-9]{7,14})$'  -- celular peruano o internacional con +
);

-- ============================================================
-- 3. Cuenta de la app: una por asociación, compartida por sus guías
-- ============================================================
create unique index one_app_account_per_association
  on public.profiles (association_id) where role = 'guide';

-- ============================================================
-- 4. Rutas y sus puntos
-- ============================================================
create table public.routes (
  id              uuid primary key default gen_random_uuid(),
  association_id  uuid not null references public.associations (id) on delete cascade,
  space_id        uuid references public.spaces (id) on delete set null,
  name_es         text not null,
  name_en         text,
  description_es  text,
  description_en  text,
  sort_order      int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.route_points (
  id                    uuid primary key default gen_random_uuid(),
  association_id        uuid not null references public.associations (id) on delete cascade,
  route_id              uuid not null references public.routes (id) on delete cascade,
  code                  text not null,          -- va en el QR: bosqueseco:punto:<code>
  position              int not null default 0, -- orden dentro de la ruta
  name_es               text not null,
  name_en               text,
  description_es        text not null,
  description_en        text,
  photo_path            text,                   -- ruta en el bucket association-media
  meters_from_previous  int not null default 0 check (meters_from_previous >= 0),
  minutes_from_previous int not null default 0 check (minutes_from_previous >= 0),
  lat                   double precision check (lat between -90 and 90),
  lon                   double precision check (lon between -180 and 180),
  path                  jsonb,                  -- [[lat, lon], ...] trazado del camino
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  -- minúsculas, sin espacios ni tildes, empieza con letra
  constraint route_points_code_format check (code ~ '^[a-z][a-z0-9_-]*$'),
  constraint route_points_geo_pair check ((lat is null) = (lon is null)),
  constraint route_points_path_is_array check (path is null or jsonb_typeof(path) = 'array')
);

-- El código identifica el punto al escanear el QR: único en todo el sistema.
create unique index route_points_code_unique on public.route_points (code);

-- ============================================================
-- 5. Productos para canjear puntos
-- ============================================================
create table public.rewards (
  id                uuid primary key default gen_random_uuid(),
  association_id    uuid not null references public.associations (id) on delete cascade,
  name_es           text not null,
  name_en           text,
  points_required   int not null check (points_required > 0),
  discount_percent  int not null check (discount_percent between 1 and 100),
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index on public.routes (association_id);
create index on public.route_points (route_id, position);
create index on public.route_points (association_id);
create index on public.rewards (association_id);

create trigger routes_updated before update on public.routes
  for each row execute function public.set_updated_at();
create trigger route_points_updated before update on public.route_points
  for each row execute function public.set_updated_at();
create trigger rewards_updated before update on public.rewards
  for each row execute function public.set_updated_at();

-- ============================================================
-- 6. RLS: lectura pública de lo activo; escritura solo admin
-- ============================================================
alter table public.routes       enable row level security;
alter table public.route_points enable row level security;
alter table public.rewards      enable row level security;

create policy routes_read on public.routes for select
  using (is_active or public.is_admin() or association_id = public.my_association_id());
create policy routes_admin_write on public.routes for all
  using (public.is_admin()) with check (public.is_admin());

create policy route_points_read on public.route_points for select
  using (is_active or public.is_admin() or association_id = public.my_association_id());
create policy route_points_admin_write on public.route_points for all
  using (public.is_admin()) with check (public.is_admin());

create policy rewards_read on public.rewards for select
  using (is_active or public.is_admin() or association_id = public.my_association_id());
create policy rewards_admin_write on public.rewards for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 7. Solicitudes de cambio: nuevas entidades
-- ============================================================
alter table public.change_requests drop constraint change_requests_entity_check;
alter table public.change_requests add constraint change_requests_entity_check check (
  entity_type in ('association', 'space', 'subspace', 'provider', 'activity',
                  'payment_method', 'media', 'route', 'route_point', 'reward')
);

create or replace function public.approve_change_request(p_request_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  r        public.change_requests;
  tbl      text;
  allowed  text[];
  data     jsonb;
  cols     text;
  target   uuid;
  link_id  uuid;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  select * into r from public.change_requests
   where id = p_request_id and status = 'pending' for update;
  if not found then
    raise exception 'request not found or not pending';
  end if;

  if r.entity_type = 'association' and r.action <> 'update' then
    raise exception 'associations can only be updated';
  end if;

  -- Lista blanca de columnas editables por entidad (el líder nunca fija ids,
  -- association_id, is_active ni user_id).
  case r.entity_type
    when 'association' then
      tbl := 'associations';
      allowed := array['summary_es', 'summary_en', 'description_es', 'description_en',
                       'acronym', 'region', 'lat', 'lon'];
    when 'space' then
      tbl := 'spaces';
      allowed := array['name', 'acronym', 'description_es', 'description_en', 'departments',
                       'province', 'location_es', 'location_en', 'kind', 'lat', 'lon',
                       'sort_order', 'signal_es', 'signal_en', 'access_es', 'access_en'];
    when 'subspace' then
      tbl := 'subspaces';
      allowed := array['space_id', 'name', 'description_es', 'description_en',
                       'attractions_es', 'attractions_en', 'lat', 'lon', 'sort_order'];
    when 'provider' then
      tbl := 'providers';
      allowed := array['name', 'kind', 'specialty_es', 'specialty_en', 'whatsapp',
                       'rate_text_es', 'rate_text_en'];
    when 'activity' then
      tbl := 'activities';
      allowed := array['subspace_id', 'provider_id', 'name_es', 'name_en', 'description_es',
                       'description_en', 'duration_minutes', 'price', 'price_unit_es',
                       'price_unit_en', 'max_capacity', 'sort_order'];
    when 'payment_method' then
      tbl := 'payment_methods';
      allowed := array['kind', 'note_es', 'note_en'];
    when 'media' then
      tbl := 'media';
      allowed := array['space_id', 'subspace_id', 'storage_path', 'category',
                       'is_cover', 'alt_es', 'alt_en', 'sort_order'];
    when 'route' then
      tbl := 'routes';
      allowed := array['space_id', 'name_es', 'name_en', 'description_es', 'description_en',
                       'sort_order'];
    when 'route_point' then
      tbl := 'route_points';
      allowed := array['route_id', 'code', 'position', 'name_es', 'name_en', 'description_es',
                       'description_en', 'photo_path', 'meters_from_previous',
                       'minutes_from_previous', 'lat', 'lon', 'path'];
    when 'reward' then
      tbl := 'rewards';
      allowed := array['name_es', 'name_en', 'points_required', 'discount_percent'];
  end case;

  data := public._filter_payload(r.payload, allowed);

  -- Toda referencia debe pertenecer a la misma asociación de la solicitud.
  if data ? 'space_id' and not exists (
    select 1 from public.spaces
     where id = (data->>'space_id')::uuid and association_id = r.association_id) then
    raise exception 'space outside association';
  end if;
  if data ? 'subspace_id' and not exists (
    select 1 from public.subspaces
     where id = (data->>'subspace_id')::uuid and association_id = r.association_id) then
    raise exception 'subspace outside association';
  end if;
  if data ? 'provider_id' and not exists (
    select 1 from public.providers
     where id = (data->>'provider_id')::uuid and association_id = r.association_id) then
    raise exception 'provider outside association';
  end if;
  if data ? 'route_id' and not exists (
    select 1 from public.routes
     where id = (data->>'route_id')::uuid and association_id = r.association_id) then
    raise exception 'route outside association';
  end if;
  if r.entity_type = 'media' and data ? 'storage_path'
     and split_part(data->>'storage_path', '/', 1) <> r.association_id::text then
    raise exception 'storage_path outside association folder';
  end if;
  if r.entity_type = 'route_point' and data ? 'photo_path'
     and split_part(data->>'photo_path', '/', 1) <> r.association_id::text then
    raise exception 'photo_path outside association folder';
  end if;

  if r.action = 'create' then
    data := data || jsonb_build_object('association_id', r.association_id);
    select string_agg(quote_ident(k), ', ') into cols from jsonb_object_keys(data) as k;
    execute format(
      'insert into public.%I (%s) select %s from jsonb_populate_record(null::public.%I, $1) returning id',
      tbl, cols, cols, tbl)
      into target using data;

  elsif r.action = 'update' then
    select string_agg(quote_ident(k), ', ') into cols from jsonb_object_keys(data) as k;
    if cols is null and not (r.entity_type = 'provider' and r.payload ? 'subspace_ids') then
      raise exception 'empty payload';
    end if;

    if r.entity_type = 'association' then
      execute format(
        'update public.associations t set (%s) = (select %s from jsonb_populate_record(null::public.associations, $1)) where t.id = $2',
        cols, cols)
        using data, r.association_id;
    elsif cols is not null then
      execute format(
        'update public.%I t set (%s) = (select %s from jsonb_populate_record(null::public.%I, $1)) where t.id = $2 and t.association_id = $3',
        tbl, cols, cols, tbl)
        using data, r.entity_id, r.association_id;
    end if;
    target := r.entity_id;

  else -- delete
    execute format('delete from public.%I where id = $1 and association_id = $2', tbl)
      using r.entity_id, r.association_id;
  end if;

  -- Asignación de un prestador a subespacios (N:M).
  if r.entity_type = 'provider' and r.action <> 'delete' and r.payload ? 'subspace_ids' then
    delete from public.subspace_providers where provider_id = target;
    for link_id in
      select value::uuid from jsonb_array_elements_text(r.payload->'subspace_ids')
    loop
      if not exists (select 1 from public.subspaces
                      where id = link_id and association_id = r.association_id) then
        raise exception 'subspace outside association';
      end if;
      insert into public.subspace_providers (subspace_id, provider_id) values (link_id, target);
    end loop;
  end if;

  update public.change_requests
     set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
   where id = r.id;
end;
$$;
