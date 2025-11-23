import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import IndexPage from "./pages/Index"; // Import the new test page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AppProvider>
          {/* Temporarily removed MainLayout to simplify */}
          <Routes>
            <Route path="/" element={<IndexPage />} />
          </Routes>
        </AppProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;