import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type SyncContextValue = {
  isSyncingFromCloud: boolean;
  setSyncingFromCloud: (value: boolean) => void;
  isSyncingToCloud: boolean;
  setSyncingToCloud: (value: boolean) => void;
};

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isSyncingFromCloud, setSyncingFromCloud] = useState(false);
  const [isSyncingToCloud, setSyncingToCloud] = useState(false);
  const setFrom = useCallback((value: boolean) => setSyncingFromCloud(value), []);
  const setTo = useCallback((value: boolean) => setSyncingToCloud(value), []);
  return (
    <SyncContext.Provider
      value={{
        isSyncingFromCloud,
        setSyncingFromCloud: setFrom,
        isSyncingToCloud,
        setSyncingToCloud: setTo,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncFromCloud(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    return {
      isSyncingFromCloud: false,
      setSyncingFromCloud: () => {},
      isSyncingToCloud: false,
      setSyncingToCloud: () => {},
    };
  }
  return ctx;
}
