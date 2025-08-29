import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TestPage from "./pages/TestPage";
import NotFound from "./pages/NotFound";
import TriageAI from "./components/TriageAI";
import SimpleTriage from "./components/SimpleTriage";
import TestComponent from "./components/TestComponent";
import BasicTest from "./components/BasicTest";
import TriageSymptomInput from "./pages/TriageSymptomInput";
import TriageChat from "./pages/TriageChat";
import TriageResults from "./pages/TriageResults";
import TriageResources from "./pages/TriageResources";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/triage-ai" element={<TestComponent />} />
          <Route path="/simple-triage" element={<SimpleTriage />} />
          <Route path="/test-component" element={<TestComponent />} />
          <Route path="/basic-test" element={<BasicTest />} />
          
          {/* TRIAGE A.I. Routes */}
          <Route path="/triage-input" element={<TriageSymptomInput />} />
          <Route path="/triage-chat" element={<TriageChat />} />
          <Route path="/triage-results" element={<TriageResults />} />
          <Route path="/triage-resources" element={<TriageResources />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
