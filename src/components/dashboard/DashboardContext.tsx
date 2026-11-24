"use client";

import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react";
import type { DashboardLink, DashboardProfile } from "@/lib/types";

type DashboardState = {
  profile: DashboardProfile;
  setProfile: Dispatch<SetStateAction<DashboardProfile>>;
  links: DashboardLink[];
  setLinks: Dispatch<SetStateAction<DashboardLink[]>>;
  appUrl: string;
  isAdmin: boolean;
};

const Ctx = createContext<DashboardState | null>(null);

/**
 * Holds the signed-in user's profile and links for every dashboard page. It lives in
 * the dashboard layout, so moving between Overview, Links, Profile and Settings keeps
 * the data (and any edits) without reloading.
 */
export function DashboardProvider({
  initialProfile, initialLinks, appUrl, isAdmin, children,
}: { initialProfile: DashboardProfile; initialLinks: DashboardLink[]; appUrl: string; isAdmin: boolean; children: React.ReactNode }) {
  const [profile, setProfile] = useState(initialProfile);
  const [links, setLinks] = useState(initialLinks);
  return <Ctx.Provider value={{ profile, setProfile, links, setLinks, appUrl, isAdmin }}>{children}</Ctx.Provider>;
}

export function useDashboard() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return value;
}
