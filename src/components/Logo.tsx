import Link from "next/link";
import { APP_NAME } from "@/lib/site";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 rounded-lg" aria-label={`${APP_NAME} home`}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={dark ? "#5EEAD4" : "#164E63"} />
        <rect x="7" y="9" width="18" height="5" rx="2.5" fill={dark ? "#164E63" : "#5EEAD4"} />
        <rect x="7" y="18" width="18" height="5" rx="2.5" fill={dark ? "#164E63" : "#5EEAD4"} opacity=".55" />
      </svg>
      <span className={`font-display text-xl font-bold tracking-tight ${dark ? "text-white" : "text-primary"}`}>
        {APP_NAME}
      </span>
    </Link>
  );
}
