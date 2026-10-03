-- Recurring transactions: occurrence generation.
--
-- Each recurring transaction row is the *anchor* of a series (series_id = its
-- own id). On read, GET /api/transactions/ materializes past-due occurrences
-- as independent rows sharing the anchor's series_id (see
-- src/lib/budget/recurring.ts for the date math). Explicit deletes and date
-- edits of an occurrence record a tombstone so the generator never resurrects
-- a date the user removed.

alter table transactions add column if not exists series_id text;

-- Existing recurring rows become their own anchors.
update transactions set series_id = id where recurring is not null and series_id is null;

-- One row per (user, series, date) — race-safe materialization; NULL series_id
-- (non-recurring rows) is exempt: NULLs are distinct in unique indexes.
create unique index if not exists transactions_user_series_date_key
  on transactions (user_id, series_id, date);

create table if not exists recurring_tombstones (
  id text not null primary key,
  user_id text not null references "user" ("id") on delete cascade,
  series_id text not null,
  date text not null,
  created_at timestamptz not null default current_timestamp,
  unique (user_id, series_id, date)
);

create index if not exists recurring_tombstones_user_idx on recurring_tombstones (user_id);
