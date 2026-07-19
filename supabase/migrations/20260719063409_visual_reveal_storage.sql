insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'studio-renders',
  'studio-renders',
  false,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "members read studio renders"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'studio-renders'
    and exists (
      select 1 from public.studio_members member
      where member.session_id::text = (storage.foldername(name))[1]
        and member.user_id = (select auth.uid())
    )
  );

create policy "members delete studio renders"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'studio-renders'
    and exists (
      select 1 from public.studio_members member
      where member.session_id::text = (storage.foldername(name))[1]
        and member.user_id = (select auth.uid())
    )
  );

create or replace function public.cleanup_expired_studio_sessions()
returns integer
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  removed_count integer;
begin
  delete from storage.objects
  where bucket_id in ('studio-sources', 'studio-renders')
    and split_part(name, '/', 1) in (
      select id::text from public.studio_sessions where expires_at <= now()
    );

  delete from public.studio_sessions where expires_at <= now();
  get diagnostics removed_count = row_count;
  return removed_count;
end;
$$;

revoke all on function public.cleanup_expired_studio_sessions() from public, anon, authenticated;
grant execute on function public.cleanup_expired_studio_sessions() to service_role;
