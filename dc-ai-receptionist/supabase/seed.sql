-- DC AI Receptionist — sample seed data
-- Safe to re-run: uses on conflict do nothing on department name.

create unique index if not exists departments_name_uniq on public.departments (name);

insert into public.departments
  (name,               phone_numbers,            hours_start, hours_end, languages,                  routing_keywords)
values
  ('Sales',            array['+92-21-111-000-001'], '09:00', '18:00', array['urdu','english'], array['sales','buy','price','quote','demo']),
  ('Customer Support', array['+92-21-111-000-002'], '00:00', '23:59', array['urdu','english'], array['support','help','issue','problem','complaint']),
  ('HR',               array['+92-21-111-000-003'], '10:00', '17:00', array['urdu','english'], array['hr','job','career','hiring','interview'])
on conflict (name) do nothing;

insert into public.settings (key, value) values
  ('ivr_greeting',         '{"urdu":"السلام علیکم، براہ کرم زبان منتخب کریں","english":"Welcome, please choose a language"}'::jsonb),
  ('business_hours_default', '{"start":"09:00","end":"18:00","timezone":"Asia/Karachi"}'::jsonb),
  ('after_hours_message',  '{"urdu":"دفتر بند ہے، براہ کرم پیغام چھوڑیں","english":"We are closed, please leave a message"}'::jsonb)
on conflict (key) do nothing;
