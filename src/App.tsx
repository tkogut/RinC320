import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import ConfigurationsPage from "./pages/configurations/ConfigurationsPage";
import HostsPage from "./pages/hosts/HostsPage";
import DevicesPage from "./pages/devices/DevicesPage";
import GroupsPage from "./pages/groups/GroupsPage";
import TemplatesPage from "./pages/templates/TemplatesPage";
import MonitorPage from "./pages/monitor/MonitorPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import NotFound from "./pages/NotFound";
import PrintersPage from "./pages/printers/PrintersPage";
import IndicationsPage from "./pages/indications/IndicationsPage";
import WeighingListPage from "./pages/weighing-list/WeighingListPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AppProvider>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Scales Category */}
              <Route path="/scales" element={<ConfigurationsPage />} />
              <Route path="/scales/monitor/:configId" element={<MonitorPage />} />
              <Route path="/hosts" element={<HostsPage />} />
              <Route path="/printers" element={<PrintersPage />} />
              
              {/* I/O Sub-category */}
              <Route path="/io" element={<DevicesPage />} />
              <Route path="/group-templates" element={<TemplatesPage />} />
              <Route path="/groups" element={<GroupsPage />} />

              {/* Other top-level items */}
              <Route path="/scales-indications" element={<IndicationsPage />} />
              <Route path="/weighing-list" element={<WeighingListPage />} />
              <Route path="/pins" element={<ComingSoonPage />} />

              {/* Dosing Category */}
              <Route path="/order" element={<ComingSoonPage />} />
              <Route path="/recipe/:id" element={<ComingSoonPage />} />
              <Route path="/raw-material" element={<ComingSoonPage />} />
              <Route path="/raw-material-report" element={<ComingSoonPage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </AppProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;