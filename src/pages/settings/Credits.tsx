import { useState } from "react";
import { useFinance } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NativeSelect from "@/components/ui/native-select";
import { Helmet } from "react-helmet-async";

const currency = (n: number) => n.toLocaleString("es-CO", { style: "currency", currency: "COP" });

const CreditsSettings = () => {
  const { accounts, credits, addCredit, deleteCredit } = useFinance();
  const [cre, setCre] = useState({ name: "", total: 0, monthlyInstallment: 0, dueDay: 1, accountId: "" });

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Créditos — Biyuyo</title>
        <meta name="description" content="Gestiona tus créditos y préstamos." />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold">Créditos</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona tus créditos y préstamos.
        </p>
      </div>

      <div>
        <div className="space-y-4 p-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={cre.name} onChange={(e) => setCre((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={cre.total === 0 ? "" : cre.total}
                onChange={(e) => setCre((s) => ({ ...s, total: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Cuota mensual</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={cre.monthlyInstallment === 0 ? "" : cre.monthlyInstallment}
                onChange={(e) => setCre((s) => ({ ...s, monthlyInstallment: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Día de pago</Label>
              <Input type="number" value={cre.dueDay} onChange={(e) => setCre((s) => ({ ...s, dueDay: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Cuenta</Label>
              <NativeSelect value={cre.accountId} onChange={(e) => setCre((s) => ({ ...s, accountId: e.target.value }))} placeholderOption="Cuenta">
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Button 
                className="w-full"
                onClick={() => cre.name && cre.accountId && addCredit({ 
                  name: cre.name, 
                  total: cre.total, 
                  monthlyInstallment: cre.monthlyInstallment, 
                  dueDay: cre.dueDay, 
                  accountId: cre.accountId, 
                  paid: 0 
                })}
              >
                Agregar
              </Button>
            </div>
          </div>
          <ul className="space-y-2">
            {credits.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-md border p-2">
                <div className="text-sm">{c.name} · Total {currency(c.total)} · Cuota {currency(c.monthlyInstallment)}</div>
                <Button variant="destructive" size="sm" onClick={() => deleteCredit(c.id)}>Eliminar</Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreditsSettings;
