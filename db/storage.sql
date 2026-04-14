insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do nothing;

drop policy if exists "Profile media is public to read" on storage.objects;
create policy "Profile media is public to read"
on storage.objects
for select
to public
using (bucket_id = 'profile-media');

drop policy if exists "Authenticated users can upload own profile media" on storage.objects;
create policy "Authenticated users can upload own profile media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-media'
  and (
    name like 'avatars/' || auth.uid() || '/%'
    or name like 'covers/' || auth.uid() || '/%'
  )
);

drop policy if exists "Authenticated users can update own profile media" on storage.objects;
create policy "Authenticated users can update own profile media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-media'
  and owner = auth.uid()
)
with check (
  bucket_id = 'profile-media'
  and owner = auth.uid()
);

drop policy if exists "Authenticated users can delete own profile media" on storage.objects;
create policy "Authenticated users can delete own profile media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-media'
  and owner = auth.uid()
);
