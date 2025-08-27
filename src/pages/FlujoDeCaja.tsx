import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { useFinance } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const currency = (n: number) => n.toLocaleString("es-CO", { style: "currency", currency: "COP" });

const FlujoDeCaja = () => {
  const { transactions, categories } = useFinance();
  
  // Estado para el rango de fechas
  const [startDate, setStartDate] = useState(() => startOfMonth(subMonths(new Date(), 5)));
  const [endDate, setEndDate] = useState(() => endOfMonth(new Date()));
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);

  // Función para formatear fechas
  const formatDate = (date: Date) => format(date, "MMM dd, yyyy", { locale: es });
  const formatMonth = (date: Date) => format(date, "MMM", { locale: es });

  // Filtrar transacciones por rango de fechas
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = parseISO(tx.date);
      return txDate >= startDate && txDate <= endDate;
    });
  }, [transactions, startDate, endDate]);

  // Calcular ingresos y gastos totales
  const totals = useMemo(() => {
    const incomes = filteredTransactions
      .filter(tx => tx.type === "income" && !tx.transferId)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expenses = filteredTransactions
      .filter(tx => tx.type === "expense" && !tx.transferId)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      incomes,
      expenses,
      netFlow: incomes - expenses
    };
  }, [filteredTransactions]);

  // Datos para el gráfico de barras (últimos 6 meses)
  const barChartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(monthStart);
      
      const monthTransactions = transactions.filter(tx => {
        const txDate = parseISO(tx.date);
        return txDate >= monthStart && txDate <= monthEnd;
      });
      
      const monthIncomes = monthTransactions
        .filter(tx => tx.type === "income" && !tx.transferId)
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const monthExpenses = monthTransactions
        .filter(tx => tx.type === "expense" && !tx.transferId)
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      months.push({
        month: formatMonth(monthStart),
        ingresos: monthIncomes,
        gastos: monthExpenses
      });
    }
    return months;
  }, [transactions]);

  // Datos para el gráfico de torta (gastos por categoría)
  const pieChartData = useMemo(() => {
    const expensesByCategory = new Map<string, number>();
    
    filteredTransactions
      .filter(tx => tx.type === "expense" && !tx.transferId)
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
  }, [filteredTransactions, categories]);

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {currency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totals.expenses) * 100).toFixed(1);
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p>{currency(data.value)} ({percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Análisis de Flujo de Caja — Safe Spend Planner</title>
        <meta
          name="description"
          content="Analiza tus ingresos, gastos y el balance neto en el tiempo."
        />
      </Helmet>

      {/* Header con selector de fechas */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Análisis de Flujo de Caja</h1>
          <p className="text-sm text-muted-foreground">
            Analiza tus ingresos, gastos y el balance neto en el tiempo.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsDateDialogOpen(true)}
          className="w-full flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Calendar className="h-4 w-4" />
          <span className="truncate max-w-[80%]">
            {format(startDate, "MMM dd")} - {format(endDate, "MMM dd")}
          </span>
        </Button>
      </div>

      <h2 className="text-base font-semibold">Flujo de caja</h2>
      {/* Selector de fechas en modal */}
      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecciona el período</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Fecha inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={format(startDate, "yyyy-MM-dd")}
                onChange={(e) => setStartDate(parseISO(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Fecha final</Label>
              <Input
                id="end-date"
                type="date"
                value={format(endDate, "yyyy-MM-dd")}
                onChange={(e) => setEndDate(parseISO(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDateDialogOpen(false)}>Listo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tarjetas de resumen */}
      <div className="space-y-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-green-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Ingresos</p>
                  <p className="text-xs text-muted-foreground">Total de ingresos</p>
                </div>
              </div>
              <p className="text-lg font-bold text-green-600">
                {currency(totals.incomes)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-red-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Gastos</p>
                  <p className="text-xs text-muted-foreground">Total de gastos</p>
                </div>
              </div>
              <p className="text-lg font-bold text-red-600">
                {currency(totals.expenses)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`${totals.netFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Flujo Neto</p>
                  <p className="text-xs text-muted-foreground">Balance final</p>
                </div>
              </div>
              <p className={`text-lg font-bold ${totals.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currency(totals.netFlow)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de barras */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Flujo de Caja</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparación de tus finanzas en los últimos 6 meses.
          </p>
        </CardHeader>
        <CardContent>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} minTickGap={4} />
                <YAxis width={36} tick={{ fontSize: 10 }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ingresos" fill="#82ca9d" name="Ingresos" />
                <Bar dataKey="gastos" fill="#ff7f7f" name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de torta */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose de Gastos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribución de gastos en el período seleccionado.
          </p>
        </CardHeader>
        <CardContent>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Indicadores del gráfico (leyenda) */}
          {pieChartData.length > 0 && (
            <div className="mt-3 grid gap-2">
              {pieChartData.map((item, index) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FlujoDeCaja;
