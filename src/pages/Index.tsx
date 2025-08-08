import { Helmet } from "react-helmet-async";
import { useMemo } from "react";
import { useFinance, currentMonthKey } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from "recharts";

const currency = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD" });

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
  }, [totalSpendableBalance, monthlyObligationsRemaining, safeToSpend, monthlyObligationsTotal]);

  const pieData = useMemo(() => {
    const data = expensesByCategory(month).map((x) => {
      const cat = categories.find((c) => c.id === x.categoryId);
      return { name: cat ? `${cat.emoji ?? ""} ${cat.name}` : "Sin categoría", value: x.total };
    });
    return data.length ? data : [{ name: "Sin datos", value: 1 }];
  }, [categories, expensesByCategory, month]);

  const COLORS = ["#82ca9d", "#8884d8", "#ffc658", "#ff7f7f", "#8dd1e1", "#a4de6c"]; // only used by chart SVG

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
      <Helmet>
        <title>Finanzas Local-First — Dashboard</title>
        <meta name="description" content="Panel financiero con Disponible Real y planificación quincenal." />
        <link rel="canonical" href="/" />
      </Helmet>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Saldo total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{currency(kpis.saldo)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Obligaciones del mes</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{currency(kpis.obligaciones)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Disponible Real</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-primary">{currency(kpis.disponible)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Aparta por quincena</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{currency(kpis.apartaQuincena)}</CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Checklist de pagos recurrentes (mes actual)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recurrings.length === 0 && (
              <p className="text-muted-foreground">Agrega pagos en Ajustes para verlos aquí.</p>
            )}
            {recurrings.map((r) => {
              const isPaid = r.paidMonths.includes(month);
              return (
                <div key={r.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-muted-foreground">Vence día {r.dueDay} · {currency(r.amount)}</div>
                  </div>
                  <Button variant={isPaid ? "secondary" : "default"} onClick={() => handlePayRecurring(r.id)} disabled={isPaid}>
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
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} fill="#8884d8" label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            {credits.length === 0 && <p className="text-muted-foreground">Agrega créditos en Ajustes.</p>}
            {credits.map((c) => {
              const progress = Math.min(100, (c.paid / c.total) * 100);
              const isPaidThisMonth = c.lastPaidMonth === month;
              return (
                <div key={c.id} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-muted-foreground">Cuota: {currency(c.monthlyInstallment)} · Día {c.dueDay}</div>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span>{currency(c.paid)} / {currency(c.total)}</span>
                    <Button onClick={() => handlePayCredit(c.id)} variant={isPaidThisMonth ? "secondary" : "default"} disabled={isPaidThisMonth}>
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
