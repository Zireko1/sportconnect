-- ============================================================
-- Notification email des messages : idempotence + anti-spam
--
-- notified_at est posé atomiquement (update ... where notified_at is null)
-- avant l'envoi : un même message ne peut déclencher qu'un seul email, même
-- si /api/messages/notify est appelé plusieurs fois avec le même id.
-- Écrit uniquement par le service role (aucun droit UPDATE pour authenticated
-- sur cette colonne : seul « read » est modifiable, cf. 20261115120000).
-- ============================================================

alter table public.messages
  add column if not exists notified_at timestamptz;

-- Anti-spam : « déjà notifié dans cette conversation depuis 2 h ? »
create index if not exists messages_conv_notified_idx
  on public.messages (annonce_id, sender_id, receiver_id, notified_at)
  where notified_at is not null;
