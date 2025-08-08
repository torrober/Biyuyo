import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Macros from "./pages/Macros";
import Transacciones from "./pages/Transacciones";
import Ajustes from "./pages/Ajustes";
import { Home, Zap, List, Settings } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 container py-6 pb-20">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/macros" element={<Macros />} />
                <Route path="/transacciones" element={<Transacciones />} />
                <Route path="/ajustes" element={<Ajustes />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <footer className="fixed bottom-0 inset-x-0 z-50 bg-background/90 backdrop-blur border-t">
              <nav className="container grid grid-cols-4">
                <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center justify-center py-2.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} aria-label="Dashboard" title="Dashboard">
                  <Home className="h-5 w-5" />
                  <span className="text-[11px] leading-none">Inicio</span>
                </NavLink>
                <NavLink to="/macros" className={({ isActive }) => `flex flex-col items-center justify-center py-2.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} aria-label="Macros" title="Macros">
                  <Zap className="h-5 w-5" />
                  <span className="text-[11px] leading-none">Macros</span>
                </NavLink>
                <NavLink to="/transacciones" className={({ isActive }) => `flex flex-col items-center justify-center py-2.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} aria-label="Transacciones" title="Transacciones">
                  <List className="h-5 w-5" />
                  <span className="text-[11px] leading-none">Movs</span>
                </NavLink>
                <NavLink to="/ajustes" className={({ isActive }) => `flex flex-col items-center justify-center py-2.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} aria-label="Ajustes" title="Ajustes">
                  <Settings className="h-5 w-5" />
                  <span className="text-[11px] leading-none">Ajustes</span>
                </NavLink>
              </nav>
            </footer>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
