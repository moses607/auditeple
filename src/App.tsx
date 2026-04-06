import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AuditParamsProvider } from "@/contexts/AuditParamsContext";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoader } from "@/components/PageLoader";
import { CookieConsent } from "./components/CookieConsent";
import { ThemeProvider } from "next-themes";

// ─── Lazy-loaded pages ──────────────────────────────────────────
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Parametres = lazy(() => import("./pages/Parametres"));
const Verification = lazy(() => import("./pages/Verification"));
const Ordonnateur = lazy(() => import("./pages/Ordonnateur"));
const DroitsConstates = lazy(() => import("./pages/DroitsConstates"));
const Depenses = lazy(() => import("./pages/Depenses"));
const Voyages = lazy(() => import("./pages/Voyages"));
const Marches = lazy(() => import("./pages/Marches"));
const Regies = lazy(() => import("./pages/Regies"));
const AnnexeComptable = lazy(() => import("./pages/AnnexeComptable"));
const FondsRoulement = lazy(() => import("./pages/FondsRoulement"));
const ControleCaisse = lazy(() => import("./pages/ControleCaisse"));
const Stocks = lazy(() => import("./pages/Stocks"));
const RapprochementBancaire = lazy(() => import("./pages/RapprochementBancaire"));
const Restauration = lazy(() => import("./pages/Restauration"));
const AnalyseFinanciere = lazy(() => import("./pages/AnalyseFinanciere"));
const Recouvrement = lazy(() => import("./pages/Recouvrement"));
const Subventions = lazy(() => import("./pages/Subventions"));
const BudgetsAnnexes = lazy(() => import("./pages/BudgetsAnnexes"));
const CartographieRisques = lazy(() => import("./pages/CartographieRisques"));
const OrganigrammePage = lazy(() => import("./pages/Organigramme"));
const PlanAction = lazy(() => import("./pages/PlanAction"));
const PlanControle = lazy(() => import("./pages/PlanControle"));
const PVAudit = lazy(() => import("./pages/PVAudit"));
const PisteAudit = lazy(() => import("./pages/PisteAudit"));
const Bourses = lazy(() => import("./pages/Bourses"));
const FondsSociaux = lazy(() => import("./pages/FondsSociaux"));

const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ─── Query client ───────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 min
    },
  },
});

// ─── Protected layout wrapper ───────────────────────────────────
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AuditParamsProvider>
        <AppLayout>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </AppLayout>
      </AuditParamsProvider>
    </ProtectedRoute>
  );
}

// ─── App ────────────────────────────────────────────────────────
const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CookieConsent />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
                <Route element={<ProtectedLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="/controle-caisse" element={<ControleCaisse />} />
                  <Route path="/stocks" element={<Stocks />} />
                  <Route path="/rapprochement" element={<RapprochementBancaire />} />
                  <Route path="/regies" element={<Regies />} />
                  <Route path="/verification" element={<Verification />} />
                  <Route path="/ordonnateur" element={<Ordonnateur />} />
                  <Route path="/droits-constates" element={<DroitsConstates />} />
                  <Route path="/depenses/:tab?" element={<Depenses />} />
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
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
