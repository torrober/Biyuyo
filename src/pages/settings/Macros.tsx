import { useState } from "react";
import { useFinance } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet-async";

const MacrosSettings = () => {
  const { accounts, categories, macroGroups, addMacroGroup, addMacroToGroup } = useFinance();
  const [grp, setGrp] = useState({ name: "" });
  const [macro, setMacro] = useState({ groupId: "", name: "", emoji: "", amount: 0, accountId: "", categoryId: "" });

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Macros — Finanzas Local-First</title>
        <meta name="description" content="Configura macros para gastos rápidos." />
      </Helmet>

      <Card>
        <CardHeader><CardTitle>Macros</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del grupo</Label>
              <Input value={grp.name} onChange={(e) => setGrp({ name: e.target.value })} />
            </div>
            <div>
              <Button className="w-full" onClick={() => grp.name && addMacroGroup({ name: grp.name, macros: [] })}>Agregar grupo</Button>
            </div>

            <div className="border-t pt-4" />

            <div className="space-y-2">
              <Label>Grupo</Label>
              <Select value={macro.groupId} onValueChange={(v) => setMacro((s) => ({ ...s, groupId: v }))}>
                <SelectTrigger><SelectValue placeholder="Grupo" /></SelectTrigger>
                <SelectContent>
                  {macroGroups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Emoji</Label>
              <Input value={macro.emoji} onChange={(e) => setMacro((s) => ({ ...s, emoji: e.target.value }))} placeholder="☕" />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={macro.name} onChange={(e) => setMacro((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input type="number" value={macro.amount} onChange={(e) => setMacro((s) => ({ ...s, amount: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Cuenta</Label>
              <Select value={macro.accountId} onValueChange={(v) => setMacro((s) => ({ ...s, accountId: v }))}>
                <SelectTrigger><SelectValue placeholder="Cuenta" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={macro.categoryId} onValueChange={(v) => setMacro((s) => ({ ...s, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button className="w-full" onClick={() => macro.groupId && macro.name && addMacroToGroup(macro.groupId, { name: macro.name, emoji: macro.emoji, amount: macro.amount, accountId: macro.accountId, categoryId: macro.categoryId })}>Agregar macro</Button>
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
    </div>
  );
};

export default MacrosSettings;
