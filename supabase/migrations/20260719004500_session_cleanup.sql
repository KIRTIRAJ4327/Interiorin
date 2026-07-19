create extension if not exists pg_cron with schema extensions;

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
  where bucket_id = 'studio-sources'
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

do $$
declare
  prior_job bigint;
begin
  select jobid into prior_job from cron.job where jobname = 'interiorin-expired-session-cleanup';
  if prior_job is not null then perform cron.unschedule(prior_job); end if;
  perform cron.schedule('interiorin-expired-session-cleanup', '17 * * * *', 'select public.cleanup_expired_studio_sessions();');
end;
$$;
