-- Phone / browser notifications (Web Push).
--
-- When a user turns on notifications, their browser gives us a "subscription":
-- a secret delivery address (endpoint) and two public keys used to encrypt the
-- message so only that browser can read it. We store one row per device.
--
-- Security:
-- • RLS: users can only see, add and remove their OWN devices.
-- • Grants: users can't change rows (only add or delete), and anonymous
--   visitors have no access at all.
-- • The backend (service role) reads subscriptions to send notifications.

begin;

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Delivery address from the browser's push service (Google, Mozilla, Apple…).
  endpoint text not null check (endpoint like 'https://%' and length(endpoint) <= 1000),
  -- Browser's public key (65 bytes, base64url = 87 chars) and auth secret (16 bytes = 22 chars).
  p256dh text not null check (length(p256dh) between 80 and 100),
  auth text not null check (length(auth) between 16 and 30),
  -- Notification texts are written in this language.
  language text not null default 'en' check (language in ('en', 'tr')),
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

-- At most 5 devices per user (keeps sending cheap and limits abuse).
create function public.limit_push_subscriptions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.push_subscriptions where user_id = new.user_id) >= 5 then
    raise exception 'You can turn on notifications on at most 5 devices.'
      using hint = 'push_device_limit_reached';
  end if;
  return new;
end;
$$;

create trigger push_subscriptions_limit
  before insert on public.push_subscriptions
  for each row execute function public.limit_push_subscriptions();

alter table public.push_subscriptions enable row level security;

create policy "Users can view their own devices"
  on public.push_subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own devices"
  on public.push_subscriptions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own devices"
  on public.push_subscriptions for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.push_subscriptions from anon, authenticated;
grant select, delete on public.push_subscriptions to authenticated;
grant insert (endpoint, p256dh, auth, language) on public.push_subscriptions to authenticated;
grant all on public.push_subscriptions to service_role;

revoke all on function public.limit_push_subscriptions() from public, anon, authenticated;

commit;
