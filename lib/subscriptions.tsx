// Phase 4: shared, reactive store for the user's owned subscriptions.
//
// Loads the owned service ids from storage once on mount and keeps them in
// React state so both the My Subscriptions screen (which edits them) and the
// verdict screen (which reads them) stay in sync. Every change is written
// through to AsyncStorage.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadOwnedServiceIds, saveOwnedServiceIds } from "./storage";

interface SubscriptionsValue {
  ready: boolean; // false until the initial load finishes
  ownedIds: ReadonlySet<string>;
  isOwned: (id: string) => boolean;
  toggle: (id: string) => void;
}

const SubscriptionsContext = createContext<SubscriptionsValue | null>(null);

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    loadOwnedServiceIds().then((ids) => {
      if (active) {
        setOwnedIds(new Set(ids));
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<SubscriptionsValue>(() => {
    const isOwned = (id: string) => ownedIds.has(id);
    const toggle = (id: string) => {
      setOwnedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        void saveOwnedServiceIds([...next]);
        return next;
      });
    };
    return { ready, ownedIds, isOwned, toggle };
  }, [ready, ownedIds]);

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions(): SubscriptionsValue {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx) {
    throw new Error("useSubscriptions must be used within a SubscriptionsProvider");
  }
  return ctx;
}
