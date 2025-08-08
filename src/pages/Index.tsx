import { Helmet } from "react-helmet-async";
import { useMemo } from "react";
import { useFinance, currentMonthKey } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from "recharts";

const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "COP" });

const Dashboard = () => {
  const {
    accounts,
    categories,
    recurrings,
    credits,
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
  } = useFinance();
  const { toast } = useToast();

  const month = currentMonthKey();

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

  return (
    <div className="space-y-6 animate-enter">
      {/* Panel de resumen de flujo de caja mensual con datos reales */}
      <Helmet>
        <title>Finanzas Local-First — Dashboard</title>
        <meta
          name="description"
          content="Panel financiero con Disponible Real y planificación quincenal."
        />
        <link rel="canonical" href="/" />
      </Helmet>

      <section className="grid grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Resumen mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-gray-900 dark:text-white text-lg font-semibold">
                Resumen mensual
              </h2>
              <div className="text-right">
                <span className="text-gray-600 dark:text-gray-300 text-sm font-medium block">
                  Balance General Total
                </span>
                <span className="text-gray-900 dark:text-white text-lg font-bold">
                  {currency(kpis.saldo)}
                </span>
              </div>
            </div>
            <div className="mb-2">
              <div className="text-purple-500 text-5xl font-extrabold leading-tight">
                {currency(kpis.disponible)}
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                Disponibles para gastar o ahorrar este mes.
              </div>
            </div>
            <hr className="border-gray-200 dark:border-gray-700 my-4" />
            <div className="space-y-4">
              {/* Ingresos del Mes */}
              <div className="flex items-center gap-3">
                <span className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M12 19V5M12 5l-7 7M12 5l7 7"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <div className="text-green-600 dark:text-green-400 font-medium">
                    Ingresos del Mes
                  </div>
                  <div className="text-green-600 dark:text-green-400 text-lg font-bold">
                    {currency(kpis.saldo)}
                  </div>
                </div>
              </div>
              {/* Gastos Realizados */}
              <div className="flex items-center gap-3">
                <span className="bg-red-100 dark:bg-red-900 rounded-full p-2">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 7v6m0 0l-3-3m3 3l3-3"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <div className="text-red-600 dark:text-red-400 font-medium">
                    Gastos Realizados
                  </div>
                  <div className="text-red-600 dark:text-red-400 text-lg font-bold">
                    {currency(kpis.obligaciones)}
                  </div>
                </div>
              </div>
              {/* Gastos Futuros */}
              <div className="flex items-center gap-3">
                <span className="bg-yellow-100 dark:bg-yellow-900 rounded-full p-2">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M6 4h12M6 20h12M8 4v2a4 4 0 004 4 4 4 0 004-4V4M8 20v-2a4 4 0 014-4 4 4 0 014 4v2"
                      stroke="#facc15"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <div className="text-yellow-400 font-medium">
                    Gastos Futuros
                  </div>
                  <div className="text-yellow-400 text-lg font-bold">
                    {currency(kpis.apartaQuincena)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </section>

      <section className="grid grid-cols-1 gap-6">
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
      </section>
    </div>
  );
};

export default Dashboard;
