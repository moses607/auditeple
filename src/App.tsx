import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/parametres" element={<Parametres />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/ordonnateur" element={<Ordonnateur />} />
            <Route path="/droits-constates" element={<DroitsConstates />} />
            <Route path="/depenses" element={<Depenses />} />
            <Route path="/depenses/liquidation" element={<Depenses />} />
            <Route path="/depenses/pieces" element={<Depenses />} />
            <Route path="/voyages" element={<Voyages />} />
            <Route path="/marches" element={<Marches />} />
            <Route path="/regies" element={<Regies />} />
            <Route path="/annexe-comptable" element={<AnnexeComptable />} />
            <Route path="/fonds-roulement" element={<FondsRoulement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
