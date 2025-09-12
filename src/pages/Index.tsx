import { Helmet } from "react-helmet-async";
import { flushSync } from "react-dom";
import { useMemo, useEffect, useState } from "react";
import { useFinance, currentMonthKey } from "@/store/finance";
import { get, set } from 'idb-keyval';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Zap, Pencil, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Hourglass } from "lucide-react";
import { subMonths } from "date-fns";

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

  // Mes actual (para KPIs, recurrentes, créditos)
  const currentMonth = currentMonthKey();

  // Usar el último mes (previo al actual) para el gráfico de torta
  const lastMonth = (() => {
    const d = subMonths(new Date(), 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`; // YYYY-MM
  })();

  const incomeThisMonth = transactions
    .filter((t) => t.type === "income" && t.date.startsWith(currentMonth) && !t.transferId)
    .reduce((sum, t) => sum + t.amount, 0);

  const expensesThisMonth = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth) && !t.transferId)
    .reduce((sum, t) => sum + t.amount, 0);

  const kpis = {
    saldo: totalSpendableBalance(),
    obligaciones: monthlyObligationsRemaining(),
    disponible: safeToSpend(),
    apartaQuincena: monthlyObligationsTotal() / 2,
  };

  // Datos para el gráfico de torta (gastos por categoría del último mes)
  const pieData = useMemo(() => {
    const expensesByCategory = new Map<string, number>();
    
    transactions
      .filter(tx => tx.type === "expense" && !tx.transferId && tx.date.startsWith(lastMonth))
      .forEach(tx => {
        const categoryId = tx.categoryId || "sin-categoria";
        const categoryName = categories.find(c => c.id === categoryId)?.name || "Sin categoría";
        const emoji = categories.find(c => c.id === categoryId)?.emoji || "";
        const key = `${emoji} ${categoryName}`;
        expensesByCategory.set(key, (expensesByCategory.get(key) || 0) + tx.amount);
      });
    
    return Array.from(expensesByCategory.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }, [transactions, categories, lastMonth]);

  const COLORS = [
    "#82ca9d",
    "#8884d8", 
    "#ffc658",
    "#ff7f7f",
    "#8dd1e1",
    "#a4de6c",
    "#d084d0",
    "#ffa726"
  ];

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const totalLastMonth = transactions
        .filter((t) => t.type === "expense" && t.date.startsWith(lastMonth) && !t.transferId)
        .reduce((sum, t) => sum + t.amount, 0);
      const percentage = totalLastMonth > 0 ? ((data.value / totalLastMonth) * 100).toFixed(1) : '0';
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p>{currency(data.value)} ({percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  const handlePayRecurring = (id: string) => {
    let txId: string | null = null;
    flushSync(() => {
      txId = payRecurring(id);
    });
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
    let txId: string | null = null;
    flushSync(() => {
      txId = payCreditInstallment(creditId);
    });
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

  // Quick Macros state (persisted in IndexedDB)
  const [quickMacroIds, setQuickMacroIds] = useState<string[]>([]);

  // Cargar quickMacroIds desde IndexedDB al inicializar
  useEffect(() => {
    const loadQuickMacros = async () => {
      try {
        // Migrar desde localStorage si existe
        const oldData = localStorage.getItem("quickMacroIds");
        if (oldData) {
          const parsed = JSON.parse(oldData) as string[];
          if (Array.isArray(parsed)) {
            await set("quickMacroIds", parsed.slice(0, 4));
            localStorage.removeItem("quickMacroIds");
            setQuickMacroIds(parsed.slice(0, 4));
            return;
          }
        }

        // Cargar desde IndexedDB
        const stored = await get("quickMacroIds");
        if (stored && Array.isArray(stored)) {
          setQuickMacroIds(stored.slice(0, 4));
        }
      } catch (error) {
        console.error("Error loading quick macros:", error);
      }
    };
    loadQuickMacros();
  }, []);

  // Guardar quickMacroIds en IndexedDB cuando cambie
  useEffect(() => {
    const saveQuickMacros = async () => {
      try {
        await set("quickMacroIds", quickMacroIds.slice(0, 4));
      } catch (error) {
        console.error("Error saving quick macros:", error);
      }
    };
    if (quickMacroIds.length >= 0) { // Permitir arrays vacíos
      saveQuickMacros();
    }
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
    let txId: string | null = null;
    flushSync(() => {
      txId = triggerMacro(macroId, groupId);
    });
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

      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <Link to="/flujo-de-caja" className="block">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Resumen mensual</CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
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
              <div className="grid grid-cols-[1fr,auto] items-center gap-3 p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                  <p className="text-xs font-medium truncate">Ingresos del Mes</p>
                </div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 tabular-nums">
                  {currency(incomeThisMonth)}
                </p>
              </div>

              <div className="grid grid-cols-[1fr,auto] items-center gap-3 p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <p className="text-xs font-medium truncate">Gastos Realizados</p>
                </div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 tabular-nums">
                  {currency(expensesByCategory(currentMonth).reduce((a, b) => a + b.total, 0))}
                </p>
              </div>

              <div className="grid grid-cols-[1fr,auto] items-center gap-3 p-2 rounded-lg border">
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
        </Link>
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
          <div className="grid gap-2 max-h-72 overflow-auto pr-1 overscroll-none">
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
              const isPaid = r.paidMonths.includes(currentMonth);
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
            <CardTitle>Gastos por categoría (último mes)</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Indicadores del gráfico (leyenda) */}
                <div className="mt-3 grid gap-2">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        aria-hidden
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <Hourglass className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay gastos en el último mes</p>
                </div>
              </div>
            )}
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
              const isPaidThisMonth = c.lastPaidMonth === currentMonth;
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
