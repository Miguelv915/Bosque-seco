-- Bosque Seco · esquema inicial
-- Modelo: portal consolidado de asociaciones. Cada asociación tiene UN líder
-- y varios guías (app móvil). Los líderes NO escriben contenido publicado:
-- envían solicitudes de cambio que el admin aprueba o rechaza.

-- ============================================================
-- Tipos
-- ============================================================
create type public.app_role as enum ('admin', 'leader', 'guide');
create type public.request_status as enum ('pending', 'approved', 'rejected');
create type public.request_action as enum ('create', 'update', 'delete');
create type public.request_entity as enum ('association', 'service', 'route', 'media');
create type public.route_difficulty as enum ('easy', 'moderate', 'hard');

-- ============================================================
-- Tablas
-- ============================================================
create table public.associations (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  summary_es      text,
  summary_en      text,
  description_es  text,
  description_en  text,
  lat             double precision,
  lon             double precision,
  contact_phone   text,
  whatsapp        text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  full_name       text,
  role            public.app_role not null,
  association_id  uuid references public.associations (id) on delete restrict,
  created_at      timestamptz not null default now(),
  -- admin no pertenece a una asociación; líder y guía sí.
  constraint profiles_association_check check (
    (role = 'admin' and association_id is null)
    or (role in ('leader', 'guide') and association_id is not null)
  )
);

-- Un solo líder por asociación.
create unique index one_leader_per_association
  on public.profiles (association_id) where role = 'leader';

create table public.services (
  id              uuid primary key default gen_random_uuid(),
  association_id  uuid not null references public.associations (id) on delete cascade,
  name_es         text not null,
  name_en         text,
  description_es  text,
  description_en  text,
  price           numeric(10, 2),
  currency        text not null default 'PEN',
  sort_order      int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.routes (
  id               uuid primary key default gen_random_uuid(),
  association_id   uuid not null references public.associations (id) on delete cascade,
  name_es          text not null,
  name_en          text,
  description_es   text,
  description_en   text,
  difficulty       public.route_difficulty not null default 'moderate',
  duration_minutes int,
  distance_km      numeric(6, 2),
  sort_order       int not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.media (
  id              uuid primary key default gen_random_uuid(),
  association_id  uuid not null references public.associations (id) on delete cascade,
  storage_path    text not null,           -- ruta dentro del bucket association-media
  is_cover        boolean not null default false,
  alt_es          text,
  alt_en          text,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);

create table public.change_requests (
  id              uuid primary key default gen_random_uuid(),
  association_id  uuid not null references public.associations (id) on delete cascade,
  entity_type     public.request_entity not null,
  entity_id       uuid,                    -- null en 'create' y en 'association'
  action          public.request_action not null,
  payload         jsonb not null default '{}'::jsonb,
  status          public.request_status not null default 'pending',
  review_note     text,
  created_by      uuid not null references auth.users (id),
  reviewed_by     uuid references auth.users (id),
  created_at      timestamptz not null default now(),
  reviewed_at     timestamptz
);

create index on public.services (association_id);
create index on public.routes (association_id);
create index on public.media (association_id);
create index on public.change_requests (association_id, status);

-- ============================================================
-- updated_at automático
-- ============================================================
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger associations_updated before update on public.associations
  for each row execute function public.set_updated_at();
create trigger services_updated before update on public.services
  for each row execute function public.set_updated_at();
create trigger routes_updated before update on public.routes
  for each row execute function public.set_updated_at();

-- ============================================================
-- Funciones auxiliares (security definer evita recursión en RLS)
-- ============================================================
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create function public.my_association_id() returns uuid
language sql stable security definer set search_path = public as $$
  select association_id from public.profiles where id = auth.uid();
$$;

create function public.is_leader() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'leader');
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.associations    enable row level security;
alter table public.profiles        enable row level security;
alter table public.services        enable row level security;
alter table public.routes          enable row level security;
alter table public.media           enable row level security;
alter table public.change_requests enable row level security;

-- associations: lectura pública de activas; escritura solo admin.
create policy associations_read on public.associations for select
  using (is_active or public.is_admin() or id = public.my_association_id());
create policy associations_admin_write on public.associations for all
  using (public.is_admin()) with check (public.is_admin());

-- profiles: cada quien ve el suyo, admin ve y gestiona todos.
create policy profiles_read_own on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy profiles_admin_write on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- services / routes / media: lectura pública de lo activo; escritura solo admin
-- (los líderes cambian contenido únicamente vía change_requests aprobadas).
create policy services_read on public.services for select
  using (is_active or public.is_admin() or association_id = public.my_association_id());
create policy services_admin_write on public.services for all
  using (public.is_admin()) with check (public.is_admin());

create policy routes_read on public.routes for select
  using (is_active or public.is_admin() or association_id = public.my_association_id());
create policy routes_admin_write on public.routes for all
  using (public.is_admin()) with check (public.is_admin());

create policy media_read on public.media for select using (true);
create policy media_admin_write on public.media for all
  using (public.is_admin()) with check (public.is_admin());

-- change_requests: el líder crea y ve las de SU asociación; admin ve todas.
-- La aprobación/rechazo solo ocurre por las funciones de abajo.
create policy requests_leader_insert on public.change_requests for insert
  with check (
    public.is_leader()
    and association_id = public.my_association_id()
    and created_by = auth.uid()
    and status = 'pending'
  );
create policy requests_read on public.change_requests for select
  using (public.is_admin() or association_id = public.my_association_id());

-- ============================================================
-- Aprobación / rechazo (solo admin)
-- ============================================================
create function public.approve_change_request(p_request_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  r public.change_requests;
  p jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  select * into r from public.change_requests
   where id = p_request_id and status = 'pending' for update;
  if not found then
    raise exception 'request not found or not pending';
  end if;
  p := r.payload;

  if r.entity_type = 'association' then
    update public.associations set
      summary_es     = coalesce(p->>'summary_es', summary_es),
      summary_en     = coalesce(p->>'summary_en', summary_en),
      description_es = coalesce(p->>'description_es', description_es),
      description_en = coalesce(p->>'description_en', description_en),
      contact_phone  = coalesce(p->>'contact_phone', contact_phone),
      whatsapp       = coalesce(p->>'whatsapp', whatsapp),
      lat            = coalesce((p->>'lat')::double precision, lat),
      lon            = coalesce((p->>'lon')::double precision, lon)
    where id = r.association_id;

  elsif r.entity_type = 'service' then
    if r.action = 'create' then
      insert into public.services (association_id, name_es, name_en, description_es,
                                   description_en, price, sort_order)
      values (r.association_id, p->>'name_es', p->>'name_en', p->>'description_es',
              p->>'description_en', (p->>'price')::numeric, coalesce((p->>'sort_order')::int, 0));
    elsif r.action = 'update' then
      update public.services set
        name_es        = coalesce(p->>'name_es', name_es),
        name_en        = coalesce(p->>'name_en', name_en),
        description_es = coalesce(p->>'description_es', description_es),
        description_en = coalesce(p->>'description_en', description_en),
        price          = coalesce((p->>'price')::numeric, price),
        sort_order     = coalesce((p->>'sort_order')::int, sort_order)
      where id = r.entity_id and association_id = r.association_id;
    else
      delete from public.services
       where id = r.entity_id and association_id = r.association_id;
    end if;

  elsif r.entity_type = 'route' then
    if r.action = 'create' then
      insert into public.routes (association_id, name_es, name_en, description_es,
                                 description_en, difficulty, duration_minutes, distance_km)
      values (r.association_id, p->>'name_es', p->>'name_en', p->>'description_es',
              p->>'description_en', coalesce((p->>'difficulty')::public.route_difficulty, 'moderate'),
              (p->>'duration_minutes')::int, (p->>'distance_km')::numeric);
    elsif r.action = 'update' then
      update public.routes set
        name_es          = coalesce(p->>'name_es', name_es),
        name_en          = coalesce(p->>'name_en', name_en),
        description_es   = coalesce(p->>'description_es', description_es),
        description_en   = coalesce(p->>'description_en', description_en),
        difficulty       = coalesce((p->>'difficulty')::public.route_difficulty, difficulty),
        duration_minutes = coalesce((p->>'duration_minutes')::int, duration_minutes),
        distance_km      = coalesce((p->>'distance_km')::numeric, distance_km)
      where id = r.entity_id and association_id = r.association_id;
    else
      delete from public.routes
       where id = r.entity_id and association_id = r.association_id;
    end if;

  elsif r.entity_type = 'media' then
    if r.action = 'create' then
      -- el archivo debe estar en la carpeta de la propia asociación
      if split_part(p->>'storage_path', '/', 1) <> r.association_id::text then
        raise exception 'storage_path outside association folder';
      end if;
      insert into public.media (association_id, storage_path, is_cover, alt_es, alt_en, sort_order)
      values (r.association_id, p->>'storage_path', coalesce((p->>'is_cover')::boolean, false),
              p->>'alt_es', p->>'alt_en', coalesce((p->>'sort_order')::int, 0));
    elsif r.action = 'update' then
      update public.media set
        alt_es     = coalesce(p->>'alt_es', alt_es),
        alt_en     = coalesce(p->>'alt_en', alt_en),
        is_cover   = coalesce((p->>'is_cover')::boolean, is_cover),
        sort_order = coalesce((p->>'sort_order')::int, sort_order)
      where id = r.entity_id and association_id = r.association_id;
    else
      delete from public.media
       where id = r.entity_id and association_id = r.association_id;
    end if;
  end if;

  update public.change_requests
     set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
   where id = r.id;
end;
$$;

create function public.reject_change_request(p_request_id uuid, p_note text default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  update public.change_requests
     set status = 'rejected', review_note = p_note,
         reviewed_by = auth.uid(), reviewed_at = now()
   where id = p_request_id and status = 'pending';

  if not found then
    raise exception 'request not found or not pending';
  end if;
end;
$$;

revoke all on function public.approve_change_request(uuid) from public, anon;
revoke all on function public.reject_change_request(uuid, text) from public, anon;
grant execute on function public.approve_change_request(uuid) to authenticated;
grant execute on function public.reject_change_request(uuid, text) to authenticated;

-- ============================================================
-- Storage: bucket público de lectura; el líder sube solo a su carpeta
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('association-media', 'association-media', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "media_leader_upload" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'association-media'
    and public.is_leader()
    and (storage.foldername(name))[1] = public.my_association_id()::text
  );

create policy "media_admin_all" on storage.objects for all to authenticated
  using (bucket_id = 'association-media' and public.is_admin())
  with check (bucket_id = 'association-media' and public.is_admin());
