import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-40 glass-bar border-b-[hsl(var(--fab-ring))]"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--statusbar-padding, 0px))' }}
    >
      <div className="container h-12 grid grid-cols-3 items-center">
        <div className="flex items-center">
          {(location.pathname.includes('/ajustes/') || location.pathname === '/flujo-de-caja') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="justify-self-center font-semibold tracking-wide">
          {location.pathname === '/' && 'Biyuyo'}
          {location.pathname === '/ajustes' && 'Ajustes'}
          {location.pathname === '/ajustes/cuentas' && 'Cuentas'}
          {location.pathname === '/ajustes/categorias' && 'Categorías'}
          {location.pathname === '/ajustes/recurrentes' && 'Pagos Recurrentes'}
          {location.pathname === '/ajustes/creditos' && 'Créditos'}
          {location.pathname === '/ajustes/macros' && 'Macros'}
          {location.pathname === '/ajustes/backup' && 'Respaldo'}
          {location.pathname === '/transacciones' && 'Transacciones'}
          {location.pathname === '/macros' && 'Macros'}
          {location.pathname === '/flujo-de-caja' && 'Flujo de caja'}
        </div>
        <div className="justify-self-end"><ThemeToggle /></div>
      </div>
    </header>
  );
};

export default Header;
