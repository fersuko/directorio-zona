-- Create the reviews table
create table public.reviews (
  id uuid not null default gen_random_uuid (),
  business_id bigint not null,
  user_id uuid not null references auth.users (id),
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text null,
  created_at timestamp with time zone not null default now(),
  constraint reviews_pkey primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.reviews enable row level security;

-- Policy: Allow anyone to read reviews
create policy "Reviews are public" on public.reviews
  for select using (true);

-- Policy: Allow authenticated users to insert their own reviews
create policy "Users can create reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

-- Policy: Allow users to update their own reviews
create policy "Users can update own reviews" on public.reviews
  for update using (auth.uid() = user_id);

-- Policy: Allow users to delete their own reviews
create policy "Users can delete own reviews" on public.reviews
  for delete using (auth.uid() = user_id);
