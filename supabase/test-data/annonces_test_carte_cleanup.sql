-- Supprime les annonces de test créées par annonces_test_carte.sql
--   npx supabase db query --remote=<ref> -f supabase/test-data/annonces_test_carte_cleanup.sql
-- (les inscriptions et la file d'alertes liées partent en cascade)
delete from public.annonces
where title like '[TEST]%'
  and organizer_id = '1d372b87-8d90-4716-ac84-12326e5136b7'
returning title, city;
