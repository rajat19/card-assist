import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CompareProvider } from "./contexts/CompareContext";
import { CompareBar } from "./components/CompareBar";
import { CompareDialog } from "./components/CompareDialog";

const queryClient = new QueryClient();

const CompareApp = () => {
  const [compareOpen, setCompareOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CompareBar onCompareClick={() => setCompareOpen(true)} />
      <CompareDialog open={compareOpen} onOpenChange={setCompareOpen} />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CompareProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL || "/card-assist/"}>
          <CompareApp />
        </BrowserRouter>
      </TooltipProvider>
    </CompareProvider>
  </QueryClientProvider>
);

export default App;
