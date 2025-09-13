import { useState } from "react";
import { useFinance } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NativeSelect from "@/components/ui/native-select";
import { Helmet } from "react-helmet-async";
import { limitToSingleGrapheme, isSingleEmoji } from "@/lib/utils";

const MacrosSettings = () => {
  const { accounts, categories, macroGroups, addMacroGroup, addMacroToGroup } = useFinance();
  const [grp, setGrp] = useState({ name: "" });
  const [macro, setMacro] = useState({ groupId: "", name: "", emoji: "", amount: 0, accountId: "", categoryId: "" });

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Macros — Biyuyo</title>
        <meta name="description" content="Configura macros para gastos rápidos." />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold">Macros</h1>
        <p className="text-sm text-muted-foreground">
          Crea grupos y accesos rápidos para registrar gastos al instante.
        </p>
      </div>

      <div>
        <div className="space-y-4 p-0">
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
              <NativeSelect value={macro.groupId} onChange={(e) => setMacro((s) => ({ ...s, groupId: e.target.value }))} placeholderOption="Grupo">
                {macroGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label>Emoji</Label>
              <Input
                value={macro.emoji}
                onChange={(e) => {
                  const v = limitToSingleGrapheme(e.target.value);
                  const onlyEmoji = isSingleEmoji(v) ? v : "";
                  setMacro((s) => ({ ...s, emoji: onlyEmoji }));
                }}
                placeholder="☕"
                required
                maxLength={4}
                aria-label="Emoji de macro"
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={macro.name} onChange={(e) => setMacro((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={macro.amount === 0 ? "" : macro.amount}
                onChange={(e) => setMacro((s) => ({ ...s, amount: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Cuenta</Label>
              <NativeSelect value={macro.accountId} onChange={(e) => setMacro((s) => ({ ...s, accountId: e.target.value }))} placeholderOption="Cuenta">
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <NativeSelect value={macro.categoryId} onChange={(e) => setMacro((s) => ({ ...s, categoryId: e.target.value }))} placeholderOption="Categoría">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Button
                className="w-full"
                disabled={!macro.groupId || !macro.name || !macro.emoji || !isSingleEmoji(macro.emoji)}
                onClick={() => macro.groupId && macro.name && isSingleEmoji(macro.emoji) && addMacroToGroup(macro.groupId, { name: macro.name, emoji: macro.emoji, amount: macro.amount, accountId: macro.accountId, categoryId: macro.categoryId })}
              >
                Agregar macro
              </Button>
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
        </div>
      </div>
    </div>
  );
};

export default MacrosSettings;
