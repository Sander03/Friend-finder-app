create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  event_name text not null default '',
  join_code text not null unique,
  center_lat double precision,
  center_lng double precision,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  name text not null,
  lat double precision not null,
  lng double precision not null
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  display_name text not null,
  color text not null,
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table public.locations (
  member_id uuid primary key references public.group_members (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  accuracy real,
  note text not null default '' check (char_length(note) <= 120),
  updated_at timestamptz not null default now(),
  demo_age interval
);

create or replace function public.is_member(gid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members where group_id = gid and user_id = auth.uid());
$$;

create or replace function public.owns_member(mid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from group_members where id = mid and user_id = auth.uid());
$$;

create or replace function public.group_is_live(gid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from groups where id = gid and ends_at > now());
$$;

create or replace function public.next_member_color(gid uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(
    (select c from unnest(array['#FF6B4A','#5AB8FF','#B48CFF','#FFC24A','#4ADE9B','#FF7AC6','#7FE3F0','#F2F3F5'])
       with ordinality as p(c, i)
     where c not in (select color from group_members where group_id = gid)
     order by i limit 1),
    '#F2F3F5');
$$;

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

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  name text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1));
  demo uuid;
begin
  insert into profiles (id, display_name) values (new.id, left(name, 30));
  select id into demo from groups where join_code = 'BENDE1';
  if demo is not null then
    insert into group_members (group_id, user_id, display_name, color)
    values (demo, new.id, left(name, 30), next_member_color(demo));
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.places enable row level security;
alter table public.group_members enable row level security;
alter table public.locations enable row level security;

create policy "profiles: eigen profiel lezen" on public.profiles for select using (id = auth.uid());
create policy "profiles: eigen profiel wijzigen" on public.profiles for update using (id = auth.uid());

create policy "groups: leden lezen" on public.groups for select using (public.is_member(id));
create policy "places: leden lezen" on public.places for select using (public.is_member(group_id));

create policy "members: leden lezen" on public.group_members for select using (public.is_member(group_id));
create policy "members: groep verlaten" on public.group_members for delete using (user_id = auth.uid());

create policy "locations: leden lezen" on public.locations for select using (
  public.is_member(group_id) and public.group_is_live(group_id)
);
create policy "locations: eigen locatie toevoegen" on public.locations for insert with check (
  public.owns_member(member_id) and public.is_member(group_id) and public.group_is_live(group_id)
);
create policy "locations: eigen locatie wijzigen" on public.locations for update
  using (public.owns_member(member_id))
  with check (public.owns_member(member_id) and public.group_is_live(group_id));
create policy "locations: eigen locatie wissen" on public.locations for delete using (public.owns_member(member_id));

create view public.group_locations with (security_invoker = on) as
  select member_id, group_id, lat, lng, accuracy, note,
         coalesce(now() - demo_age, updated_at) as updated_at
  from public.locations;

alter publication supabase_realtime add table public.locations, public.group_members;

with g as (
  insert into public.groups (name, event_name, join_code, center_lat, center_lng, ends_at)
  values ('De Bende', 'Zomerfestival (demo)', 'BENDE1', 50.97060, 4.69200, now() + interval '1 year')
  returning id
),
p as (
  insert into public.places (group_id, name, lat, lng)
  select g.id, v.name, v.lat, v.lng from g, (values
    ('Main Stage', 50.97095, 4.69165),
    ('The Barn', 50.97140, 4.69265),
    ('Food court', 50.97010, 4.69270),
    ('Ingang', 50.96955, 4.69140)
  ) as v(name, lat, lng)
  returning 1
),
m as (
  insert into public.group_members (group_id, display_name, color)
  select g.id, v.name, v.color from g, (values
    ('Lotte', '#FF6B4A'), ('Jonas', '#5AB8FF'), ('Amira', '#B48CFF'), ('Wout', '#FFC24A')
  ) as v(name, color)
  returning id, group_id, display_name
)
insert into public.locations (member_id, group_id, lat, lng, accuracy, note, demo_age)
select m.id, m.group_id, v.lat, v.lng, v.acc, v.note, v.ago
from m join (values
  ('Lotte', 50.97088, 4.69172, 12, 'Onder de gele vlag', interval '0 minutes'),
  ('Jonas', 50.97132, 4.69255, 20, '', interval '1 minute'),
  ('Amira', 50.97016, 4.69262, 15, 'In de rij voor frietjes', interval '0 minutes'),
  ('Wout', 50.96962, 4.69150, 35, '', interval '14 minutes')
) as v(name, lat, lng, acc, note, ago) on v.name = m.display_name;
