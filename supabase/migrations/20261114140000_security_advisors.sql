-- ============================================================
-- Corrections des alertes du linter de sécurité Supabase
-- ============================================================

-- ------------------------------------------------------------
-- 1. Fonctions de trigger exposées via /rest/v1/rpc
--
-- rls_auto_enable : fonction d'event trigger installée par Supabase
-- (event trigger « ensure_rls ») qui active automatiquement les RLS sur
-- toute nouvelle table du schéma public. Utile : on la garde.
-- Risque réel faible (une fonction RETURNS event_trigger ne peut pas être
-- appelée directement : Postgres refuse), mais elle n'a aucune raison d'être
-- exécutable par anon/authenticated → on retire le droit EXECUTE.
--
-- Même traitement pour les fonctions de trigger handle_new_user et
-- update_filled_spots. Les triggers continuent de fonctionner : Postgres
-- vérifie le droit EXECUTE à la création du trigger, pas à son déclenchement.
-- ------------------------------------------------------------
revoke execute on function public.rls_auto_enable()     from public, anon, authenticated;
revoke execute on function public.handle_new_user()     from public, anon, authenticated;
revoke execute on function public.update_filled_spots() from public, anon, authenticated;

-- update_filled_spots est SECURITY DEFINER sans search_path figé
-- (alerte function_search_path_mutable). Toutes ses références sont déjà
-- qualifiées (public.annonces) : on fige un search_path sûr.
alter function public.update_filled_spots() set search_path = pg_catalog, public;

-- ------------------------------------------------------------
-- 2. Extension unaccent : public → extensions
-- Vérifié avant migration : aucune fonction, vue ni index ne l'utilise,
-- et l'app ne l'appelle pas. Le schéma extensions est dans le search_path
-- par défaut des rôles Supabase.
-- ------------------------------------------------------------
create schema if not exists extensions;
alter extension unaccent set schema extensions;
