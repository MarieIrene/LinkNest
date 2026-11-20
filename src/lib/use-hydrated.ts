"use client";

import { useEffect, useState } from "react";

/**
 * False until the page's JavaScript has loaded. Forms use it to keep their submit
 * button disabled, so an early click can't trigger a plain page reload that
 * clears what the person typed.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
