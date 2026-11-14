-- ============================================================
-- Étape 2/2 — Fermeture de la lecture publique de public.users
--
-- Prérequis : migration 20261114120000_public_profiles appliquée ET code
-- déployé lisant public_profiles / nearby_profiles / count_profiles_near.
--
-- Après cette migration :
--   - un utilisateur connecté ne lit que SA ligne de users (email compris) ;
--   - les visiteurs anonymes ne lisent plus users du tout ;
--   - les profils des autres passent par la vue public_profiles ;
--   - le service role (crons, notifications) n'est pas concerné (bypass RLS).
-- ============================================================

-- Garde-fous : on s'arrête plutôt que de casser quelque chose en silence.
do $$
declare
  r record;
begin
  -- 1. Une politique d'une autre table qui lit users serait vidée par le changement
  for r in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename <> 'users'
      and (coalesce(qual, '') ~* '\musers\M' or coalesce(with_check, '') ~* '\musers\M')
  loop
    raise exception 'Politique % sur % dépend de users : à revoir avant de restreindre la lecture.',
      r.policyname, r.tablename;
  end loop;

  -- 2. Une politique ALL permissive sur users continuerait d'ouvrir la lecture
  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'users' and cmd = 'ALL'
  loop
    raise exception 'Politique ALL % sur users : à revoir manuellement.', r.policyname;
  end loop;

  -- 3. Toutes les politiques SELECT existantes sur users sont supprimées
  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'users' and cmd = 'SELECT'
  loop
    execute format('drop policy %I on public.users', r.policyname);
  end loop;
end
$$;

create policy "users: lecture de son propre profil"
  on public.users for select
  to authenticated
  using (auth.uid() = id);

-- Défense en profondeur : les anonymes n'ont plus aucun droit direct sur users
-- (les inscriptions passent par le trigger handle_new_user, security definer).
revoke all on public.users from anon;
