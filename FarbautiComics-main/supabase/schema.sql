create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  usermodel_id integer unique,
  name text not null,
  last_name text not null,
  username text not null,
  email text not null unique,
  password text not null,
  favorites uuid[] not null default '{}',
  wishlist uuid[] not null default '{}',
  read_history uuid[] not null default '{}',
  cart_data uuid[] not null default '{}',
  purchases uuid[] not null default '{}',
  address text not null default 'my city',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  product_model_id integer unique,
  title text not null,
  price numeric not null,
  image text not null,
  image_public_id text,
  category text not null,
  artist_writer text not null default 'unknown',
  cover_artist text not null default 'unknown',
  publisher text not null default 'unknown',
  country_manufacture text not null default 'unknown',
  language text not null default 'english',
  style text not null default 'color',
  genre text not null,
  format text not null default 'TPB',
  type text not null default 'Graphic novel',
  description text not null default 'graphic novel',
  stock integer not null default 0 check (stock >= 0),
  available boolean not null default true,
  hearts integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  image text not null default '',
  author text not null,
  type text not null,
  category text not null,
  votes integer not null default 0,
  downvotes integer not null default 0,
  comments uuid[] not null default '{}',
  post_date text,
  voted_by uuid[] not null default '{}',
  downvoted_by uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  content text not null,
  votes integer not null default 0,
  downvotes integer not null default 0,
  voted_by uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  user_name text,
  user_email text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null,
  total numeric not null,
  invoice_number text unique,
  status text not null default 'completed' check (status in ('completed', 'refunded', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists interactions (
  id bigint generated always as identity primary key,
  user_id integer not null,
  product_id integer not null,
  read integer not null default 0,
  favorite integer not null default 0,
  wishlist integer not null default 0,
  purchase integer not null default 0,
  view integer not null default 0,
  score numeric,
  unique(user_id, product_id)
);

create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_comments_post_id on comments(post_id);
create index if not exists idx_products_external_id on products(external_id);
