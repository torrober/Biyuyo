import { useState } from "react";
import { useFinance } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet-async";

const RecurringsSettings = () => {
  const { accounts, categories, recurrings, addRecurring, deleteRecurring } = useFinance();
  const [rec, setRec] = useState({ name: "", amount: 0, dueDay: 1, accountId: "", categoryId: "" });

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Pagos Recurrentes — Finanzas Local-First</title>
        <meta name="description" content="Configura tus pagos mensuales recurrentes." />
      </Helmet>

      <Card>
        <CardHeader><CardTitle>Pagos recurrentes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-3">
            <div>
              <Label>Nombre</Label>
              <Input value={rec.name} onChange={(e) => setRec((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div>
              <Label>Monto</Label>
              <Input type="number" value={rec.amount} onChange={(e) => setRec((s) => ({ ...s, amount: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Día</Label>
              <Input type="number" value={rec.dueDay} onChange={(e) => setRec((s) => ({ ...s, dueDay: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Cuenta</Label>
              <Select value={rec.accountId} onValueChange={(v) => setRec((s) => ({ ...s, accountId: v }))}>
                <SelectTrigger><SelectValue placeholder="Cuenta" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoría</Label>
              <Select value={(rec.categoryId || "none")} onValueChange={(v) => setRec((s) => ({ ...s, categoryId: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-5">
              <Button onClick={() => rec.name && rec.accountId && addRecurring({ name: rec.name, amount: rec.amount, dueDay: rec.dueDay, accountId: rec.accountId, categoryId: rec.categoryId || null })}>Agregar</Button>
            </div>
          </div>
          <ul className="space-y-2">
            {recurrings.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-md border p-2">
                <div className="text-sm">{r.name} · {r.amount} · día {r.dueDay}</div>
                <Button variant="destructive" size="sm" onClick={() => deleteRecurring(r.id)}>Eliminar</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecurringsSettings;
