create or replace function public.commit_studio_command(
  p_session_id uuid,
  p_actor_user_id uuid,
  p_expected_revision integer,
  p_canonical_state jsonb,
  p_event_type text,
  p_idempotency_key uuid,
  p_payload jsonb,
  p_status public.studio_session_status default 'active'
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_event public.studio_events%rowtype;
  next_revision integer;
  appended_event public.studio_events%rowtype;
begin
  if not exists (
    select 1 from public.studio_members
    where session_id = p_session_id and user_id = p_actor_user_id and role = 'controller'
  ) then raise exception 'controller_membership_required' using errcode = '42501'; end if;

  select * into existing_event from public.studio_events
  where session_id = p_session_id and idempotency_key = p_idempotency_key;
  if found then return jsonb_build_object('duplicate', true, 'revision', (select revision from public.studio_sessions where id = p_session_id), 'event_id', existing_event.id, 'created_at', existing_event.created_at); end if;

  update public.studio_sessions
  set canonical_state = p_canonical_state, revision = revision + 1, status = p_status, updated_at = now()
  where id = p_session_id and revision = p_expected_revision and status in ('pairing', 'active') and expires_at > now()
  returning revision into next_revision;
  if next_revision is null then raise exception 'stale_or_expired_session' using errcode = '40001'; end if;

  insert into public.studio_events (session_id, event_type, actor_user_id, actor_role, payload, idempotency_key)
  values (p_session_id, p_event_type, p_actor_user_id, 'controller', p_payload, p_idempotency_key)
  returning * into appended_event;

  return jsonb_build_object('duplicate', false, 'revision', next_revision, 'event_id', appended_event.id, 'created_at', appended_event.created_at);
end;
$$;

revoke all on function public.commit_studio_command(uuid, uuid, integer, jsonb, text, uuid, jsonb, public.studio_session_status) from public, anon, authenticated;
grant execute on function public.commit_studio_command(uuid, uuid, integer, jsonb, text, uuid, jsonb, public.studio_session_status) to service_role;
