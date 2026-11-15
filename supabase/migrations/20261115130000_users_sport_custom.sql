-- ============================================================
-- Sport libre dans le profil + sports de l'inscription enfin enregistrés
--
-- 1. users.sport_custom : sport non listé, saisi librement (« Escalade »…).
-- 2. handle_new_user ignorait les sports choisis à l'inscription (ils
--    restaient dans auth.users.raw_user_meta_data, profil vide). Le trigger
--    les copie désormais, ainsi que le sport libre.
-- 3. Rattrapage des comptes existants dont le profil n'a aucun sport.
-- 4. Vue public_profiles : expose aussi sport_custom.
-- ============================================================

-- 1. Colonne -------------------------------------------------------------
alter table public.users
  add column if not exists sport_custom text;

alter table public.users drop constraint if exists users_sport_custom_len;
alter table public.users
  add constraint users_sport_custom_len check (sport_custom is null or char_length(sport_custom) between 1 and 40);

-- 2. Trigger d'inscription -------------------------------------------------
-- Seules les valeurs valides de sport_enum sont conservées (les métadonnées
-- viennent du client, on ne leur fait pas confiance).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_sports public.sport_enum[];
  v_custom text;
begin
  select coalesce(array_agg(distinct s.value::public.sport_enum), '{}')
    into v_sports
  from jsonb_array_elements_text(
         case when jsonb_typeof(new.raw_user_meta_data->'sports') = 'array'
              then new.raw_user_meta_data->'sports' else '[]'::jsonb end
       ) as s(value)
  where s.value = any (enum_range(null::public.sport_enum)::text[]);

  v_custom := nullif(left(btrim(coalesce(new.raw_user_meta_data->>'sport_custom', '')), 40), '');

  insert into public.users (id, email, name, avatar_url, sports, sport_custom)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    v_sports,
    v_custom
  );
  return new;
end;
$$;

-- (create or replace conserve les droits : EXECUTE reste révoqué, cf. 20261114140000)

-- 3. Rattrapage des profils sans sport -------------------------------------
update public.users u
set sports = sub.sports
from (
  select a.id,
         array_agg(distinct s.value::public.sport_enum) as sports
  from auth.users a
  cross join lateral jsonb_array_elements_text(
    case when jsonb_typeof(a.raw_user_meta_data->'sports') = 'array'
         then a.raw_user_meta_data->'sports' else '[]'::jsonb end
  ) as s(value)
  where s.value = any (enum_range(null::public.sport_enum)::text[])
  group by a.id
) sub
where u.id = sub.id
  and cardinality(u.sports) = 0;

-- 4. Vue publique (nouvelle colonne ajoutée en fin, autorisé par create or replace)
create or replace view public.public_profiles
with (security_invoker = false) as
select
  u.id,
  split_part(btrim(u.name), ' ', 1) as first_name,
  u.avatar_url,
  u.sports,
  u.level,
  u.city,
  u.sport_custom
from public.users u;
