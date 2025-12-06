-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users if needed, but keeping simple for now)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Preferences
create table public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  categories text[] default '{}',
  keywords text[] default '{}',
  email_frequency text default 'daily', -- 'daily', 'weekly', 'never'
  theme text default 'light',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Cached News Articles (to avoid re-fetching/re-summarizing same news)
create table public.news_cache (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  summary text,
  source text,
  url text unique not null,
  image_url text,
  category text,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone -- for TTL
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.news_cache enable row level security;

-- RLS Policies
-- Profiles: Public read, self update
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Preferences: Private, only owner can read/update
create policy "Users can view own preferences." on public.user_preferences
  for select using (auth.uid() = user_id);

create policy "Users can insert own preferences." on public.user_preferences
  for insert with check (auth.uid() = user_id);

create policy "Users can update own preferences." on public.user_preferences
  for update using (auth.uid() = user_id);

-- News Cache: Public read, service role write (or authenticated users if we want them to contribute)
create policy "News cache is viewable by everyone." on public.news_cache
  for select using (true);

-- Functions
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.user_preferences (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
