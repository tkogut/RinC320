import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RinstrumMonitorPage from "./pages/RinstrumMonitorPage";
import ConfigurationsPage from "./pages/configurations/ConfigurationsPage";
import NewConfigurationPage from "./pages/configurations/NewConfigurationPage";
import MonitorPage from "./pages/monitor/MonitorPage";
import MainLayout from "./components/layout/MainLayout";
import DevicesPage from "./pages/devices/DevicesPage";
import HostsPage from "./pages/hosts/HostsPage";
import GroupsPage from "./pages/groups/GroupsPage";
import TemplatesPage from "./pages/templates/TemplatesPage";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/monitor/rinstrum" element={<RinstrumMonitorPage />} />
    <Route path="/monitor/:configId" element={<MonitorPage />} />
    <Route path="/configurations" element={<ConfigurationsPage />} />
    <Route path="/configurations/new" element={<NewConfigurationPage />} />
    <Route path="/devices" element={<DevicesPage />} />
    <Route path="/hosts" element={<HostsPage />} />
    <Route path="/groups" element={<GroupsPage />} />
    <Route path="/templates" element={<TemplatesPage />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;