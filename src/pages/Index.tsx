import { Helmet } from "react-helmet-async";
import { useMemo, useEffect, useState } from "react";
import { useFinance, currentMonthKey } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Zap, Pencil, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from "recharts";
import { Hourglass } from "lucide-react";

const currency = (n: number) => n.toLocaleString("es-CO", { style: "currency", currency: "COP" });

const Dashboard = () => {
  const {
    accounts,
    categories,
    transactions,
    recurrings,
    credits,
    macroGroups,
    totalSpendableBalance,
    monthlyObligationsTotal,
    monthlyObligationsRemaining,
    safeToSpend,
    expensesByCategory,
    payRecurring,
    toggleRecurringPaid,
    payCreditInstallment,
    updateCredit,
    deleteTransaction,
    triggerMacro,
  } = useFinance();
  const { toast } = useToast();

  const month = currentMonthKey();

  const incomeThisMonth = useMemo(() => {
    const incomes = transactions
      .filter((t) => t.type === "income" && t.date.startsWith(month) && !t.transferId);
    return incomes.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, month]);

  const kpis = useMemo(() => {
    const saldo = totalSpendableBalance();
    const obligaciones = monthlyObligationsRemaining();
    const disponible = safeToSpend();
    const apartaQuincena = monthlyObligationsTotal() / 2;
    return { saldo, obligaciones, disponible, apartaQuincena };
  }, [
    totalSpendableBalance,
    monthlyObligationsRemaining,
    safeToSpend,
    monthlyObligationsTotal,
  ]);

  const pieData = useMemo(() => {
    const data = expensesByCategory(month).map((x) => {
      const cat = categories.find((c) => c.id === x.categoryId);
      return {
        name: cat ? `${cat.emoji ?? ""} ${cat.name}` : "Sin categoría",
        value: x.total,
      };
    });
    return data.length ? data : [{ name: "Sin datos", value: 1 }];
  }, [categories, expensesByCategory, month]);

  const COLORS = [
    "#82ca9d",
    "#8884d8",
    "#ffc658",
    "#ff7f7f",
    "#8dd1e1",
    "#a4de6c",
  ]; // only used by chart SVG

  const handlePayRecurring = (id: string) => {
    const txId = payRecurring(id);
    if (!txId) return;
    toast({
      title: "Pago recurrente registrado",
      description: "Se descontó del total y quedó marcado como pagado.",
      action: (
        <Button
          variant="secondary"
          onClick={() => {
            deleteTransaction(txId);
            toggleRecurringPaid(id, false);
          }}
        >
          Deshacer
        </Button>
      ),
    });
  };

  const handlePayCredit = (creditId: string) => {
    const txId = payCreditInstallment(creditId);
    if (!txId) return;
    toast({
      title: "Pago de crédito registrado",
      description: "Progreso actualizado.",
      action: (
        <Button
          variant="secondary"
          onClick={() => {
            deleteTransaction(txId);
            // revert credit progress for this month
            const c = credits.find((x) => x.id === creditId);
            if (!c) return;
            updateCredit(creditId, {
              lastPaidMonth: undefined,
              paid: Math.max(0, c.paid - c.monthlyInstallment),
            });
          }}
        >
          Deshacer
        </Button>
      ),
    });
  };

  // Quick Macros state (persisted locally)
  const [quickMacroIds, setQuickMacroIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("quickMacroIds");
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      return Array.isArray(parsed) ? parsed.slice(0, 4) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("quickMacroIds", JSON.stringify(quickMacroIds.slice(0, 4)));
  }, [quickMacroIds]);

  const allMacros = useMemo(() => {
    return macroGroups.flatMap((g) => g.macros.map((m) => ({ ...m, groupId: g.id, groupName: g.name })));
  }, [macroGroups]);

  const selectedMacros = useMemo(() => {
    return quickMacroIds
      .map((id) => allMacros.find((m) => m.id === id))
      .filter((x): x is typeof allMacros[number] => Boolean(x));
  }, [quickMacroIds, allMacros]);

  const [isQuickDialogOpen, setIsQuickDialogOpen] = useState(false);

  const toggleQuickMacro = (id: string) => {
    setQuickMacroIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev; // limit
      return [...prev, id];
    });
  };

  const runMacro = async (macroId: string, groupId: string) => {
    const txId = triggerMacro(macroId, groupId);
    if (txId) {
      toast({ title: "Macro ejecutada", description: "Se creó una transacción." });
    }
  };

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Finanzas Local-First — Dashboard</title>
        <meta
          name="description"
          content="Panel financiero con Disponible Real y planificación quincenal."
        />
        <link rel="canonical" href="/" />
      </Helmet>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Resumen mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-1">
                <p className="text-xs text-muted-foreground">Balance General Total</p>
                <p className="text-lg font-medium">{currency(kpis.saldo)}</p>
              </div>
              <Progress className="h-2" value={0} />
            </div>

            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1">Disponible este mes</p>
              <p className="text-2xl font-bold">{currency(kpis.disponible)}</p>
            </div>

            <div className="grid gap-2">
              <div className="grid grid-cols-[1fr,auto] items-center gap-3 p-2 rounded-lg border bg-green-100 dark:bg-green-900">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                  <p className="text-xs font-medium truncate">Ingresos del Mes</p>
                </div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 tabular-nums">
                  {currency(incomeThisMonth)}
                </p>
              </div>

              <div className="grid grid-cols-[1fr,auto] items-center gap-3 p-2 rounded-lg border bg-red-100 dark:bg-red-900">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <p className="text-xs font-medium truncate">Gastos Realizados</p>
                </div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 tabular-nums">
                  {currency(expensesByCategory(month).reduce((a, b) => a + b.total, 0))}
                </p>
              </div>

              <div className="grid grid-cols-[1fr,auto] items-center gap-3 p-2 rounded-lg border bg-yellow-100 dark:bg-yellow-900">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 shrink-0">
                  </div>
                  <p className="text-xs font-medium truncate">Gastos Futuros</p>
                </div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 tabular-nums">
                  {currency(kpis.obligaciones)}
                </p>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>

      {/* Macros rápidas */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <CardTitle>Registro Rápido</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsQuickDialogOpen(true)} aria-label="Editar macros rápidas">
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Registra gastos frecuentes con un solo clic.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, idx) => {
              const macro = selectedMacros[idx];
              if (macro) {
                return (
                  <Button
                    key={macro.id}
                    variant="outline"
                    className="h-20 rounded-xl flex flex-col items-center justify-center gap-1"
                    onClick={() => runMacro(macro.id, macro.groupId)}
                  >
                    <span className="font-semibold truncate max-w-[9rem]">{macro.emoji ? `${macro.emoji} ` : ""}{macro.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{currency(macro.amount)}</span>
                  </Button>
                );
              }
              return (
                <Button
                  key={`empty-${idx}`}
                  variant="outline"
                  className="h-20 rounded-xl flex items-center justify-center border-dashed"
                  onClick={() => setIsQuickDialogOpen(true)}
                  aria-label="Agregar macro rápida"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              );
            })}
          </div>
          {allMacros.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">No hay macros. Crea algunas en Ajustes.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isQuickDialogOpen} onOpenChange={setIsQuickDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecciona hasta 4 macros</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 max-h-72 overflow-auto pr-1">
            {allMacros.map((m) => {
              const selected = quickMacroIds.includes(m.id);
              const disabled = !selected && quickMacroIds.length >= 4;
              return (
                <label key={m.id} className={`flex items-center justify-between rounded-md border p-2 ${disabled ? "opacity-60" : ""}`}>
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selected} onCheckedChange={() => toggleQuickMacro(m.id)} disabled={disabled} />
                    <div className="flex flex-col">
                      <span className="font-medium">{m.emoji ? `${m.emoji} ` : ""}{m.name}</span>
                      <span className="text-xs text-muted-foreground">Grupo: {m.groupName}</span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsQuickDialogOpen(false)}>Listo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Checklist de pagos recurrentes (mes actual)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recurrings.length === 0 && (
              <p className="text-muted-foreground">
                Agrega pagos en Ajustes para verlos aquí.
              </p>
            )}
            {recurrings.map((r) => {
              const isPaid = r.paidMonths.includes(month);
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Vence día {r.dueDay} · {currency(r.amount)}
                    </div>
                  </div>
                  <Button
                    variant={isPaid ? "secondary" : "default"}
                    onClick={() => handlePayRecurring(r.id)}
                    disabled={isPaid}
                  >
                    {isPaid ? "Pagado" : "Pagar"}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por categoría (mes)</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Créditos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {credits.length === 0 && (
              <p className="text-muted-foreground">
                Agrega créditos en Ajustes.
              </p>
            )}
            {credits.map((c) => {
              const progress = Math.min(100, (c.paid / c.total) * 100);
              const isPaidThisMonth = c.lastPaidMonth === month;
              return (
                <div key={c.id} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Cuota: {currency(c.monthlyInstallment)} · Día {c.dueDay}
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {currency(c.paid)} / {currency(c.total)}
                    </span>
                    <Button
                      onClick={() => handlePayCredit(c.id)}
                      variant={isPaidThisMonth ? "secondary" : "default"}
                      disabled={isPaidThisMonth}
                    >
                      {isPaidThisMonth ? "Pagado" : "Pagar cuota"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
