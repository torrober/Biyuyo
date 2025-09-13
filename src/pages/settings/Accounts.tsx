import { useState } from "react";
import { useFinance, AccountType } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NativeSelect from "@/components/ui/native-select";
import { Helmet } from "react-helmet-async";
import { Plus, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const AccountsSettings = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useFinance();
  const [acc, setAcc] = useState({ name: "", type: "cash" as AccountType });

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Cuentas — Biyuyo</title>
        <meta name="description" content="Gestiona tus cuentas bancarias, efectivo y ahorros." />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold">Cuentas</h1>
        <p className="text-sm text-muted-foreground">
          Administra tus cuentas bancarias, efectivo y ahorros.
        </p>
      </div>

      <div>
        <div className="space-y-4 p-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={acc.name} onChange={(e) => setAcc((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <NativeSelect value={acc.type} onChange={(e) => setAcc((s) => ({ ...s, type: e.target.value as AccountType }))} placeholderOption="Tipo">
                <option value="cash">Efectivo</option>
                <option value="bank">Banco</option>
                <option value="savings">Ahorro</option>
              </NativeSelect>
            </div>
            <div>
              <Button className="w-full" onClick={() => acc.name && addAccount(acc)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>
          <ul className="space-y-2">
            {accounts.map((a) => (
              <li key={a.id} className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {a.type === 'cash' ? 'Efectivo' : a.type === 'bank' ? 'Banco' : 'Ahorro'}
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Cuenta</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Nombre</Label>
                          <Input
                            value={a.name}
                            onChange={(e) => updateAccount(a.id, { name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <NativeSelect value={a.type} onChange={(e) => updateAccount(a.id, { type: e.target.value as AccountType })} placeholderOption="Tipo">
                            <option value="cash">Efectivo</option>
                            <option value="bank">Banco</option>
                            <option value="savings">Ahorro</option>
                          </NativeSelect>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button className="w-full" variant="default">
                          Guardar cambios
                        </Button>
                        <Button className="w-full" variant="destructive" onClick={() => deleteAccount(a.id)}>
                          Eliminar cuenta
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AccountsSettings;
