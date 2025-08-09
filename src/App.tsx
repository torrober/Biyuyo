import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Macros from "./pages/Macros";
import Transacciones from "./pages/Transacciones";
import Ajustes from "./pages/Ajustes";
import AccountsSettings from "./pages/settings/Accounts";
import CategoriesSettings from "./pages/settings/Categories";
import RecurringsSettings from "./pages/settings/Recurrings";
import CreditsSettings from "./pages/settings/Credits";
import MacrosSettings from "./pages/settings/Macros";
import BackupSettings from "./pages/settings/Backup";
import { Home, Zap, List, Settings, Plus, Tag, CreditCard, Wallet } from "lucide-react";
import Header from "./components/Header";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container py-6 pb-20">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/macros" element={<Macros />} />
                <Route path="/transacciones" element={<Transacciones />} />
                <Route path="/ajustes" element={<Ajustes />} />
                <Route path="/ajustes/cuentas" element={<AccountsSettings />} />
                <Route path="/ajustes/categorias" element={<CategoriesSettings />} />
                <Route path="/ajustes/recurrentes" element={<RecurringsSettings />} />
                <Route path="/ajustes/creditos" element={<CreditsSettings />} />
                <Route path="/ajustes/macros" element={<MacrosSettings />} />
                <Route path="/ajustes/backup" element={<BackupSettings />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <div className="fixed bottom-24 right-4 z-50">
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="icon" aria-label="Abrir acciones rápidas" className="h-14 w-14 rounded-full hover-scale">
                    <Plus className="h-6 w-6" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-2 space-y-1">
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link to="/transacciones" aria-label="Crear nueva transacción" className="flex w-full items-center justify-between">
                      <span className="text-sm">Crear nueva Transacción</span>
                      <Wallet className="h-4 w-4 opacity-70" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link to="/ajustes/categorias" aria-label="Crear nueva categoría" className="flex w-full items-center justify-between">
                      <span className="text-sm">Crear nueva Categoría</span>
                      <Tag className="h-4 w-4 opacity-70" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link to="/ajustes/creditos" aria-label="Crear nuevo crédito" className="flex w-full items-center justify-between">
                      <span className="text-sm">Crear nuevo Crédito</span>
                      <CreditCard className="h-4 w-4 opacity-70" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link to="/ajustes/macros" aria-label="Crear nueva macro" className="flex w-full items-center justify-between">
                      <span className="text-sm">Crear nueva Macro</span>
                      <Zap className="h-4 w-4 opacity-70" />
                    </Link>
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
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
