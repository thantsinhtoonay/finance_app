import { useEffect, useLayoutEffect, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Dashboard } from "@/components/budget/dashboard";
import { AuthGate } from "@/components/auth/auth-gate";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth/server";
import { initDisplayCurrency } from "@/lib/settings/store";

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

// useLayoutEffect warns during SSR — effects never run on the server anyway.
const useClientLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function Home() {
  // SSR always renders the MMK default, but the settings store rehydrates on
  // the client with the user's persisted currency. This subtree's first
  // (hydration) render must stay the server's MMK text — so apply the real
  // currency in a layout effect afterwards, then re-render before paint.
  const [, setCurrencyReady] = useState(0);
  useClientLayoutEffect(() => {
    initDisplayCurrency();
    setCurrencyReady((n) => n + 1);
  }, []);

  return (
    <main>
      <Dashboard />
    </main>
  );
}
