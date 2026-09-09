import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/budget/dashboard";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
