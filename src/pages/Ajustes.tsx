import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const settingsLinks = [
  { name: "Cuentas", path: "/ajustes/cuentas" },
  { name: "Categorías", path: "/ajustes/categorias" },
  { name: "Pagos Recurrentes", path: "/ajustes/recurrentes" },
  { name: "Créditos", path: "/ajustes/creditos" },
  { name: "Macros", path: "/ajustes/macros" },
  { name: "Respaldo", path: "/ajustes/backup" },
];

const Ajustes = () => {

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Ajustes — Finanzas Local-First</title>
        <meta name="description" content="Gestiona cuentas, categorías, recurrentes, créditos, macros y respaldo de datos." />
        <link rel="canonical" href="/ajustes" />
      </Helmet>

      <Card>
        <nav>
          <ul className="divide-y">
            {settingsLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="flex items-center justify-between p-4 hover:bg-accent transition-colors"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Card>
    </div>
  );
};

export default Ajustes;
