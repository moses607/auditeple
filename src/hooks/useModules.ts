import { useState, useEffect, useCallback } from 'react';
import { getModules, saveModules, ModuleConfig } from '@/lib/audit-modules';

/** React hook to keep module list in sync across components */
export function useModules(): [ModuleConfig[], (modules: ModuleConfig[]) => void] {
  const [modules, setModules] = useState<ModuleConfig[]>(() => getModules());

  useEffect(() => {
    const handler = () => setModules(getModules());
    window.addEventListener('modules-changed', handler);
    return () => window.removeEventListener('modules-changed', handler);
  }, []);

  const updateModules = useCallback((updated: ModuleConfig[]) => {
    setModules(updated);
    saveModules(updated);
  }, []);

  return [modules, updateModules];
}
