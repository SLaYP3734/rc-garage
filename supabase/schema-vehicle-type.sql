-- RC Atölyesi — Araç tipi (Araba / Drone / Uçak / Helikopter / Tekne / Diğer)
-- SQL Editor -> New query -> tamamını yapıştır, Run.

alter table problems add column if not exists vehicle_type text not null default 'araba';
alter table listings add column if not exists vehicle_type text not null default 'araba';
alter table garage_cars add column if not exists vehicle_type text not null default 'araba';

create index if not exists problems_vehicle_type_idx on problems(vehicle_type);
create index if not exists listings_vehicle_type_idx on listings(vehicle_type);
create index if not exists garage_cars_vehicle_type_idx on garage_cars(vehicle_type);
