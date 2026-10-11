-- EcoRumbo · publicación directa del líder
-- El líder puede publicar sus propios cambios sin esperar al administrador.
-- Cada cambio sigue pasando por change_requests (queda el registro de quién
-- cambió qué y cuándo) y por la misma lista blanca de columnas y comprobaciones
-- de pertenencia a la asociación; solo cambia quién puede ejecutar la
-- aprobación: el administrador, o el líder sobre solicitudes suyas.

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
  select * into r from public.change_requests
   where id = p_request_id and status = 'pending' for update;
  if not found then
    raise exception 'request not found or not pending';
  end if;

  -- Publica el administrador, o el líder una solicitud suya de su asociación.
  if not (
    public.is_admin()
    or (r.association_id = public.my_association_id() and r.created_by = auth.uid())
  ) then
    raise exception 'forbidden';
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
                       'acronym', 'region', 'lat', 'lon', 'contact_whatsapp'];
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
