-- Safe follow-up migration: it changes policies/publication only and never deletes portfolio data.
-- Required because PostgreSQL RLS UPDATE also needs a SELECT policy, and existing projects
-- may have been created before every table was published to Realtime.

grant usage on schema public to anon, authenticated;
grant select on public.profile, public.site_settings, public.projects, public.skills,
  public.experience, public.certificates, public.education, public.testimonials, public.blog to anon;
grant select, insert, update, delete on public.profile, public.site_settings, public.projects,
  public.skills, public.experience, public.certificates, public.education, public.testimonials,
  public.blog, public.messages to authenticated;
grant insert on public.messages to anon;
grant usage, select on all sequences in schema public to authenticated;

-- The project is intentionally a single-owner student portfolio: each signed-in account is its owner.
-- Recreate the authenticated policies deterministically so INSERT/UPDATE/DELETE cannot silently fail.
do $$
declare table_name text;
begin
  foreach table_name in array array['profile','site_settings','projects','skills','experience','certificates','education','testimonials','blog','messages']
  loop
    execute format('drop policy if exists "admin manages %s" on public.%I', table_name, table_name);
    execute format('create policy "admin manages %s" on public.%I for all to authenticated using (true) with check (true)', table_name, table_name);
  end loop;
end $$;

-- Realtime subscriptions in the public page refetch published data after these events.
do $$
declare table_name text;
begin
  foreach table_name in array array['projects','skills','experience','certificates','education','testimonials','blog','profile','site_settings']
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
