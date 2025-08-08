import { useState } from "react";
import { useFinance, AccountType } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet-async";

const AccountsSettings = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useFinance();
  const [acc, setAcc] = useState({ name: "", type: "cash" as AccountType });

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Cuentas — Finanzas Local-First</title>
        <meta name="description" content="Gestiona tus cuentas bancarias, efectivo y ahorros." />
      </Helmet>

      <Card>
        <CardHeader><CardTitle>Gestión de cuentas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Nombre</Label>
              <Input value={acc.name} onChange={(e) => setAcc((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={acc.type} onValueChange={(v: AccountType) => setAcc((s) => ({ ...s, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="bank">Banco</SelectItem>
                  <SelectItem value="savings">Ahorro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => acc.name && addAccount(acc)}>Agregar</Button>
            </div>
          </div>
          <ul className="space-y-2">
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-md border p-2">
                <div className="text-sm">{a.name} · {a.type}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => updateAccount(a.id, { name: a.name + "" })}>Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteAccount(a.id)}>Eliminar</Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsSettings;
