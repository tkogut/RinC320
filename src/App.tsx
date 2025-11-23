import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import RinstrumMonitorPage from "./pages/RinstrumMonitorPage";
import ConfigurationsPage from "./pages/configurations/ConfigurationsPage";
import MonitorPage from "./pages/monitor/MonitorPage";
import MainLayout from "./components/layout/MainLayout";
import DevicesPage from "./pages/devices/DevicesPage";
import HostsPage from "./pages/hosts/HostsPage";
import GroupsPage from "./pages/groups/GroupsPage";
import TemplatesPage from "./pages/templates/TemplatesPage";
import { AppProvider } from "./context/AppContext";
import DashboardPage from "./pages/DashboardPage";
import ComingSoonPage from "./pages/ComingSoonPage";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<DashboardPage />} />
    
    {/* Legacy Monitor */}
    <Route path="/monitor/rinstrum" element={<RinstrumMonitorPage />} />

    {/* New App Routes */}
    <Route path="/scales-indications" element={<ComingSoonPage />} />
    <Route path="/weighing-list" element={<ComingSoonPage />} />
    <Route path="/pins" element={<ComingSoonPage />} />
    <Route path="/order" element={<ComingSoonPage />} />
    <Route path="/recipe/:uuid" element={<ComingSoonPage />} />
    <Route path="/raw-material" element={<ComingSoonPage />} />
    <Route path="/raw-material-report" element={<ComingSoonPage />} />
    <Route path="/scale-chart/:uuid" element={<ComingSoonPage />} />
    <Route path="/auto-weighings/:uuid" element={<ComingSoonPage />} />
    <Route path="/changes-of-states/:uuid" element={<ComingSoonPage />} />

    {/* Configuration Routes */}
    <Route path="/hosts" element={<HostsPage />} />
    <Route path="/scales" element={<ConfigurationsPage />} />
    <Route path="/printers" element={<ComingSoonPage />} />
    <Route path="/io" element={<DevicesPage />} />
    <Route path="/group-templates" element={<TemplatesPage />} />
    <Route path="/groups" element={<GroupsPage />} />
    <Route path="/monitor/:configId" element={<MonitorPage />} />
    
    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AppProvider>
          <MainLayout>
            <AppRoutes />
          </MainLayout>
        </AppProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;