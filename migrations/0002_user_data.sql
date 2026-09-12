create table if not exists "transactions" (
  "id" text not null primary key,
  "user_id" text not null references "user" ("id") on delete cascade,
  "type" text not null check ("type" in ('income', 'expense')),
  "amount" numeric not null check ("amount" >= 0),
  "category" text not null,
  "date" text not null,
  "note" text not null default '',
  "recurring" text check ("recurring" in ('weekly', 'biweekly', 'monthly', 'yearly')),
  "created_at" timestamptz not null default CURRENT_TIMESTAMP
);

create index if not exists "transactions_userId_idx" on "transactions" ("user_id");
create index if not exists "transactions_userId_date_idx" on "transactions" ("user_id", "date");

create table if not exists "category_budgets" (
  "id" text not null primary key,
  "user_id" text not null references "user" ("id") on delete cascade,
  "category_id" text not null,
  "budget_limit" numeric not null check ("budget_limit" >= 0),
  "created_at" timestamptz not null default CURRENT_TIMESTAMP,
  unique ("user_id", "category_id")
);

create index if not exists "category_budgets_userId_idx" on "category_budgets" ("user_id");

create table if not exists "user_settings" (
  "user_id" text not null primary key references "user" ("id") on delete cascade,
  "monthly_goal" numeric not null default 0 check ("monthly_goal" >= 0),
  "created_at" timestamptz not null default CURRENT_TIMESTAMP,
  "updated_at" timestamptz not null default CURRENT_TIMESTAMP
);
