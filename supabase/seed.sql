-- =============================================
-- SportConnect — Données de test
-- Supabase Dashboard > SQL Editor > New query
-- =============================================

-- 1. Corriger les permissions REST API
--    (les tables n'ont pas de GRANT explicite → l'API renvoie 42501)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
  TO anon, authenticated, service_role;

-- 2. Créer un utilisateur dans auth.users
--    (le trigger handle_new_user() crée le profil public.users automatiquement)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  ) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role,
      email, encrypted_password,
      email_confirmed_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'authenticated', 'authenticated',
      'demo@sportconnect.fr',
      crypt('SportConnect2026!', gen_salt('bf')),
      now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Alex Martin"}',
      now(), now(),
      '', '', '', ''
    );
  END IF;
END $$;

-- 3. Compléter le profil avec sports / niveau / ville
UPDATE public.users
SET
  sports = ARRAY['soccer_five', 'trail', 'velo']::sport_enum[],
  level  = 'intermediaire'::level_enum,
  city   = 'Annecy'
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- 4. Insérer 5 annonces réalistes — Sillon alpin
INSERT INTO public.annonces
  (id, organizer_id,
   sport, sport_type,
   title, description,
   date_time, location_name, city,
   total_spots, filled_spots,
   level, price_per_player,
   distance_km, elevation_m, pace,
   status, created_at)
VALUES

  -- ⚽ Soccer Five — Annecy
  (
    uuid_generate_v4(),
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'soccer_five'::sport_enum, 'collectif'::sport_type_enum,
    'Soccer Five — manque 2 joueurs ce soir',
    'Terrain synthétique couvert aux Marquisats. Équipes équilibrées, ambiance détendue. Venez bien chaussés !',
    '2026-04-28 19:00:00+02', 'Terrain des Marquisats', 'Annecy',
    10, 8,
    'intermediaire'::level_enum, 5,
    NULL, NULL, NULL,
    'open'::annonce_status_enum, now()
  ),

  -- 🎾 Padel — Annemasse
  (
    uuid_generate_v4(),
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'padel'::sport_enum, 'collectif'::sport_type_enum,
    'Padel double mixte — niveau intermédiaire',
    'Court couvert réservé, raquettes disponibles sur place. Venez à 4 ou rejoignez-nous en solo !',
    '2026-04-29 18:30:00+02', 'Padel Club Annemasse', 'Annemasse',
    4, 2,
    'intermediaire'::level_enum, 8,
    NULL, NULL, NULL,
    'open'::annonce_status_enum, now()
  ),

  -- 🏃 Trail — Chambéry
  (
    uuid_generate_v4(),
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'trail'::sport_enum, 'outdoor'::sport_type_enum,
    'Trail Chartreuse — boucle 18 km D+900m',
    'Départ parking Charmant Som. Niveau confirmé requis, bâtons conseillés. Vue imprenable sur les Alpes.',
    '2026-04-30 08:00:00+02', 'Parking Charmant Som', 'Chambéry',
    8, 5,
    'confirme'::level_enum, 0,
    18, 900, '5''30/km',
    'open'::annonce_status_enum, now()
  ),

  -- 🚴 Vélo — Annecy
  (
    uuid_generate_v4(),
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'velo'::sport_enum, 'outdoor'::sport_type_enum,
    'Sortie route — Col de la Forclaz via Talloires',
    'Circuit classique du lac d''Annecy avec montée au Col de la Forclaz. Allure soutenue, pas de lanterne rouge.',
    '2026-05-01 08:30:00+02', 'Place de l''Hôtel de Ville', 'Annecy',
    6, 3,
    'confirme'::level_enum, 0,
    65, 1200, '24 km/h',
    'open'::annonce_status_enum, now()
  ),

  -- 🏀 Basket — Aix-les-Bains
  (
    uuid_generate_v4(),
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'basket'::sport_enum, 'collectif'::sport_type_enum,
    'Basket 3x3 — plateau ouvert au Revard',
    'Plateau extérieur refait à neuf. Format 3x3 officiel, matchs à 10 points. Tous niveaux bienvenus !',
    '2026-05-03 14:00:00+02', 'Plateau Sportif du Revard', 'Aix-les-Bains',
    12, 6,
    'debutant'::level_enum, 0,
    NULL, NULL, NULL,
    'open'::annonce_status_enum, now()
  );

-- Vérification — doit afficher 5 lignes
SELECT
  sport,
  title,
  city,
  date_time::date AS date,
  total_spots - filled_spots AS places_dispo,
  price_per_player AS prix
FROM public.annonces
ORDER BY date_time;
