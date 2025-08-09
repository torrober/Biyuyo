import { useState } from "react";
import { useFinance } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet-async";

const CreditsSettings = () => {
  const { accounts, credits, addCredit, deleteCredit } = useFinance();
  const [cre, setCre] = useState({ name: "", total: 0, monthlyInstallment: 0, dueDay: 1, accountId: "" });

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Créditos — Finanzas Local-First</title>
        <meta name="description" content="Gestiona tus créditos y préstamos." />
      </Helmet>

      <Card>
        <CardHeader><CardTitle>Créditos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={cre.name} onChange={(e) => setCre((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <Input type="number" value={cre.total} onChange={(e) => setCre((s) => ({ ...s, total: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Cuota mensual</Label>
              <Input type="number" value={cre.monthlyInstallment} onChange={(e) => setCre((s) => ({ ...s, monthlyInstallment: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Día de pago</Label>
              <Input type="number" value={cre.dueDay} onChange={(e) => setCre((s) => ({ ...s, dueDay: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Cuenta</Label>
              <Select value={cre.accountId} onValueChange={(v) => setCre((s) => ({ ...s, accountId: v }))}>
                <SelectTrigger><SelectValue placeholder="Cuenta" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
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
                <div className="text-sm">{c.name} · Total {c.total} · Cuota {c.monthlyInstallment}</div>
                <Button variant="destructive" size="sm" onClick={() => deleteCredit(c.id)}>Eliminar</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditsSettings;
