import { Navigate } from 'react-router-dom';
import { isModuleEnabled } from '@/lib/audit-modules';

interface ModuleGuardProps {
  moduleId: string;
  children: React.ReactNode;
}

/** Redirects to dashboard if the module is disabled */
export function ModuleGuard({ moduleId, children }: ModuleGuardProps) {
  if (!isModuleEnabled(moduleId)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
