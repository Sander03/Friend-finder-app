alter table public.groups alter column center_lat drop not null;
alter table public.groups alter column center_lng drop not null;

create or replace function public.join_group(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  g groups;
begin
  if auth.uid() is null then
    raise exception 'Niet aangemeld';
  end if;
  select * into g from groups where join_code = upper(trim(p_code));
  if g.id is null then
    raise exception 'Geen groep gevonden met deze code';
  end if;
  if g.ends_at <= now() then
    raise exception 'Deze groep is verlopen';
  end if;
  if (select count(*) from group_members where group_id = g.id) >= 20 then
    raise exception 'Deze groep is vol (max. 20)';
  end if;

  insert into group_members (group_id, user_id, display_name, color)
  select g.id, auth.uid(), p.display_name, next_member_color(g.id)
  from profiles p where p.id = auth.uid()
  on conflict (group_id, user_id) do update set joined_at = now();

  return g.id;
end;
$$;

create or replace function public.create_group(p_name text, p_place text default '')
returns uuid language plpgsql security definer set search_path = public as $$
declare
  gid uuid;
  code text;
begin
  if auth.uid() is null then
    raise exception 'Niet aangemeld';
  end if;
  if char_length(trim(coalesce(p_name, ''))) not between 1 and 40 then
    raise exception 'Geef je groep een naam (max. 40 tekens)';
  end if;

  loop
    select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
      into code from generate_series(1, 6);
    exit when not exists (select 1 from groups where join_code = code);
  end loop;

  insert into groups (name, event_name, join_code, ends_at)
  values (trim(p_name), left(trim(coalesce(p_place, '')), 40), code, now() + interval '24 hours')
  returning id into gid;

  insert into group_members (group_id, user_id, display_name, color)
  select gid, auth.uid(), p.display_name, next_member_color(gid)
  from profiles p where p.id = auth.uid();

  return gid;
end;
$$;
