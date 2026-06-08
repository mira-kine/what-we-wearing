-- what we wearing? — full schema
-- Permissive RLS (no auth, anon key only). Reads/inserts/updates open.
-- Deletes restricted to closet_items to prevent accidental data loss.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text not null unique,
  theme       text,
  created_at  timestamptz not null default now()
);

create table if not exists participants (
  id          uuid primary key default gen_random_uuid(),
  username    text not null,
  event_id    uuid not null references events(id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index if not exists participants_event_idx on participants(event_id);

create table if not exists closet_items (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  event_id       uuid not null references events(id) on delete cascade,
  slot_key       text not null check (slot_key in ('face','top','bottom','shoes','accessory')),
  image_url      text not null,
  display_order  int  not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists closet_items_participant_slot_idx
  on closet_items(participant_id, slot_key, display_order);
create index if not exists closet_items_event_idx on closet_items(event_id);

create table if not exists outfits (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  event_id       uuid not null references events(id) on delete cascade,
  canvas_state   jsonb,
  export_url     text,
  is_published   boolean not null default false,
  published_at   timestamptz,
  updated_at     timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  unique (participant_id, event_id)
);
create index if not exists outfits_event_published_idx on outfits(event_id, is_published);

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at trigger
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists outfits_set_updated_at on outfits;
create trigger outfits_set_updated_at
  before update on outfits
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security (anon-key trust model)
-- ─────────────────────────────────────────────────────────────────────────────

alter table events       enable row level security;
alter table participants enable row level security;
alter table closet_items enable row level security;
alter table outfits      enable row level security;

create policy "events_read"       on events       for select using (true);
create policy "participants_read" on participants for select using (true);
create policy "closet_items_read" on closet_items for select using (true);
create policy "outfits_read"      on outfits      for select using (true);

create policy "events_insert"       on events       for insert with check (true);
create policy "participants_insert" on participants for insert with check (true);
create policy "closet_items_insert" on closet_items for insert with check (true);
create policy "outfits_insert"      on outfits      for insert with check (true);

create policy "outfits_update"      on outfits      for update using (true) with check (true);
create policy "closet_items_update" on closet_items for update using (true) with check (true);

create policy "closet_items_delete" on closet_items for delete using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage buckets + policies
-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
  values ('outfit-pieces', 'outfit-pieces', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('outfit-exports', 'outfit-exports', true)
  on conflict (id) do nothing;

drop policy if exists "outfit_pieces_read"   on storage.objects;
drop policy if exists "outfit_pieces_write"  on storage.objects;
drop policy if exists "outfit_exports_read"  on storage.objects;
drop policy if exists "outfit_exports_write" on storage.objects;
drop policy if exists "outfit_exports_update" on storage.objects;

create policy "outfit_pieces_read"
  on storage.objects for select
  using (bucket_id = 'outfit-pieces');

create policy "outfit_pieces_write"
  on storage.objects for insert
  with check (bucket_id = 'outfit-pieces');

create policy "outfit_exports_read"
  on storage.objects for select
  using (bucket_id = 'outfit-exports');

create policy "outfit_exports_write"
  on storage.objects for insert
  with check (bucket_id = 'outfit-exports');

create policy "outfit_exports_update"
  on storage.objects for update
  using (bucket_id = 'outfit-exports')
  with check (bucket_id = 'outfit-exports');
