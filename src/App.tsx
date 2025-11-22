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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/monitor/rinstrum" element={<RinstrumMonitorPage />} />
          <Route path="/monitor/:configId" element={<MonitorPage />} />
          <Route path="/configurations" element={<ConfigurationsPage />} />
          <Route path="/configurations/new" element={<NewConfigurationPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;