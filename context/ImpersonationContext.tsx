"use client";

import { createContext, useContext, useState } from "react";

type ImpersonationContextType = {
  impersonatedUserId: string | null;
  impersonate: (id: string) => void;
  stop: () => void;
};

const ImpersonationContext = createContext<ImpersonationContextType | null>(null);

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(
    typeof window !== "undefined"
      ? localStorage.getItem("impersonate")
      : null
  );

  function impersonate(id: string) {
    localStorage.setItem("impersonate", id);
    setImpersonatedUserId(id);
  }

  function stop() {
    localStorage.removeItem("impersonate");
    setImpersonatedUserId(null);
  }

  return (
    <ImpersonationContext.Provider value={{ impersonatedUserId, impersonate, stop }}>
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const ctx = useContext(ImpersonationContext);
  if (!ctx) throw new Error("useImpersonation must be used inside provider");
  return ctx;
}
