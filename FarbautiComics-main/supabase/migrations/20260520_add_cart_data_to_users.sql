-- Add cart_data column to users table if missing
alter table if exists public.users
add column if not exists cart_data uuid[] not null default '{}';

-- Ensure existing rows have a default value
update public.users set cart_data = '{}' where cart_data is null;
