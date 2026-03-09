import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AuditParamsProvider } from "@/contexts/AuditParamsContext";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
import CommandePublique from "./pages/CommandePublique";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={
              <ProtectedRoute>
                <AuditParamsProvider>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/controle-caisse" element={<ControleCaisse />} />
                      <Route path="/stocks" element={<Stocks />} />
                      <Route path="/rapprochement" element={<RapprochementBancaire />} />
                      <Route path="/regies" element={<Regies />} />
                      <Route path="/verification" element={<Verification />} />
                      <Route path="/ordonnateur" element={<Ordonnateur />} />
                      <Route path="/droits-constates" element={<DroitsConstates />} />
                      <Route path="/depenses" element={<Depenses />} />
                      <Route path="/depenses/liquidation" element={<Depenses />} />
                      <Route path="/depenses/pieces" element={<Depenses />} />
                      <Route path="/voyages" element={<Voyages />} />
                      <Route path="/bourses" element={<Bourses />} />
                      <Route path="/fonds-sociaux" element={<FondsSociaux />} />
                      <Route path="/restauration" element={<Restauration />} />
                      <Route path="/analyse-financiere" element={<AnalyseFinanciere />} />
                      <Route path="/fonds-roulement" element={<FondsRoulement />} />
                      <Route path="/recouvrement" element={<Recouvrement />} />
                      <Route path="/marches" element={<Marches />} />
                      <Route path="/subventions" element={<Subventions />} />
                      <Route path="/budgets-annexes" element={<BudgetsAnnexes />} />
                      <Route path="/cartographie" element={<CartographieRisques />} />
                      <Route path="/organigramme" element={<OrganigrammePage />} />
                      <Route path="/plan-action" element={<PlanAction />} />
                      <Route path="/plan-controle" element={<PlanControle />} />
                      <Route path="/pv-audit" element={<PVAudit />} />
                      <Route path="/annexe-comptable" element={<AnnexeComptable />} />
                      <Route path="/piste-audit" element={<PisteAudit />} />
                      <Route path="/parametres" element={<Parametres />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </AuditParamsProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
