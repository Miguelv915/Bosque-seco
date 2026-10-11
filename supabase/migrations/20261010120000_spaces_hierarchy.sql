-- Bosque Seco · jerarquía Asociación → Espacios → Subespacios (1:N:N)
-- Sustituye el modelo plano (services / routes / media colgando de la asociación).
-- Reglas clave:
--   · una asociación tiene 0..N espacios; un espacio, 0..N subespacios
--   · el WhatsApp público pertenece a los guías (providers.kind = 'guide'),
--     nunca al líder: se eliminan los teléfonos de `associations`
--   · el líder sigue proponiendo cambios vía change_requests; el admin aprueba

-- ============================================================
-- 1. Limpieza del modelo plano
-- ============================================================
drop table public.services, public.routes, public.media cascade;
drop type public.route_difficulty;

alter table public.associations
  drop column whatsapp,
  drop column contact_phone,
  add column acronym text,
  add column region text,
  add column endorsed_by text not null default 'AIDER';

-- entity_type pasa a texto con restricción (más simple que ampliar un enum)
alter table public.change_requests
  alter column entity_type type text using entity_type::text;
alter table public.change_requests
  add constraint change_requests_entity_check check (
    entity_type in ('association', 'space', 'subspace', 'provider',
                    'activity', 'payment_method', 'media')
  );
drop type public.request_entity;

-- ============================================================
-- 2. Tipos
-- ============================================================
create type public.provider_kind as enum ('guide', 'food', 'lodging');
create type public.payment_kind as enum ('cash', 'yape');
create type public.media_category as enum ('flora', 'fauna', 'landscape', 'facilities');

-- ============================================================
-- 3. Tablas (todas llevan association_id para RLS y almacenamiento)
-- ============================================================
create table public.spaces (
  id              uuid primary key default gen_random_uuid(),
  association_id  uuid not null references public.associations (id) on delete cascade,
  name            text not null,
  acronym         text,
  description_es  text,
  description_en  text,
  departments     text[] not null default '{}',   -- un espacio puede abarcar varios
  province        text,
  location_es     text,
  location_en     text,
  kind            text,
  lat             double precision,
  lon             double precision,
  sort_order      int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.subspaces (
  id              uuid primary key default gen_random_uuid(),
  association_id  uuid not null references public.associations (id) on delete cascade,
  space_id        uuid not null references public.spaces (id) on delete cascade,
  name            text not null,
  description_es  text,
  description_en  text,
  attractions_es  text[] not null default '{}',
  attractions_en  text[] not null default '{}',
  lat             double precision,
  lon             double precision,
  sort_order      int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.providers (
  id              uuid primary key default gen_random_uuid(),
  association_id  uuid not null references public.associations (id) on delete cascade,
  user_id         uuid references auth.users (id) on delete set null,  -- guía con cuenta en la app
  name            text not null,
  kind            public.provider_kind not null,
  specialty_es    text,
  specialty_en    text,
  whatsapp        text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- el WhatsApp solo se admite para guías
  constraint providers_whatsapp_guides_only check (whatsapp is null or kind = 'guide')
);

create table public.subspace_providers (
  subspace_id  uuid not null references public.subspaces (id) on delete cascade,
  provider_id  uuid not null references public.providers (id) on delete cascade,
  primary key (subspace_id, provider_id)
);

create table public.activities (
  id               uuid primary key default gen_random_uuid(),
  association_id   uuid not null references public.associations (id) on delete cascade,
  subspace_id      uuid references public.subspaces (id) on delete cascade,  -- null: oferta general
  provider_id      uuid references public.providers (id) on delete set null,
  name_es          text not null,
  name_en          text,
  description_es   text,
  description_en   text,
  duration_minutes int,
  price            numeric(10, 2),
  currency         text not null default 'PEN',
  price_unit_es    text,
  price_unit_en    text,
  max_capacity     int,
  sort_order       int not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.payment_methods (
  id              uuid primary key default gen_random_uuid(),
  association_id  uuid not null references public.associations (id) on delete cascade,
  kind            public.payment_kind not null,
  note_es         text,
  note_en         text,
  is_active       boolean not null default true
);

create table public.media (
  id              uuid primary key default gen_random_uuid(),
  association_id  uuid not null references public.associations (id) on delete cascade,
  space_id        uuid references public.spaces (id) on delete cascade,
  subspace_id     uuid references public.subspaces (id) on delete cascade,
  storage_path    text not null,          -- ruta en el bucket association-media
  category        public.media_category not null default 'landscape',
  is_cover        boolean not null default false,
  alt_es          text,
  alt_en          text,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  -- pertenece a un espacio o a un subespacio, no a ambos
  constraint media_one_parent check (num_nonnulls(space_id, subspace_id) = 1)
);

create table public.manuals (
  id          uuid primary key default gen_random_uuid(),
  title_es    text not null,
  title_en    text,
  file_path   text not null,              -- ruta en el bucket privado manuals
  module      int,
  created_at  timestamptz not null default now()
);

create index on public.spaces (association_id);
create index on public.subspaces (association_id);
create index on public.subspaces (space_id);
create index on public.providers (association_id);
create index on public.activities (association_id);
create index on public.activities (subspace_id);
create index on public.payment_methods (association_id);
create index on public.media (association_id);
create index on public.media (space_id);
create index on public.media (subspace_id);

create trigger spaces_updated before update on public.spaces
  for each row execute function public.set_updated_at();
create trigger subspaces_updated before update on public.subspaces
  for each row execute function public.set_updated_at();
create trigger providers_updated before update on public.providers
  for each row execute function public.set_updated_at();
create trigger activities_updated before update on public.activities
  for each row execute function public.set_updated_at();

-- ============================================================
-- 4. RLS: lectura pública de lo activo; escritura solo admin
--    (los líderes cambian contenido únicamente vía change_requests)
-- ============================================================
alter table public.spaces             enable row level security;
alter table public.subspaces          enable row level security;
alter table public.providers          enable row level security;
alter table public.subspace_providers enable row level security;
alter table public.activities         enable row level security;
alter table public.payment_methods    enable row level security;
alter table public.media              enable row level security;
alter table public.manuals            enable row level security;

create policy spaces_read on public.spaces for select
  using (is_active or public.is_admin() or association_id = public.my_association_id());
create policy spaces_admin_write on public.spaces for all
  using (public.is_admin()) with check (public.is_admin());

create policy subspaces_read on public.subspaces for select
  using (is_active or public.is_admin() or association_id = public.my_association_id());
create policy subspaces_admin_write on public.subspaces for all
  using (public.is_admin()) with check (public.is_admin());

create policy providers_read on public.providers for select
  using (is_active or public.is_admin() or association_id = public.my_association_id());
create policy providers_admin_write on public.providers for all
  using (public.is_admin()) with check (public.is_admin());

create policy subspace_providers_read on public.subspace_providers for select using (true);
create policy subspace_providers_admin_write on public.subspace_providers for all
  using (public.is_admin()) with check (public.is_admin());

create policy activities_read on public.activities for select
  using (is_active or public.is_admin() or association_id = public.my_association_id());
create policy activities_admin_write on public.activities for all
  using (public.is_admin()) with check (public.is_admin());

create policy payment_methods_read on public.payment_methods for select
  using (is_active or public.is_admin() or association_id = public.my_association_id());
create policy payment_methods_admin_write on public.payment_methods for all
  using (public.is_admin()) with check (public.is_admin());

create policy media_read on public.media for select using (true);
create policy media_admin_write on public.media for all
  using (public.is_admin()) with check (public.is_admin());

-- Manuales: solo usuarios autenticados (líderes y admin) leen; los sube el admin.
create policy manuals_read on public.manuals for select to authenticated using (true);
create policy manuals_admin_write on public.manuals for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 5. Aprobación genérica de solicitudes
-- ============================================================
create function public._filter_payload(p jsonb, allowed text[]) returns jsonb
language sql immutable as $$
  select coalesce(jsonb_object_agg(e.key, e.value), '{}'::jsonb)
    from jsonb_each(p) as e where e.key = any (allowed);
$$;

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
                       'province', 'location_es', 'location_en', 'kind', 'lat', 'lon', 'sort_order'];
    when 'subspace' then
      tbl := 'subspaces';
      allowed := array['space_id', 'name', 'description_es', 'description_en',
                       'attractions_es', 'attractions_en', 'lat', 'lon', 'sort_order'];
    when 'provider' then
      tbl := 'providers';
      allowed := array['name', 'kind', 'specialty_es', 'specialty_en', 'whatsapp'];
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
  if r.entity_type = 'media' and data ? 'storage_path'
     and split_part(data->>'storage_path', '/', 1) <> r.association_id::text then
    raise exception 'storage_path outside association folder';
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

-- ============================================================
-- 6. Storage: bucket privado de manuales (los sube el admin)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('manuals', 'manuals', false, 20971520, array['application/pdf'])
on conflict (id) do nothing;

create policy "manuals_read_authenticated" on storage.objects for select to authenticated
  using (bucket_id = 'manuals');
create policy "manuals_admin_all" on storage.objects for all to authenticated
  using (bucket_id = 'manuals' and public.is_admin())
  with check (bucket_id = 'manuals' and public.is_admin());
