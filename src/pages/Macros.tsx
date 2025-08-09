import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useFinance } from "@/store/finance";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const currency = (n: number) => n.toLocaleString("es-CO", { style: "currency", currency: "COP" });

const Macros = () => {
  const { macroGroups, triggerMacro, deleteTransaction } = useFinance();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<{ groupId: string; macroId: string; amount: number } | null>(null);

  const onQuick = (groupId: string, macroId: string, amount: number) => {
    const id = triggerMacro(macroId, groupId);
    if (!id) return;
    toast({
      title: "Transacción registrada",
      description: "Se agregó el gasto con tu macro.",
      action: (
        <Button variant="secondary" onClick={() => deleteTransaction(id)}>Deshacer</Button>
      )
    });
  };

  const onLongPress = (groupId: string, macroId: string, amount: number) => {
    setPending({ groupId, macroId, amount });
    setOpen(true);
  };

  const [pressTimer, setPressTimer] = useState<number | null>(null);

  const startPress = (cb: () => void) => () => {
    const t = window.setTimeout(cb, 450);
    setPressTimer(t);
  };
  const endPress = () => {
    if (pressTimer) window.clearTimeout(pressTimer);
    setPressTimer(null);
  };

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Macros de gasto — Finanzas Local-First</title>
        <meta name="description" content="Registra gastos comunes al instante con macros personalizadas." />
        <link rel="canonical" href="/macros" />
      </Helmet>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Configuración de Macros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/ajustes/macros" className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Crear nueva macro
            </Link>
          </Button>
        </CardContent>
      </Card>


      {macroGroups.length === 0 && (
        <div className="text-center text-sm text-muted-foreground">
          No hay macros configuradas
        </div>
      )}

      <Accordion type="multiple" className="space-y-3">
        {macroGroups.map((g) => (
          <AccordionItem key={g.id} value={g.id} className="border rounded-md">
            <AccordionTrigger className="px-4">{g.name}</AccordionTrigger>
            <AccordionContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {g.macros.map((m) => (
                  <button
                    key={m.id}
                    className="rounded-md border p-4 text-left hover-scale select-none"
                    onMouseDown={startPress(() => onLongPress(g.id, m.id, m.amount))}
                    onMouseUp={endPress}
                    onMouseLeave={endPress}
                    onTouchStart={startPress(() => onLongPress(g.id, m.id, m.amount))}
                    onTouchEnd={endPress}
                    onClick={(e) => {
                      // if long press already handled, ignore click
                      if (pressTimer) return;
                      onQuick(g.id, m.id, m.amount);
                    }}
                  >
                    <div className="text-2xl leading-none">{m.emoji ?? "💸"}</div>
                    <div className="font-medium mt-1">{m.name}</div>
                    <div className="text-sm text-muted-foreground">{currency(m.amount)}</div>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar monto</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              inputMode="decimal"
              value={pending?.amount === 0 ? "" : pending?.amount ?? ""}
              onChange={(e) => setPending((p) => (p ? { ...p, amount: Number(e.target.value) || 0 } : p))}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!pending) return;
                const id = triggerMacro(pending.macroId, pending.groupId, pending.amount);
                if (id) {
                  toast({
                    title: "Transacción registrada",
                    description: `Agregado por ${currency(pending.amount)}`,
                    action: <Button variant="secondary" onClick={() => deleteTransaction(id)}>Deshacer</Button>,
                  });
                }
                setOpen(false);
              }}
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Macros;
