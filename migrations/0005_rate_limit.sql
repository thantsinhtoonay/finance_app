-- Better Auth rate limiting (brute-force protection on sign-in/sign-up/reset).
-- `storage: "database"` in server.ts reads/writes this table; the default name
-- and columns come from Better Auth's Kysely dialect.
create table if not exists "rateLimit" (
  "id" text not null primary key,
  "key" text,
  "count" integer,
  "lastRequest" bigint not null
);
