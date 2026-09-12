import { createFileRoute, redirect } from "@tanstack/react-router";
import { Dashboard } from "@/components/budget/dashboard";
import { AuthGate } from "@/components/auth/auth-gate";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth/server";

const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  try {
    const session = await auth.api.getSession({ headers });
    return session;
  } catch {
    return null;
  }
});

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: Home,
});

function Home() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
