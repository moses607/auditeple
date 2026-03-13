import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AuditParamsProvider } from "@/contexts/AuditParamsContext";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ModuleGuard } from "@/components/ModuleGuard";

// Pages
import Dashboard from "./pages/Dashboard";
import Parametres from "./pages/Parametres";
import Verification from "./pages/Verification";
import Ordonnateur from "./pages/Ordonnateur";
import DroitsConstates from "./pages/DroitsConstates";
import Depenses from "./pages/Depenses";
import Voyages from "./pages/Voyages";
import Marches from "./pages/Marches";
import Regies from "./pages/Regies";
import AnnexeComptable from "./pages/AnnexeComptable";
import FondsRoulement from "./pages/FondsRoulement";
import ControleCaisse from "./pages/ControleCaisse";
import Stocks from "./pages/Stocks";
import RapprochementBancaire from "./pages/RapprochementBancaire";
import Restauration from "./pages/Restauration";
import AnalyseFinanciere from "./pages/AnalyseFinanciere";
import Recouvrement from "./pages/Recouvrement";
import Subventions from "./pages/Subventions";
import BudgetsAnnexes from "./pages/BudgetsAnnexes";
import CartographieRisques from "./pages/CartographieRisques";
import OrganigrammePage from "./pages/Organigramme";
import PlanAction from "./pages/PlanAction";
import PlanControle from "./pages/PlanControle";
import PVAudit from "./pages/PVAudit";
import PisteAudit from "./pages/PisteAudit";
import Bourses from "./pages/Bourses";
import FondsSociaux from "./pages/FondsSociaux";

import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import NotFound from "./pages/NotFound";
import { CookieConsent } from "./components/CookieConsent";

const queryClient = new QueryClient();

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AuditParamsProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </AuditParamsProvider>
    </ProtectedRoute>
  );
}

function Guard({ id, children }: { id: string; children: React.ReactNode }) {
  return <ModuleGuard moduleId={id}>{children}</ModuleGuard>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CookieConsent />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
            <Route element={<ProtectedLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="/controle-caisse" element={<Guard id="regies"><ControleCaisse /></Guard>} />
              <Route path="/stocks" element={<Guard id="stocks"><Stocks /></Guard>} />
              <Route path="/rapprochement" element={<Guard id="rapprochement"><RapprochementBancaire /></Guard>} />
              <Route path="/regies" element={<Guard id="regies"><Regies /></Guard>} />
              <Route path="/verification" element={<Guard id="verification"><Verification /></Guard>} />
              <Route path="/ordonnateur" element={<Guard id="ordonnateur"><Ordonnateur /></Guard>} />
              <Route path="/droits-constates" element={<Guard id="droits-constates"><DroitsConstates /></Guard>} />
              <Route path="/depenses" element={<Guard id="depenses"><Depenses /></Guard>} />
              <Route path="/depenses/liquidation" element={<Guard id="depenses"><Depenses /></Guard>} />
              <Route path="/depenses/pieces" element={<Guard id="depenses"><Depenses /></Guard>} />
              <Route path="/voyages" element={<Guard id="voyages"><Voyages /></Guard>} />
              <Route path="/bourses" element={<Guard id="droits-constates"><Bourses /></Guard>} />
              <Route path="/fonds-sociaux" element={<Guard id="droits-constates"><FondsSociaux /></Guard>} />
              <Route path="/restauration" element={<Guard id="restauration"><Restauration /></Guard>} />
              <Route path="/analyse-financiere" element={<Guard id="analyse-financiere"><AnalyseFinanciere /></Guard>} />
              <Route path="/fonds-roulement" element={<Guard id="fonds-roulement"><FondsRoulement /></Guard>} />
              <Route path="/recouvrement" element={<Guard id="recouvrement"><Recouvrement /></Guard>} />
              <Route path="/marches" element={<Guard id="marches"><Marches /></Guard>} />
              <Route path="/subventions" element={<Guard id="subventions"><Subventions /></Guard>} />
              <Route path="/budgets-annexes" element={<Guard id="budgets-annexes"><BudgetsAnnexes /></Guard>} />
              <Route path="/cartographie" element={<Guard id="cartographie"><CartographieRisques /></Guard>} />
              <Route path="/organigramme" element={<Guard id="organigramme"><OrganigrammePage /></Guard>} />
              <Route path="/plan-action" element={<Guard id="plan-action"><PlanAction /></Guard>} />
              <Route path="/plan-controle" element={<Guard id="plan-controle"><PlanControle /></Guard>} />
              <Route path="/pv-audit" element={<PVAudit />} />
              <Route path="/annexe-comptable" element={<AnnexeComptable />} />
              <Route path="/piste-audit" element={<PisteAudit />} />
              <Route path="/parametres" element={<Parametres />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
