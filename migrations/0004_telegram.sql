-- Telegram integration: account links, deep-link auth codes, summary sends.
--
-- One row per app user (PK user_id) and per Telegram account (unique
-- telegram_user_id) — a Telegram account can own at most one app account and
-- vice versa. chat_id is where notifications and exports are delivered; a user
-- may change @username freely (kept best-effort, not unique).

create table if not exists telegram_links (
  user_id text not null primary key references "user" ("id") on delete cascade,
  telegram_user_id text not null unique,
  chat_id text not null,
  username text not null default '',
  display_name text not null default '',
  created_at timestamptz not null default current_timestamp
);

create index if not exists telegram_links_chat_idx on telegram_links (chat_id);

-- One-time deep-link sign-in codes (POST /api/auth/telegram/start).
-- The webhook fills telegram_user_id/chat_id when the user taps Start
-- (claimed_at); /complete consumes the row (single use) and deletes it.
create table if not exists telegram_auth_codes (
  code text not null primary key,
  telegram_user_id text,
  chat_id text,
  username text not null default '',
  display_name text not null default '',
  claimed_at timestamptz,
  created_at timestamptz not null default current_timestamp,
  expires_at timestamptz not null
);

create index if not exists telegram_auth_codes_expiry_idx
  on telegram_auth_codes (expires_at);

-- Idempotency for the monthly summary cron: the INSERT wins once per month
-- (ON CONFLICT DO NOTHING), so a retried/duplicated cron run sends nothing.
create table if not exists telegram_summary_sent (
  month text not null primary key,
  sent_at timestamptz not null default current_timestamp
);
