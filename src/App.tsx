import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import CommandePublique from "./pages/CommandePublique";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import NotFound from "./pages/NotFound";
import { CookieConsent } from "./components/CookieConsent";

const queryClient = new QueryClient();

const G = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <ModuleGuard moduleId={id}>{children}</ModuleGuard>
);

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
            <Route path="*" element={
              <ProtectedRoute>
                <AuditParamsProvider>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/controle-caisse" element={<ControleCaisse />} />
                      <Route path="/stocks" element={<G id="stocks"><Stocks /></G>} />
                      <Route path="/rapprochement" element={<G id="rapprochement"><RapprochementBancaire /></G>} />
                      <Route path="/regies" element={<G id="regies"><Regies /></G>} />
                      <Route path="/verification" element={<G id="verification"><Verification /></G>} />
                      <Route path="/ordonnateur" element={<G id="ordonnateur"><Ordonnateur /></G>} />
                      <Route path="/droits-constates" element={<G id="droits-constates"><DroitsConstates /></G>} />
                      <Route path="/depenses" element={<G id="depenses"><Depenses /></G>} />
                      <Route path="/depenses/liquidation" element={<G id="depenses"><Depenses /></G>} />
                      <Route path="/depenses/pieces" element={<G id="depenses"><Depenses /></G>} />
                      <Route path="/voyages" element={<G id="voyages"><Voyages /></G>} />
                      <Route path="/bourses" element={<Bourses />} />
                      <Route path="/fonds-sociaux" element={<FondsSociaux />} />
                      <Route path="/restauration" element={<G id="restauration"><Restauration /></G>} />
                      <Route path="/analyse-financiere" element={<G id="analyse-financiere"><AnalyseFinanciere /></G>} />
                      <Route path="/fonds-roulement" element={<G id="fonds-roulement"><FondsRoulement /></G>} />
                      <Route path="/recouvrement" element={<G id="recouvrement"><Recouvrement /></G>} />
                      <Route path="/marches" element={<G id="marches"><Marches /></G>} />
                      <Route path="/subventions" element={<G id="subventions"><Subventions /></G>} />
                      <Route path="/budgets-annexes" element={<G id="budgets-annexes"><BudgetsAnnexes /></G>} />
                      <Route path="/cartographie" element={<G id="cartographie"><CartographieRisques /></G>} />
                      <Route path="/organigramme" element={<G id="organigramme"><OrganigrammePage /></G>} />
                      <Route path="/plan-action" element={<G id="plan-action"><PlanAction /></G>} />
                      <Route path="/plan-controle" element={<G id="plan-controle"><PlanControle /></G>} />
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
