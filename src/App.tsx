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
import ThemeToggle from "./components/ThemeToggle";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
              <div className="container flex h-14 items-center justify-between">
                <nav className="flex items-center gap-6 text-sm">
                  <NavLink to="/" end className={({ isActive }) => isActive ? "story-link text-primary" : "story-link text-foreground/80"}>Dashboard</NavLink>
                  <NavLink to="/macros" className={({ isActive }) => isActive ? "story-link text-primary" : "story-link text-foreground/80"}>Macros</NavLink>
                  <NavLink to="/transacciones" className={({ isActive }) => isActive ? "story-link text-primary" : "story-link text-foreground/80"}>Transacciones</NavLink>
                  <NavLink to="/ajustes" className={({ isActive }) => isActive ? "story-link text-primary" : "story-link text-foreground/80"}>Ajustes</NavLink>
                </nav>
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 container py-6">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/macros" element={<Macros />} />
                <Route path="/transacciones" element={<Transacciones />} />
                <Route path="/ajustes" element={<Ajustes />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
