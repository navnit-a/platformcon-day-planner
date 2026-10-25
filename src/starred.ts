import { useCallback, useState } from "react";
import type { Session } from "./sessions";

const KEY = "platformcon-starred";

export function sessionId(session: Session): string {
  return `${session.time}|${session.track}|${session.title}`;
}

function read(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

export function useStarred() {
  const [starred, setStarred] = useState(read);

  const toggle = useCallback((id: string) => {
    setStarred((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        return next;
      }
      return next;
    });
  }, []);

  return { starred, toggle };
}
