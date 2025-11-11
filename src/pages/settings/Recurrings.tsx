import { useState } from "react";
import { useFinance } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NativeSelect from "@/components/ui/native-select";
import { Helmet } from "react-helmet-async";

const currency = (n: number) => n.toLocaleString("es-CO", { style: "currency", currency: "COP" });

const RecurringsSettings = () => {
  const { accounts, categories, recurrings, addRecurring, deleteRecurring } = useFinance();
  const [rec, setRec] = useState({ name: "", amount: 0, dueDay: 1, accountId: "", categoryId: "" });

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Pagos Recurrentes — Biyuyo</title>
        <meta name="description" content="Configura tus pagos mensuales recurrentes." />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold">Pagos recurrentes</h1>
        <p className="text-sm text-muted-foreground">
          Configura tus pagos mensuales recurrentes.
        </p>
      </div>

      <div>
        <div className="space-y-4 p-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={rec.name} onChange={(e) => setRec((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={rec.amount === 0 ? "" : rec.amount}
                onChange={(e) => setRec((s) => ({ ...s, amount: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Día de pago</Label>
              <Input type="number" value={rec.dueDay} onChange={(e) => setRec((s) => ({ ...s, dueDay: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Cuenta</Label>
              <NativeSelect value={rec.accountId} onChange={(e) => setRec((s) => ({ ...s, accountId: e.target.value }))} placeholderOption="Cuenta">
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <NativeSelect value={(rec.categoryId || "none")} onChange={(e) => setRec((s) => ({ ...s, categoryId: e.target.value === "none" ? "" : e.target.value }))}>
                <option value="none">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Button 
                className="w-full"
                onClick={() => rec.name && rec.accountId && addRecurring({ 
                  name: rec.name, 
                  amount: rec.amount, 
                  dueDay: rec.dueDay, 
                  accountId: rec.accountId, 
                  categoryId: rec.categoryId || null 
                })}
              >
                Agregar
              </Button>
            </div>
          </div>
          <ul className="space-y-2">
            {recurrings.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-md border p-2">
                <div className="text-sm">{r.name} · {currency(r.amount)} · día {r.dueDay}</div>
                <Button variant="destructive" size="sm" onClick={() => deleteRecurring(r.id)}>Eliminar</Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecurringsSettings;
