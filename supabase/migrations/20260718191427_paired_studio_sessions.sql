create type public.studio_member_role as enum ('wall', 'controller');
create type public.studio_session_status as enum ('pairing', 'active', 'ended', 'expired');

create table public.studio_sessions (
  id uuid primary key default gen_random_uuid(),
  topic text not null unique,
  pairing_code text not null unique check (pairing_code ~ '^[A-Z0-9]{6}$'),
  pairing_token_digest text not null,
  pairing_expires_at timestamptz not null default (now() + interval '10 minutes'),
  pairing_used_at timestamptz,
  canonical_state jsonb not null default '{}'::jsonb,
  revision integer not null default 0 check (revision >= 0),
  status public.studio_session_status not null default 'pairing',
  created_by uuid not null references auth.users(id) on delete cascade,
  source_object_path text,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (octet_length(canonical_state::text) <= 2097152)
);

create table public.studio_members (
  session_id uuid not null references public.studio_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.studio_member_role not null,
  joined_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

create unique index studio_members_one_wall
  on public.studio_members (session_id) where role = 'wall';
create unique index studio_members_one_controller
  on public.studio_members (session_id) where role = 'controller';
create index studio_members_user_id on public.studio_members (user_id);
create index studio_sessions_expires_at on public.studio_sessions (expires_at);

create table public.studio_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.studio_sessions(id) on delete cascade,
  event_type text not null check (event_type ~ '^[a-z][a-z0-9_]{2,48}$'),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role public.studio_member_role,
  payload jsonb not null default '{}'::jsonb,
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  unique (session_id, idempotency_key),
  check (octet_length(payload::text) <= 32768)
);

create index studio_events_session_cursor on public.studio_events (session_id, id);

alter table public.studio_sessions enable row level security;
alter table public.studio_members enable row level security;
alter table public.studio_events enable row level security;

grant select, insert, update, delete on public.studio_sessions to authenticated;
grant select on public.studio_members to authenticated;
grant select on public.studio_events to authenticated;
grant usage, select on sequence public.studio_events_id_seq to authenticated;

create policy "members read their own membership"
  on public.studio_members for select to authenticated
  using (user_id = (select auth.uid()));

create policy "creators make sessions"
  on public.studio_sessions for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy "members read sessions"
  on public.studio_sessions for select to authenticated
  using (
    created_by = (select auth.uid())
    or exists (
      select 1 from public.studio_members member
      where member.session_id = studio_sessions.id
        and member.user_id = (select auth.uid())
    )
  );

create policy "wall updates canonical session"
  on public.studio_sessions for update to authenticated
  using (
    exists (
      select 1 from public.studio_members member
      where member.session_id = studio_sessions.id
        and member.user_id = (select auth.uid())
        and member.role = 'wall'
    )
  )
  with check (
    exists (
      select 1 from public.studio_members member
      where member.session_id = studio_sessions.id
        and member.user_id = (select auth.uid())
        and member.role = 'wall'
    )
  );

create policy "wall deletes session"
  on public.studio_sessions for delete to authenticated
  using (
    exists (
      select 1 from public.studio_members member
      where member.session_id = studio_sessions.id
        and member.user_id = (select auth.uid())
        and member.role = 'wall'
    )
  );

create policy "members read session events"
  on public.studio_events for select to authenticated
  using (
    exists (
      select 1 from public.studio_members member
      where member.session_id = studio_events.session_id
        and member.user_id = (select auth.uid())
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'studio-sources',
  'studio-sources',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "members read studio sources"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'studio-sources'
    and exists (
      select 1 from public.studio_members member
      where member.session_id::text = (storage.foldername(name))[1]
        and member.user_id = (select auth.uid())
    )
  );

create policy "controller uploads studio source"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'studio-sources'
    and owner_id = (select auth.uid())::text
    and exists (
      select 1 from public.studio_members member
      where member.session_id::text = (storage.foldername(name))[1]
        and member.user_id = (select auth.uid())
        and member.role = 'controller'
    )
  );

create policy "members delete studio sources"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'studio-sources'
    and exists (
      select 1 from public.studio_members member
      where member.session_id::text = (storage.foldername(name))[1]
        and member.user_id = (select auth.uid())
    )
  );

create policy "members receive private studio messages"
  on realtime.messages for select to authenticated
  using (
    realtime.messages.extension in ('broadcast', 'presence')
    and exists (
      select 1 from public.studio_members member
      where member.user_id = (select auth.uid())
        and ('studio:' || member.session_id::text) = (select realtime.topic())
    )
  );

create policy "members publish studio presence"
  on realtime.messages for insert to authenticated
  with check (
    realtime.messages.extension = 'presence'
    and exists (
      select 1 from public.studio_members member
      where member.user_id = (select auth.uid())
        and ('studio:' || member.session_id::text) = (select realtime.topic())
    )
  );
