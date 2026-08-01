create table if not exists chicken_types (
  id text primary key,
  name text not null,
  unit_weight_kg double precision not null,
  price_per_kg double precision not null,
  average_price double precision not null,
  is_active boolean default true
);

create table if not exists customers (
  id text primary key,
  name text not null,
  phone text not null,
  address text not null,
  delivery_method text not null
);

create table if not exists orders (
  id text primary key,
  customer_id text not null,
  delivery_method text not null,
  delivery_location text not null,
  payment_status text not null,
  delivery_status text not null,
  items jsonb not null,
  total_amount double precision not null
);
