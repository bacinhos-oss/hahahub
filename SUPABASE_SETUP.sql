-- KOPIRAJ VSO TO KODO V SUPABASE SQL EDITOR IN KLIKNI RUN

-- 1. TABELA: profiles (uporabniki)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  is_paid boolean default false,
  subscription_expiry text,
  favorites text[] default '{}',
  uploaded_show_ids text[] default '{}',
  created_at timestamp with time zone default now()
);

-- 2. TABELA: shows (predstave)
create table if not exists shows (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  title text not null,
  author text not null,
  director text,
  synopsis text,
  genre text default 'Comedy',
  language text default 'English',
  location text,
  duration integer default 90,
  male_roles integer default 1,
  female_roles integer default 1,
  image_url text,
  producer_name text,
  producer_email text,
  rights_holder text,
  license_type text default 'License',
  licensing_model text default 'Royalty-based',
  royalty_range text,
  rights_status text default 'Available',
  production_year integer,
  likes_count integer default 0,
  views_count integer default 0,
  created_at timestamp with time zone default now()
);

-- 3. STORAGE bucket za slike
insert into storage.buckets (id, name, public)
values ('show-images', 'show-images', true)
on conflict do nothing;

-- 4. RLS (Row Level Security) - VARNOST
alter table profiles enable row level security;
alter table shows enable row level security;

-- profiles: vsak vidi samo svojega, admin vidi vse
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- shows: vsi vidijo vse, upload samo prijavljeni
create policy "Anyone can view shows" on shows for select using (true);
create policy "Authenticated users can insert shows" on shows for insert with check (auth.role() = 'authenticated');
create policy "Users can update own shows" on shows for update using (auth.uid() = user_id);
create policy "Users can delete own shows" on shows for delete using (auth.uid() = user_id);

-- storage: javni dostop za branje
create policy "Public read show images" on storage.objects for select using (bucket_id = 'show-images');
create policy "Authenticated upload show images" on storage.objects for insert with check (bucket_id = 'show-images' and auth.role() = 'authenticated');

-- 5. ADMIN dostop do profiles (za admin panel)
create policy "Admin full access profiles" on profiles for all using (
  auth.email() = 'bacinhos@gmail.com'
);
