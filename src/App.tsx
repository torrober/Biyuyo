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
import { Home, Zap, List, Settings, Plus, Tag, CreditCard, Wallet, X } from "lucide-react";
import Header from "./components/Header";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const queryClient = new QueryClient();

// Custom hook for swipe down gesture
const useSwipeDown = (onSwipeDown: () => void) => {
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startY = touch.clientY;
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const currentY = touch.clientY;
      const deltaY = currentY - startY;
      
      // If swiped down more than 100px, trigger close
      if (deltaY > 100) {
        onSwipeDown();
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
  };
  
  return handleTouchStart;
};

const App = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const handleSwipeDown = () => {
    setIsSheetOpen(false);
  };
  
  const handleTouchStart = useSwipeDown(handleSwipeDown);

  return (
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
              <footer className="fixed bottom-0 inset-x-0 z-50 glass-bar border-t-[hsl(var(--fab-ring))]">
                <nav className="container relative pt-0 pb-1">
                  {/* Botón de inicio central */}

                  {/* Home centrado absolutamente */}
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-20">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Abrir acciones rápidas" className="fab-btn border-t-2 border-t-[hsl(var(--fab-ring))]">
                          <Plus className="h-12 w-12" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="rounded-t-2xl p-5 pb-8">
                        <div 
                          className="flex justify-center cursor-grab active:cursor-grabbing" 
                          aria-hidden
                          onTouchStart={handleTouchStart}
                        >
                          <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
                        </div>
                        <div className="w-full max-w-md mx-auto">
                          <div className="flex items-center justify-between pb-2">
                            <span className="text-lg font-bold">Acciones rápidas</span>
                            <SheetClose asChild>
                              <Button variant="ghost" size="icon" aria-label="Cerrar acciones rápidas">
                                <X className="h-4 w-4" />
                              </Button>
                            </SheetClose>
                          </div>
                        </div>
                         <div className="w-full max-w-md mx-auto space-y-3">
                          <SheetClose asChild>
                            <Button asChild variant="outline" className="w-full justify-between">
                              <Link to="/transacciones?new=1" aria-label="Crear nueva transacción" className="flex w-full items-center justify-between">
                                <span className="text-sm">Crear nueva Transacción</span>
                                <Wallet className="h-4 w-4 opacity-70" />
                              </Link>
                            </Button>
                          </SheetClose>
                          <SheetClose asChild>
                            <Button asChild variant="outline" className="w-full justify-between">
                              <Link to="/ajustes/categorias" aria-label="Crear nueva categoría" className="flex w-full items-center justify-between">
                                <span className="text-sm">Crear nueva Categoría</span>
                                <Tag className="h-4 w-4 opacity-70" />
                              </Link>
                            </Button>
                          </SheetClose>
                          <SheetClose asChild>
                            <Button asChild variant="outline" className="w-full justify-between">
                              <Link to="/ajustes/creditos" aria-label="Crear nuevo crédito" className="flex w-full items-center justify-between">
                                <span className="text-sm">Crear nuevo Crédito</span>
                                <CreditCard className="h-4 w-4 opacity-70" />
                              </Link>
                            </Button>
                          </SheetClose>
                          <SheetClose asChild>
                            <Button asChild variant="outline" className="w-full justify-between">
                              <Link to="/ajustes/macros" aria-label="Crear nueva macro" className="flex w-full items-center justify-between">
                                <span className="text-sm">Crear nueva Macro</span>
                                <Zap className="h-4 w-4 opacity-70" />
                              </Link>
                            </Button>
                          </SheetClose>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>

                  {/* Barra de navegación */}
                  <div className="grid grid-cols-5 items-center gap-6">
                    <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center justify-center py-1.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} aria-label="Inicio" title="Inicio">
                      <Home className="h-5 w-5" />
                      <span className="text-[11px] leading-none">Inicio</span>
                    </NavLink>
                    <NavLink to="/transacciones" className={({ isActive }) => `flex flex-col items-center justify-center py-1.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} aria-label="Transacciones" title="Transacciones">
                      <List className="h-5 w-5" />
                      <span className="text-[11px] leading-none">Trans</span>
                    </NavLink>
                    {/* Espacio central reservado para el FAB */}
                    <div aria-hidden />
                    <NavLink to="/macros" className={({ isActive }) => `flex flex-col items-center justify-center py-1.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} aria-label="Macros" title="Macros">
                      <Zap className="h-5 w-5" />
                      <span className="text-[11px] leading-none">Macros</span>
                    </NavLink>
                    <NavLink to="/ajustes" className={({ isActive }) => `flex flex-col items-center justify-center py-1.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} aria-label="Ajustes" title="Ajustes">
                      <Settings className="h-5 w-5" />
                      <span className="text-[11px] leading-none">Ajustes</span>
                    </NavLink>
                  </div>
                </nav>
              </footer>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
