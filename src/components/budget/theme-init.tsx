import { useEffect } from "react";
import { initTheme } from "@/lib/settings/store";

export function ThemeInit() {
  useEffect(() => {
    initTheme();
  }, []);

  return null;
}
