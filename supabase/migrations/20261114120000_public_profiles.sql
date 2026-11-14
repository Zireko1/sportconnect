-- ============================================================
-- Étape 1/2 — Sécurisation de la lecture de public.users (ADDITIVE)
--
-- Crée les accès publics restreints que l'app utilise à la place de la
-- table users. N'enlève rien : l'ancienne politique de lecture publique
-- est supprimée à l'étape 2, une fois le nouveau code déployé.
-- ============================================================

-- ------------------------------------------------------------
-- Vue : uniquement les colonnes publiques (ni email, ni coordonnées).
-- security_invoker = false : la vue s'exécute avec les droits de son
-- propriétaire et n'est donc pas filtrée par les RLS de users. C'est voulu :
-- elle ne sert que les colonnes listées ci-dessous.
-- ------------------------------------------------------------
create or replace view public.public_profiles
with (security_invoker = false) as
select
  u.id,
  split_part(btrim(u.name), ' ', 1) as first_name,
  u.avatar_url,
  u.sports,
  u.level,
  u.city
from public.users u;

comment on view public.public_profiles is
  'Profils publics : prénom, avatar, sports, niveau, ville. Jamais d''email ni de coordonnées.';

revoke all on public.public_profiles from public, anon, authenticated;
grant select on public.public_profiles to anon, authenticated;

-- ------------------------------------------------------------
-- Distance : une vue ne peut pas contenir de distance (elle dépend de la
-- position de celui qui regarde). Cette fonction renvoie les sportifs
-- proches avec une distance ARRONDIE, sans jamais exposer les coordonnées.
-- Réservée aux utilisateurs connectés (page /sportifs).
-- ------------------------------------------------------------
create or replace function public.nearby_profiles(
  p_lat       double precision,
  p_lon       double precision,
  p_radius_km integer default 50,
  p_limit     integer default 20
)
returns table (
  id          uuid,
  first_name  text,
  avatar_url  text,
  sports      public.sport_enum[],
  level       public.level_enum,
  city        text,
  distance_km integer
)
language sql
stable
security definer
set search_path = public
as $$
  with params as (
    select least(greatest(coalesce(p_radius_km, 50), 1), 100) as radius,
           least(greatest(coalesce(p_limit, 20), 1), 50)      as lim
  ),
  candidates as (
    select
      u.id, u.name, u.avatar_url, u.sports, u.level, u.city,
      -- Haversine (km)
      2 * 6371 * asin(sqrt(
        power(sin(radians(u.latitude - p_lat) / 2), 2)
        + cos(radians(p_lat)) * cos(radians(u.latitude))
          * power(sin(radians(u.longitude - p_lon) / 2), 2)
      )) as km
    from public.users u, params
    where auth.uid() is not null
      and u.id <> auth.uid()
      and u.city is not null
      and cardinality(u.sports) > 0
      and u.latitude is not null
      and u.longitude is not null
      and u.latitude between p_lat - params.radius / 111.0 and p_lat + params.radius / 111.0
  )
  select
    c.id,
    split_part(btrim(c.name), ' ', 1),
    c.avatar_url,
    c.sports,
    c.level,
    c.city,
    -- Même arrondi que approxKm() côté app : < 2 km → 1, < 10 km → au km, sinon aux 5 km
    case
      when c.km < 2  then 1
      when c.km < 10 then round(c.km)::integer
      else (round(c.km / 5) * 5)::integer
    end
  from candidates c, params
  where c.km <= params.radius
  order by c.km
  limit (select lim from params);
$$;

revoke all on function public.nearby_profiles(double precision, double precision, integer, integer) from public, anon;
grant execute on function public.nearby_profiles(double precision, double precision, integer, integer) to authenticated;

-- ------------------------------------------------------------
-- Comptage pour les pages SEO /[sport]/[ville] : nombre de sportifs qui
-- pratiquent un des sports donnés, dans la ville (nom) ou à moins de
-- p_radius_km du centre. Ne renvoie qu'un nombre.
-- ------------------------------------------------------------
create or replace function public.count_profiles_near(
  p_lat       double precision,
  p_lon       double precision,
  p_radius_km integer,
  p_city      text,
  p_sports    public.sport_enum[]
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.users u
  where u.sports && p_sports
    and (
      (p_city is not null and lower(u.city) = lower(p_city))
      or (
        u.latitude is not null and u.longitude is not null
        and 2 * 6371 * asin(sqrt(
              power(sin(radians(u.latitude - p_lat) / 2), 2)
              + cos(radians(p_lat)) * cos(radians(u.latitude))
                * power(sin(radians(u.longitude - p_lon) / 2), 2)
            )) <= least(greatest(coalesce(p_radius_km, 15), 1), 100)
      )
    );
$$;

revoke all on function public.count_profiles_near(double precision, double precision, integer, text, public.sport_enum[]) from public;
grant execute on function public.count_profiles_near(double precision, double precision, integer, text, public.sport_enum[]) to anon, authenticated;
