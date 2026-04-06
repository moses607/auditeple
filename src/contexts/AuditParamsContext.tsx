import React, { createContext, useContext, useState, useCallback } from 'react';
import { loadState, saveState } from '@/lib/store';
import { AuditParams, DEFAULT_AUDIT_PARAMS } from '@/lib/types';

interface AuditParamsContextValue {
  params: AuditParams;
  update: (partial: Partial<AuditParams>) => void;
  reset: () => void;
}

const AuditParamsContext = createContext<AuditParamsContextValue | null>(null);

export function AuditParamsProvider({ children }: { children: React.ReactNode }) {
  const [params, setParams] = useState<AuditParams>(() => loadState('params', DEFAULT_AUDIT_PARAMS));

  const update = useCallback((partial: Partial<AuditParams>) => {
    setParams(prev => {
      const next = { ...prev, ...partial };
      saveState('params', next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setParams(DEFAULT_AUDIT_PARAMS);
    saveState('params', DEFAULT_AUDIT_PARAMS);
  }, []);

  return (
    <AuditParamsContext.Provider value={{ params, update, reset }}>
      {children}
    </AuditParamsContext.Provider>
  );
}

export function useAuditParamsContext() {
  const ctx = useContext(AuditParamsContext);
  if (!ctx) throw new Error('useAuditParamsContext must be used within AuditParamsProvider');
  return ctx;
}
