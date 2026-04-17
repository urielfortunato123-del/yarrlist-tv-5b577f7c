import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { toast } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useForceUpdate } from "./hooks/useForceUpdate";

const queryClient = new QueryClient();

const App = () => {
  useForceUpdate();

  useEffect(() => {
    const handler = () => {
      toast("⚓ App atualizado!", {
        description: "Uma nova versão do Âncora TV foi instalada automaticamente.",
        duration: 5000,
      });
    };
    window.addEventListener("ancora-app-updated", handler);
    return () => window.removeEventListener("ancora-app-updated", handler);
  }, []);

  // Also check on mount if we just updated
  useEffect(() => {
    if (sessionStorage.getItem("ancora-updated") === "true") {
      sessionStorage.removeItem("ancora-updated");
      setTimeout(() => {
        toast("⚓ App atualizado!", {
          description: "Uma nova versão do Âncora TV foi instalada automaticamente.",
          duration: 5000,
        });
      }, 1500);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
