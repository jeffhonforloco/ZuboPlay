-- Create profiles table for user information
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  username text unique not null,
  avatar_url text,
  total_games_played integer not null default 0,
  favorite_zubo_design jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  primary key (id),
  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 20)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create RLS policies for profiles
create policy "Users can view all profiles"
  on public.profiles
  for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'player_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Create trigger to automatically create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger for automatic timestamp updates
create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();