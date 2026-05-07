-- Smart Bookmark App - Supabase Database Setup
-- Run this in your Supabase SQL Editor

-- Create bookmarks table
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  tags text[] default array[]::text[],
  description text
);

-- Enable Row Level Security
alter table public.bookmarks enable row level security;

-- Create RLS policies

-- Policy 1: Users can only view their own bookmarks
create policy "Users can view own bookmarks"
  on public.bookmarks
  for select
  using (auth.uid() = user_id);

-- Policy 2: Users can only insert their own bookmarks
create policy "Users can insert own bookmarks"
  on public.bookmarks
  for insert
  with check (auth.uid() = user_id);

-- Policy 3: Users can only update their own bookmarks
create policy "Users can update own bookmarks"
  on public.bookmarks
  for update
  using (auth.uid() = user_id);

-- Policy 4: Users can only delete their own bookmarks
create policy "Users can delete own bookmarks"
  on public.bookmarks
  for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index bookmarks_user_id_idx on public.bookmarks(user_id);
create index bookmarks_created_at_idx on public.bookmarks(created_at desc);

-- Enable Realtime for the bookmarks table
alter publication supabase_realtime add table public.bookmarks;
