-- ============================================================
-- Annonces de TEST géolocalisées (vérification de la carte)
--
-- ⚠️ Hors migrations : à lancer à la main, jamais via `db push`.
--   npx supabase db query --remote=<ref> -f supabase/test-data/annonces_test_carte.sql
-- Suppression : supabase/test-data/annonces_test_carte_cleanup.sql
--
-- - Titres préfixés « [TEST] » pour les repérer et les supprimer.
-- - Insertion SQL directe : le matching des alertes (déclenché par l'app à
--   la création d'une annonce) ne tourne pas, aucun email n'est envoyé.
-- - Dates relatives (J+1 à J+12, heure de Paris) : toujours à venir.
-- ============================================================

with organizer as (
  select '1d372b87-8d90-4716-ac84-12326e5136b7'::uuid as id
),
data (sport, sport_type, sport_custom, title, location_name, city, lat, lon, day_offset, hour, total, filled, level, price, distance_km, elevation_m, pace) as (
  values
    -- Annecy et alentours : plusieurs annonces proches pour tester le clustering
    ('padel'::sport_enum,       'collectif'::sport_type_enum, null::text, '[TEST] Padel — il manque 1 joueur',      'Padel Club Annecy',           'Annecy',           45.9045, 6.1119, 1, 18, 4,  3, 'intermediaire'::level_enum, 12, null::numeric, null::int, null::text),
    ('basket',                  'collectif',                  null,       '[TEST] 3x3 au Pâquier',                  'Playground du Pâquier',       'Annecy',           45.9010, 6.1310, 2, 17, 6,  2, 'debutant',                  0,  null, null, null),
    ('volley',                  'collectif',                  null,       '[TEST] Beach-volley au bord du lac',     'Plage d''Albigny',            'Annecy-le-Vieux',  45.9100, 6.1440, 3, 19, 8,  4, null,                        0,  null, null, null),
    ('trail',                   'outdoor',                    null,       '[TEST] Trail du Semnoz',                 'Parking de Quintal',          'Annecy',           45.8530, 6.1080, 4,  8, 6,  1, 'confirme',                  0,  18,   900,  '6:00/km'),
    ('futsal',                  'collectif',                  null,       '[TEST] Futsal du jeudi soir',            'Gymnase de Seynod',           'Seynod',           45.8853, 6.0882, 5, 20, 10, 7, 'intermediaire',             3,  null, null, null),
    ('soccer_five',             'collectif',                  null,       '[TEST] Five — cherche 2 joueurs',        'Five Annecy Epagny',          'Epagny Metz-Tessy',45.9370, 6.0870, 2, 21, 10, 10,'intermediaire',             8,  null, null, null),
    -- Genève
    ('padel',                   'collectif',                  null,       '[TEST] Padel à Genève',                  'Padel Center Genève',         'Genève',           46.1950, 6.1490, 3, 12, 4,  2, 'confirme',                  25, null, null, null),
    ('soccer_five',             'collectif',                  null,       '[TEST] Foot à 5 aux Vernets',            'Centre sportif des Vernets',  'Genève',           46.1960, 6.1360, 6, 19, 10, 5, null,                        0,  null, null, null),
    -- Lausanne
    ('badminton',               'collectif',                  null,       '[TEST] Badminton en double',             'Salle de la Vallée de la Jeunesse', 'Lausanne',   46.5220, 6.6150, 7, 18, 4,  2, 'debutant',                  5,  null, null, null),
    -- Thonon-les-Bains
    ('velo',                    'outdoor',                    null,       '[TEST] Sortie vélo tour du Chablais',    'Port de Rives',               'Thonon-les-Bains', 46.3750, 6.4830, 8,  9, 8,  3, 'intermediaire',             0,  65,   800,  '27 km/h'),
    -- Évian-les-Bains : sport « Autre » (teste l'affichage personnalisé)
    ('autre',                   'collectif',                  'Tennis',   '[TEST] Tennis en simple',                'Tennis Club d''Évian',        'Évian-les-Bains',  46.4000, 6.5900, 9, 10, 2,  1, 'intermediaire',             0,  null, null, null),
    -- Chambéry
    ('randonnee',               'outdoor',                    null,       '[TEST] Rando au Nivolet',                'Parking de la Féclaz',        'Chambéry',         45.6400, 5.9900, 12, 9, 10, 4, 'debutant',                  0,  12,   600,  null)
)
insert into public.annonces (
  organizer_id, sport, sport_type, sport_custom, title, description, date_time,
  location_name, city, latitude, longitude, total_spots, filled_spots, level,
  price_per_player, distance_km, elevation_m, pace, status
)
select
  o.id, d.sport, d.sport_type, d.sport_custom, d.title,
  'Annonce de test pour vérifier la carte — elle sera supprimée.',
  -- J+day_offset à hour:00, heure de Paris
  ((date_trunc('day', now() at time zone 'Europe/Paris')
    + make_interval(days => d.day_offset, hours => d.hour)) at time zone 'Europe/Paris'),
  d.location_name, d.city, d.lat, d.lon, d.total, d.filled, d.level,
  d.price, d.distance_km, d.elevation_m, d.pace,
  (case when d.filled >= d.total then 'full' else 'open' end)::annonce_status_enum
from data d cross join organizer o
returning title, city, status;
