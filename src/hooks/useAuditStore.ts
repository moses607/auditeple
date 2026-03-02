import { useState, useCallback } from 'react';
import { loadState, saveState } from '@/lib/store';
import { AuditParams, DEFAULT_AUDIT_PARAMS } from '@/lib/types';

export function useAuditParams() {
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

  return { params, update, reset };
}
