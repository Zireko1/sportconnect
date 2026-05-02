-- ============================================================
-- SportVoisin — Schéma SQL complet
-- Coller dans : Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "unaccent";

-- ============================================================
-- ENUMS
-- ============================================================

create type sport_enum as enum (
  'soccer_five', 'padel', 'basket', 'volley',
  'futsal', 'badminton', 'velo', 'trail', 'randonnee'
);

create type sport_type_enum as enum ('collectif', 'outdoor');

create type level_enum as enum ('debutant', 'intermediaire', 'confirme');

create type annonce_status_enum as enum ('open', 'full', 'cancelled', 'completed');

create type inscription_status_enum as enum ('pending', 'confirmed', 'cancelled');

create type alert_frequency_enum as enum ('realtime', 'daily', 'weekly');

-- ============================================================
-- TABLE : users
-- Étend auth.users de Supabase — créée automatiquement à l'inscription
-- ============================================================

create table public.users (
  id           uuid references auth.users(id) on delete cascade primary key,
  email        text not null,
  name         text not null,
  avatar_url   text,
  sports       sport_enum[] default '{}' not null,
  level        level_enum,
  city         text,
  latitude     float,
  longitude    float,
  created_at   timestamptz default now() not null
);

-- Trigger : créer le profil public automatiquement à l'inscription Supabase Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABLE : annonces
-- ============================================================

create table public.annonces (
  id               uuid default uuid_generate_v4() primary key,
  organizer_id     uuid references public.users(id) on delete cascade not null,
  sport            sport_enum not null,
  sport_type       sport_type_enum not null,
  title            text not null,
  description      text,
  date_time        timestamptz not null,
  location_name    text not null,
  latitude         float,
  longitude        float,
  city             text not null,
  total_spots      int not null check (total_spots > 0 and total_spots <= 50),
  filled_spots     int default 0 not null check (filled_spots >= 0),
  level            level_enum,
  price_per_player float default 0 not null check (price_per_player >= 0),
  -- Champs outdoor uniquement
  distance_km      float,
  elevation_m      int,
  pace             text,
  status           annonce_status_enum default 'open' not null,
  created_at       timestamptz default now() not null,
  constraint filled_lte_total check (filled_spots <= total_spots)
);

create index annonces_city_idx on public.annonces(city);
create index annonces_sport_idx on public.annonces(sport);
create index annonces_date_idx on public.annonces(date_time);
create index annonces_status_idx on public.annonces(status);
create index annonces_organizer_idx on public.annonces(organizer_id);

-- ============================================================
-- TABLE : inscriptions
-- ============================================================

create table public.inscriptions (
  id          uuid default uuid_generate_v4() primary key,
  annonce_id  uuid references public.annonces(id) on delete cascade not null,
  user_id     uuid references public.users(id) on delete cascade not null,
  status      inscription_status_enum default 'confirmed' not null,
  created_at  timestamptz default now() not null,
  unique(annonce_id, user_id)
);

create index inscriptions_annonce_idx on public.inscriptions(annonce_id);
create index inscriptions_user_idx on public.inscriptions(user_id);

-- Trigger : mettre à jour filled_spots et status de l'annonce automatiquement
create or replace function public.update_filled_spots()
returns trigger language plpgsql security definer as $$
declare
  v_count int;
  v_total int;
begin
  if TG_OP = 'INSERT' and NEW.status = 'confirmed' then
    update public.annonces
    set filled_spots = filled_spots + 1
    where id = NEW.annonce_id;
  elsif TG_OP = 'UPDATE' then
    if OLD.status != 'confirmed' and NEW.status = 'confirmed' then
      update public.annonces set filled_spots = filled_spots + 1 where id = NEW.annonce_id;
    elsif OLD.status = 'confirmed' and NEW.status != 'confirmed' then
      update public.annonces set filled_spots = greatest(filled_spots - 1, 0) where id = NEW.annonce_id;
    end if;
  elsif TG_OP = 'DELETE' and OLD.status = 'confirmed' then
    update public.annonces set filled_spots = greatest(filled_spots - 1, 0) where id = OLD.annonce_id;
  end if;

  -- Mettre à jour le statut open/full automatiquement
  if TG_OP = 'DELETE' then
    select filled_spots, total_spots into v_count, v_total from public.annonces where id = OLD.annonce_id;
    if v_count < v_total then
      update public.annonces set status = 'open' where id = OLD.annonce_id and status = 'full';
    end if;
  else
    select filled_spots, total_spots into v_count, v_total from public.annonces where id = NEW.annonce_id;
    if v_count >= v_total then
      update public.annonces set status = 'full' where id = NEW.annonce_id and status = 'open';
    end if;
  end if;

  return coalesce(NEW, OLD);
end;
$$;

create trigger on_inscription_change
  after insert or update or delete on public.inscriptions
  for each row execute procedure public.update_filled_spots();

-- ============================================================
-- TABLE : alert_configs
-- ============================================================

create table public.alert_configs (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.users(id) on delete cascade not null unique,
  sports        sport_enum[] default '{}' not null,
  radius_km     int default 30 not null check (radius_km > 0 and radius_km <= 100),
  days_of_week  int[] default '{0,1,2,3,4,5,6}' not null,
  time_slots    text[] default '{"matin","apres-midi","soiree"}' not null,
  level         text default 'tous' not null,
  frequency     alert_frequency_enum default 'realtime' not null,
  active        boolean default true not null
);

-- ============================================================
-- TABLE : alert_queue
-- File d'attente pour les alertes daily/weekly
-- ============================================================

create table public.alert_queue (
  id             uuid default uuid_generate_v4() primary key,
  user_id        uuid references public.users(id) on delete cascade not null,
  annonce_id     uuid references public.annonces(id) on delete cascade not null,
  sent_at        timestamptz,
  scheduled_for  timestamptz not null,
  created_at     timestamptz default now() not null,
  unique(user_id, annonce_id)
);

create index alert_queue_scheduled_idx on public.alert_queue(scheduled_for) where sent_at is null;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- ---------- users ----------
alter table public.users enable row level security;

create policy "users: lecture publique"
  on public.users for select using (true);

create policy "users: insert via trigger uniquement"
  on public.users for insert with check (auth.uid() = id);

create policy "users: mise à jour profil propre"
  on public.users for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- annonces ----------
alter table public.annonces enable row level security;

create policy "annonces: lecture publique"
  on public.annonces for select using (true);

create policy "annonces: création authentifiée"
  on public.annonces for insert
  with check (auth.role() = 'authenticated' and auth.uid() = organizer_id);

create policy "annonces: modification par l'organisateur"
  on public.annonces for update using (auth.uid() = organizer_id);

create policy "annonces: suppression par l'organisateur"
  on public.annonces for delete using (auth.uid() = organizer_id);

-- ---------- inscriptions ----------
alter table public.inscriptions enable row level security;

create policy "inscriptions: lecture par participant ou organisateur"
  on public.inscriptions for select using (
    auth.uid() = user_id
    or auth.uid() in (
      select organizer_id from public.annonces where id = annonce_id
    )
  );

create policy "inscriptions: rejoindre une annonce"
  on public.inscriptions for insert
  with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "inscriptions: modifier sa propre inscription"
  on public.inscriptions for update using (auth.uid() = user_id);

create policy "inscriptions: quitter une annonce"
  on public.inscriptions for delete using (auth.uid() = user_id);

-- ---------- alert_configs ----------
alter table public.alert_configs enable row level security;

create policy "alert_configs: accès exclusif au propriétaire"
  on public.alert_configs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- alert_queue ----------
alter table public.alert_queue enable row level security;

create policy "alert_queue: lecture par l'utilisateur"
  on public.alert_queue for select using (auth.uid() = user_id);

-- Les inserts/updates sur alert_queue sont réservés au service role (Vercel cron)
