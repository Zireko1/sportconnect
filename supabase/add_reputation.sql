-- Migration: système de réputation par notes étoiles (1-5)

create table avis_joueurs (
  id uuid default gen_random_uuid() primary key,
  reviewer_id uuid references users(id) on delete cascade,
  reviewed_id uuid references users(id) on delete cascade,
  annonce_id uuid references annonces(id) on delete cascade,
  note integer check (note >= 1 and note <= 5) not null,
  created_at timestamp with time zone default now(),
  unique(reviewer_id, reviewed_id, annonce_id)
);

create table avis_annonces (
  id uuid default gen_random_uuid() primary key,
  reviewer_id uuid references users(id) on delete cascade,
  annonce_id uuid references annonces(id) on delete cascade,
  note integer check (note >= 1 and note <= 5) not null,
  created_at timestamp with time zone default now(),
  unique(reviewer_id, annonce_id)
);

alter table avis_joueurs enable row level security;
alter table avis_annonces enable row level security;

create policy "Users can read all avis_joueurs"
on avis_joueurs for select using (true);

create policy "Users can insert their own avis_joueurs"
on avis_joueurs for insert with check (auth.uid() = reviewer_id);

create policy "Users can read all avis_annonces"
on avis_annonces for select using (true);

create policy "Users can insert their own avis_annonces"
on avis_annonces for insert with check (auth.uid() = reviewer_id);
