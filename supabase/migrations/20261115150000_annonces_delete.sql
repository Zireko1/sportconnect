-- ============================================================
-- Suppression d'une annonce par son organisateur
--
-- 1. Politique DELETE (déjà dans schema.sql, réaffirmée ici au cas où la base
--    aurait divergé) + privilège DELETE pour authenticated.
-- 2. messages.annonce_id → ON DELETE CASCADE. La table messages a été créée
--    hors schema.sql : sans cascade, supprimer une annonce ayant des messages
--    échouerait (23503). inscriptions, alert_queue, avis_* sont déjà en cascade.
-- Idempotente.
-- ============================================================

grant delete on public.annonces to authenticated;

drop policy if exists "annonces: suppression par l'organisateur" on public.annonces;
create policy "annonces: suppression par l'organisateur"
  on public.annonces for delete
  to authenticated
  using (auth.uid() = organizer_id);

do $$
declare r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.messages'::regclass
      and c.confrelid = 'public.annonces'::regclass
      and c.contype = 'f'
  loop
    execute format('alter table public.messages drop constraint %I', r.conname);
  end loop;

  alter table public.messages
    add constraint messages_annonce_id_fkey
    foreign key (annonce_id) references public.annonces(id) on delete cascade;
end
$$;
