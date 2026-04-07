import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loadGlobalState, saveGlobalState, setCurrentUAI } from '@/lib/store';
import { AuditParams, DEFAULT_AUDIT_PARAMS, getSelectedEtablissement } from '@/lib/types';

interface AuditParamsContextValue {
  params: AuditParams;
  update: (partial: Partial<AuditParams>) => void;
  reset: () => void;
}

const AuditParamsContext = createContext<AuditParamsContextValue | null>(null);

export function AuditParamsProvider({ children }: { children: React.ReactNode }) {
  const [params, setParams] = useState<AuditParams>(() => {
    const p = loadGlobalState('params', DEFAULT_AUDIT_PARAMS);
    // Set initial UAI context
    const etab = p.etablissements.find(e => e.id === p.selectedEtablissementId);
    if (etab?.uai) setCurrentUAI(etab.uai);
    return p;
  });

  // Sync UAI context whenever selected establishment changes
  useEffect(() => {
    const etab = getSelectedEtablissement(params);
    setCurrentUAI(etab?.uai || '');
  }, [params.selectedEtablissementId, params.etablissements]);

  const update = useCallback((partial: Partial<AuditParams>) => {
    setParams(prev => {
      const next = { ...prev, ...partial };
      saveGlobalState('params', next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setParams(DEFAULT_AUDIT_PARAMS);
    saveGlobalState('params', DEFAULT_AUDIT_PARAMS);
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
