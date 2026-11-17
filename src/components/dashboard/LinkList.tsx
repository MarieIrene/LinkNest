"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { apiRequest } from "@/lib/client-api";
import type { DashboardLink } from "@/lib/types";
import { LinkRow } from "./LinkRow";

type Props = { links: DashboardLink[]; setLinks: Dispatch<SetStateAction<DashboardLink[]>> };

export function LinkList({ links, setLinks }: Props) {
  const [error, setError] = useState<string | null>(null);

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const previous = links;
    const next = [...links];
    [next[index], next[target]] = [next[target], next[index]];
    setLinks(next);
    setError(null);

    const res = await apiRequest("/api/links/reorder", { method: "PUT", body: { ids: next.map((l) => l.id) } });
    if (!res.ok) {
      setLinks(previous);
      setError(res.error);
    }
  }

  if (links.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line px-5 py-8 text-center text-ink/65">
        Add your first link above. It shows up on your page right away.
      </p>
    );
  }

  return (
    <div>
      {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <ul className="space-y-3">
        {links.map((link, index) => (
          <LinkRow
            key={link.id}
            link={link}
            isFirst={index === 0}
            isLast={index === links.length - 1}
            onMove={(dir) => move(index, dir)}
            onChange={(updated) => setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))}
            onDelete={() => setLinks((prev) => prev.filter((l) => l.id !== link.id))}
          />
        ))}
      </ul>
    </div>
  );
}
