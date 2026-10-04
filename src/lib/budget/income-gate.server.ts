import { getSql } from "@/lib/db";

type Sql = Awaited<ReturnType<typeof getSql>>;

/**
 * Income-first gate: an expense may only be recorded while at least one OTHER
 * income row exists for the user (the row being edited never counts itself,
 * so converting the last income row to an expense is also blocked).
 */
export async function hasIncomeExcept(
  sql: Sql,
  userId: string,
  excludeId?: string,
): Promise<boolean> {
  const rows = excludeId
    ? await sql.query(
        `SELECT 1 FROM transactions WHERE user_id = $1 AND type = 'income' AND id <> $2 LIMIT 1`,
        [userId, excludeId],
      )
    : await sql.query(
        `SELECT 1 FROM transactions WHERE user_id = $1 AND type = 'income' LIMIT 1`,
        [userId],
      );
  return rows.length > 0;
}

export function incomeRequired(): Response {
  return Response.json(
    {
      error: "income_required",
      message: "Add income before recording expenses",
    },
    { status: 409 },
  );
}
