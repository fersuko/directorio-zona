-- Enable PostGIS for location features
create extension if not exists postgis;

-- PROFILES (Extends Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  role text check (role in ('user', 'business_owner', 'admin')) default 'user',
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- BUSINESSES
create table public.businesses (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) not null,
  name text not null,
  description text,
  category text,
  address text,
  location geography(Point),
  images text[],
  is_premium boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- PROMOTIONS
create table public.promotions (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  title text not null,
  description text,
  discount_percentage integer,
  valid_until timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.promotions enable row level security;

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Profiles: Public read, Self update
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Businesses: Public read, Owner update
create policy "Businesses are viewable by everyone."
  on businesses for select
  using ( true );

create policy "Owners can insert their own business."
  on businesses for insert
  with check ( auth.uid() = owner_id );

create policy "Owners can update their own business."
  on businesses for update
  using ( auth.uid() = owner_id );

-- Promotions: Public read, Owner update (via business)
create policy "Promotions are viewable by everyone."
  on promotions for select
  using ( true );

create policy "Owners can insert promotions for their business."
  on promotions for insert
  with check (
    exists (
      select 1 from businesses
      where businesses.id = business_id
      and businesses.owner_id = auth.uid()
    )
  );
