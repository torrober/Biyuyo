import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useFinance, AccountType } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Ajustes = () => {
  const {
    accounts,
    categories,
    macroGroups,
    recurrings,
    credits,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    deleteCategory,
    addRecurring,
    deleteRecurring,
    addCredit,
    deleteCredit,
    addMacroGroup,
    addMacroToGroup,
    exportData,
    importData,
  } = useFinance();

  // Accounts form
  const [acc, setAcc] = useState({ name: "", type: "cash" as AccountType });

  // Category form
  const [cat, setCat] = useState({ name: "", emoji: "" });

  // Recurring form
  const [rec, setRec] = useState({ name: "", amount: 0, dueDay: 1, accountId: "", categoryId: "" });

  // Credit form
  const [cre, setCre] = useState({ name: "", total: 0, monthlyInstallment: 0, dueDay: 1, accountId: "" });

  // Macro group form
  const [grp, setGrp] = useState({ name: "" });
  const [macro, setMacro] = useState({ groupId: "", name: "", emoji: "", amount: 0, accountId: "", categoryId: "" });

  const download = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    importData(text);
  };

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Ajustes — Finanzas Local-First</title>
        <meta name="description" content="Gestiona cuentas, categorías, recurrentes, créditos, macros y respaldo de datos." />
        <link rel="canonical" href="/ajustes" />
      </Helmet>

      <Tabs defaultValue="cuentas" className="space-y-6">
        <TabsList>
          <TabsTrigger value="cuentas">Cuentas</TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
          <TabsTrigger value="recurrentes">Recurrentes</TabsTrigger>
          <TabsTrigger value="creditos">Créditos</TabsTrigger>
          <TabsTrigger value="macros">Macros</TabsTrigger>
          <TabsTrigger value="respaldo">Respaldo</TabsTrigger>
        </TabsList>

        <TabsContent value="cuentas">
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
        </TabsContent>

        <TabsContent value="categorias">
          <Card>
            <CardHeader><CardTitle>Gestión de categorías</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Emoji</Label>
                  <Input value={cat.emoji} onChange={(e) => setCat((s) => ({ ...s, emoji: e.target.value }))} placeholder="🍔" />
                </div>
                <div>
                  <Label>Nombre</Label>
                  <Input value={cat.name} onChange={(e) => setCat((s) => ({ ...s, name: e.target.value }))} />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => cat.name && addCategory({ name: cat.name, emoji: cat.emoji })}>Agregar</Button>
                </div>
              </div>
              <ul className="space-y-2">
                {categories.map((c) => (
                  <li key={c.id} className="flex items-center justify-between rounded-md border p-2">
                    <div className="text-sm">{c.emoji} {c.name}</div>
                    <Button variant="destructive" size="sm" onClick={() => deleteCategory(c.id)}>Eliminar</Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurrentes">
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
                  <Select value={rec.categoryId} onValueChange={(v) => setRec((s) => ({ ...s, categoryId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin categoría</SelectItem>
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
        </TabsContent>

        <TabsContent value="creditos">
          <Card>
            <CardHeader><CardTitle>Créditos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <Label>Nombre</Label>
                  <Input value={cre.name} onChange={(e) => setCre((s) => ({ ...s, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Total</Label>
                  <Input type="number" value={cre.total} onChange={(e) => setCre((s) => ({ ...s, total: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Cuota mensual</Label>
                  <Input type="number" value={cre.monthlyInstallment} onChange={(e) => setCre((s) => ({ ...s, monthlyInstallment: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Día de pago</Label>
                  <Input type="number" value={cre.dueDay} onChange={(e) => setCre((s) => ({ ...s, dueDay: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Cuenta</Label>
                  <Select value={cre.accountId} onValueChange={(v) => setCre((s) => ({ ...s, accountId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Cuenta" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-5">
                  <Button onClick={() => cre.name && cre.accountId && addCredit({ name: cre.name, total: cre.total, monthlyInstallment: cre.monthlyInstallment, dueDay: cre.dueDay, accountId: cre.accountId, paid: 0 })}>Agregar</Button>
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
        </TabsContent>

        <TabsContent value="macros">
          <Card>
            <CardHeader><CardTitle>Macros</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Nombre del grupo</Label>
                  <Input value={grp.name} onChange={(e) => setGrp({ name: e.target.value })} />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => grp.name && addMacroGroup({ name: grp.name, macros: [] })}>Agregar grupo</Button>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-2">
                  <Label>Grupo</Label>
                  <Select value={macro.groupId} onValueChange={(v) => setMacro((s) => ({ ...s, groupId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Grupo" /></SelectTrigger>
                    <SelectContent>
                      {macroGroups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Emoji</Label>
                  <Input value={macro.emoji} onChange={(e) => setMacro((s) => ({ ...s, emoji: e.target.value }))} placeholder="☕" />
                </div>
                <div>
                  <Label>Nombre</Label>
                  <Input value={macro.name} onChange={(e) => setMacro((s) => ({ ...s, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Monto</Label>
                  <Input type="number" value={macro.amount} onChange={(e) => setMacro((s) => ({ ...s, amount: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Cuenta</Label>
                  <Select value={macro.accountId} onValueChange={(v) => setMacro((s) => ({ ...s, accountId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Cuenta" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Select value={macro.categoryId} onValueChange={(v) => setMacro((s) => ({ ...s, categoryId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-6">
                  <Button onClick={() => macro.groupId && macro.name && addMacroToGroup(macro.groupId, { name: macro.name, emoji: macro.emoji, amount: macro.amount, accountId: macro.accountId, categoryId: macro.categoryId })}>Agregar macro</Button>
                </div>
              </div>

              {macroGroups.length === 0 ? (
                <p className="text-muted-foreground">Crea un grupo para empezar.</p>
              ) : (
                <ul className="space-y-2">
                  {macroGroups.map((g) => (
                    <li key={g.id} className="rounded-md border p-2">
                      <div className="font-medium">{g.name}</div>
                      <div className="text-sm text-muted-foreground">{g.macros.length} macros</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="respaldo">
          <Card>
            <CardHeader><CardTitle>Exportar / Importar</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Button onClick={download}>Exportar backup.json</Button>
                <Input type="file" accept="application/json" onChange={(e) => upload(e.target.files?.[0] ?? undefined)} />
              </div>
              <p className="text-sm text-muted-foreground">Tu información es local y privada. Exporta tu backup para migrar o resguardar.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Ajustes;
