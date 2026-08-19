-- BookFlow seed data — mirrors docs/01_db.md §4.
-- Apply with: psql "$DATABASE_URL" -f db/seed.sql
-- Idempotent-ish: clears existing rows in dependency order first.

truncate table notification_logs, bookings, customers, services restart identity cascade;

with c as (
  insert into customers (name, phone, email) values
    ('김서연', '010-2841-7702', 'seoyeon@example.com'),
    ('박준호', '010-3320-1188', 'junho@example.com'),
    ('이하늘', '010-7712-9034', null),
    ('최민석', '010-4409-2216', 'minseok@example.com'),
    ('정유진', '010-8871-3345', null),
    ('한지우', '010-2204-6689', 'jiwoo@example.com'),
    ('문가영', '010-9982-4471', null),
    ('배성우', '010-1157-8830', 'sungwoo@example.com')
  returning id, name
),
s as (
  insert into services (name, duration_minutes, price) values
    ('상담 30분', 30, 30),
    ('시술 60분', 60, 60),
    ('재방문 상담 20분', 20, 20)
  returning id, name
),
booking_specs (customer_name, service_name, scheduled_at, status) as (
  values
    ('김서연', '시술 60분',        timestamptz '2026-08-18 10:00', 'pending'),
    ('박준호', '상담 30분',        timestamptz '2026-08-18 11:00', 'pending'),
    ('이하늘', '재방문 상담 20분', timestamptz '2026-08-18 13:20', 'confirmed'),
    ('최민석', '시술 60분',        timestamptz '2026-08-18 14:00', 'confirmed'),
    ('정유진', '상담 30분',        timestamptz '2026-08-18 15:30', 'pending'),
    ('한지우', '재방문 상담 20분', timestamptz '2026-08-18 16:40', 'confirmed'),
    ('김서연', '상담 30분',        timestamptz '2026-08-17 14:00', 'completed'),
    ('문가영', '시술 60분',        timestamptz '2026-08-17 15:00', 'no_show'),
    ('배성우', '재방문 상담 20분', timestamptz '2026-08-16 11:20', 'completed'),
    ('박준호', '시술 60분',        timestamptz '2026-08-16 13:00', 'cancelled'),
    ('이하늘', '시술 60분',        timestamptz '2026-08-15 10:00', 'completed'),
    ('최민석', '시술 60분',        timestamptz '2026-07-30 14:00', 'no_show'),
    ('한지우', '상담 30분',        timestamptz '2026-08-04 15:00', 'completed'),
    ('문가영', '상담 30분',        timestamptz '2026-07-14 11:30', 'completed')
),
b as (
  insert into bookings (customer_id, service_id, scheduled_at, status)
  select c.id, s.id, bs.scheduled_at, bs.status
  from booking_specs bs
  join c on c.name = bs.customer_name
  join s on s.name = bs.service_name
  returning id
)
insert into notification_logs (booking_id, type, channel, status)
select id, 'confirmation', 'kakao', 'sent' from b;
