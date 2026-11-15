-- ============================================================
-- Messagerie : droits de table, RLS et realtime
--
-- Constat (15/11/2026) : la table public.messages n'avait AUCUN privilège
-- (« permission denied for table messages », y compris pour service_role).
-- Les nouvelles tables du schéma public ne sont plus exposées automatiquement
-- à l'API. Conséquence : chaque INSERT depuis le chat échouait en 42501, et
-- l'erreur était ignorée côté client → message « disparu », pas de badge,
-- pas d'email de notification.
--
-- Idempotente : peut être rejouée sans risque.
-- ============================================================

-- 1. Privilèges de table ------------------------------------------------
revoke all on public.messages from anon;
grant select, insert on public.messages to authenticated;
-- Le destinataire ne peut modifier QUE le statut de lecture.
revoke update on public.messages from authenticated;
grant update (read) on public.messages to authenticated;
-- Crons / route de notification (client admin).
grant all on public.messages to service_role;

-- 2. RLS ----------------------------------------------------------------
alter table public.messages enable row level security;

-- On repart d'un état connu : suppression des politiques existantes.
do $$
declare r record;
begin
  for r in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'messages'
  loop
    execute format('drop policy %I on public.messages', r.policyname);
  end loop;
end
$$;

-- Lecture : uniquement les messages dont on est l'expéditeur ou le destinataire.
create policy "messages: lecture de ses conversations"
  on public.messages for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Écriture : on n'écrit qu'en son nom, à quelqu'un d'autre, dans une
-- conversation dont l'organisateur de l'annonce fait partie
-- (participant/curieux → organisateur, ou organisateur → participant/invité).
create policy "messages: envoi dans une conversation d'annonce"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and sender_id <> receiver_id
    and exists (
      select 1 from public.annonces a
      where a.id = annonce_id
        and a.organizer_id in (sender_id, receiver_id)
    )
  );

-- Marquer comme lu : seulement les messages reçus.
create policy "messages: le destinataire marque comme lu"
  on public.messages for update
  to authenticated
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- 3. Index pour le compteur de non-lus et l'historique -------------------
create index if not exists messages_receiver_unread_idx
  on public.messages (receiver_id) where read = false;
create index if not exists messages_annonce_created_idx
  on public.messages (annonce_id, created_at);

-- 4. Realtime (le realtime applique la politique SELECT ci-dessus) -------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end
$$;
