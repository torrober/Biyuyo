import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { useFinance } from "@/store/finance";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash, Plus } from "lucide-react";

const currency = (n: number) => n.toLocaleString("es-CO", { style: "currency", currency: "COP" });

const Macros = () => {
  const { macroGroups, categories, accounts, triggerMacro, deleteTransaction, deleteMacroFromGroup, restoreMacroInGroup, updateMacroInGroup, addMacroGroup, addMacroToGroup } = useFinance();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [pending, setPending] = useState<{ groupId: string; macroId: string; amount: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ groupId: string; macroId: string; name: string } | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<{ groupId: string; macroId: string; name: string } | null>(null);
  const [editTarget, setEditTarget] = useState<{
    groupId: string;
    macroId: string;
    name: string;
    emoji: string;
    amount: number;
    accountId: string;
    categoryId: string | null;
  } | null>(null);
  const [macro, setMacro] = useState({ name: "", emoji: "", amount: 0, accountId: "", categoryId: "" });

  const onQuick = (groupId: string, macroId: string, amount: number) => {
    const id = triggerMacro(macroId, groupId);
    if (!id) return;
    toast({
      title: "Transacción registrada",
      description: "Se agregó el gasto con tu macro.",
      action: (
        <Button variant="secondary" onClick={() => deleteTransaction(id)}>Deshacer</Button>
      )
    });
  };

  const onLongPress = (groupId: string, macroId: string, amount: number) => {
    setPending({ groupId, macroId, amount });
    setOpen(true);
  };

  const [pressTimer, setPressTimer] = useState<number | null>(null);

  const startPress = (cb: () => void) => () => {
    const t = window.setTimeout(cb, 450);
    setPressTimer(t);
  };
  const endPress = () => {
    if (pressTimer) window.clearTimeout(pressTimer);
    setPressTimer(null);
  };

  const palette = useMemo(
    () => [
      "#f1c40f",
      "#e67e22",
      "#e74c3c",
      "#9b59b6",
      "#3498db",
      "#2ecc71",
      "#1abc9c",
      "#f39c12",
      "#d35400",
      "#16a085",
    ],
    []
  );

  const colorFor = (key: string) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash << 5) - hash + key.charCodeAt(i);
    const idx = Math.abs(hash) % palette.length;
    return palette[idx];
  };

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Macros de gasto — Finanzas Local-First</title>
        <meta name="description" content="Registra gastos comunes al instante con macros personalizadas." />
        <link rel="canonical" href="/macros" />
      </Helmet>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Macros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full flex items-center justify-center gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Crear nueva macro
          </Button>
        </CardContent>
      </Card>


      {macroGroups.length === 0 && (
        <div className="text-center text-sm text-muted-foreground">
          No hay macros configuradas
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {macroGroups.flatMap((g) => g.macros.map((m) => ({ gId: g.id, m }))).filter(({ m }) => !m.deleted).map(({ gId, m }) => {
          const cat = categories.find((c) => c.id === m.categoryId) ?? null;
          const badges = cat ? [cat] : [];
          const leftEmoji = m.emoji || "💸";
          return (
            <div
              key={m.id}
              className="relative rounded-md border p-3 select-none glass-card w-full"
              onMouseDown={startPress(() => onLongPress(gId, m.id, m.amount))}
              onMouseUp={endPress}
              onMouseLeave={endPress}
              onTouchStart={startPress(() => onLongPress(gId, m.id, m.amount))}
              onTouchEnd={endPress}
              onClick={() => {
                if (pressTimer) return;
                onQuick(gId, m.id, m.amount);
              }}
            >
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-4xl leading-none select-none w-10 text-center shrink-0">{leftEmoji}</div>
                  <div className="min-w-0">
                    <div className="font-semibold text-base whitespace-normal break-words">{m.name}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {badges.map((b) => (
                        <Badge
                          key={b.id}
                          variant="surface"
                          style={{ backgroundColor: colorFor(b.id) + "33" }}
                        >
                          {b.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid justify-items-end gap-1">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTarget({
                          groupId: gId,
                          macroId: m.id,
                          name: m.name,
                          emoji: m.emoji || "",
                          amount: m.amount,
                          accountId: m.accountId,
                          categoryId: m.categoryId ?? null,
                        });
                      }}
                      aria-label="Editar macro"
                    >
                      <Pencil className="h-4 w-4 opacity-80" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ groupId: gId, macroId: m.id, name: m.name });
                      }}
                      aria-label="Eliminar macro"
                    >
                      <Trash className="h-4 w-4 opacity-80" />
                    </Button>
                  </div>
                  <div className="text-xl md:text-2xl font-semibold tabular-nums text-muted-foreground">
                    {currency(m.amount)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Eliminadas */}
      <Accordion type="single" collapsible className="mt-6">
        <AccordionItem value="deleted-macros">
          <AccordionTrigger>Macros eliminadas</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 divide-y">
              {macroGroups
                .flatMap((g) => g.macros.map((m) => ({ gId: g.id, m })))
                .filter(({ m }) => m.deleted)
                .map(({ gId, m }) => {
                  const cat = categories.find((c) => c.id === m.categoryId) ?? null;
                  const badges = cat ? [cat] : [];
                  const leftEmoji = m.emoji || "💸";
                  return (
                    <div
                      key={`deleted-${m.id}`}
                      className="relative select-none w-full opacity-70 px-1 py-3"
                    >
                      <div className="grid grid-cols-[1fr_auto] gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="text-4xl leading-none select-none w-10 text-center shrink-0">{leftEmoji}</div>
                          <div className="min-w-0">
                            <div className="font-semibold text-base whitespace-normal break-words line-through">{m.name}</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {badges.map((b) => (
                                <Badge
                                  key={b.id}
                                  variant="surface"
                                  style={{ backgroundColor: colorFor(b.id) + "33" }}
                                >
                                  {b.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="grid justify-items-end gap-1">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRestoreTarget({ groupId: gId, macroId: m.id, name: m.name })}
                              aria-label="Restaurar macro"
                            >
                              <Pencil className="h-4 w-4 opacity-80" />
                            </Button>
                          </div>
                          <div className="text-xl md:text-2xl font-semibold tabular-nums text-muted-foreground">
                            {currency(m.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {macroGroups.flatMap((g) => g.macros).every((m) => !m.deleted) && (
                <div className="text-sm text-muted-foreground">No hay macros eliminadas.</div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar monto</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              inputMode="decimal"
              value={pending?.amount === 0 ? "" : pending?.amount ?? ""}
              onChange={(e) => setPending((p) => (p ? { ...p, amount: Number(e.target.value) || 0 } : p))}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!pending) return;
                const id = triggerMacro(pending.macroId, pending.groupId, pending.amount);
                if (id) {
                  toast({
                    title: "Transacción registrada",
                    description: `Agregado por ${currency(pending.amount)}`,
                    action: <Button variant="secondary" onClick={() => deleteTransaction(id)}>Deshacer</Button>,
                  });
                }
                setOpen(false);
              }}
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crear macro */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear macro</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Emoji</Label>
              <Input
                value={macro.emoji}
                onChange={(e) => setMacro((s) => ({ ...s, emoji: e.target.value }))}
                placeholder="☕"
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={macro.name}
                onChange={(e) => setMacro((s) => ({ ...s, name: e.target.value }))}
              />
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
              <Select
                value={macro.accountId}
                onValueChange={(v) => setMacro((s) => ({ ...s, accountId: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Cuenta" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={macro.categoryId}
                onValueChange={(v) => setMacro((s) => ({ ...s, categoryId: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!macro.name) return;
                const existing = macroGroups[0]?.id;
                const gid = existing ?? addMacroGroup({ name: "Predeterminado", macros: [] });
                addMacroToGroup(gid, {
                  name: macro.name,
                  emoji: macro.emoji,
                  amount: macro.amount,
                  accountId: macro.accountId,
                  categoryId: macro.categoryId,
                });
                toast({ title: "Macro creada" });
                setMacro({ name: "", emoji: "", amount: 0, accountId: "", categoryId: "" });
                setCreateOpen(false);
              }}
            >
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editar macro */}
      <Dialog open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar macro</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Emoji</Label>
              <Input
                value={editTarget?.emoji ?? ""}
                onChange={(e) => setEditTarget((s) => (s ? { ...s, emoji: e.target.value } : s))}
                placeholder="☕"
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={editTarget?.name ?? ""}
                onChange={(e) => setEditTarget((s) => (s ? { ...s, name: e.target.value } : s))}
              />
            </div>
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={editTarget ? (editTarget.amount === 0 ? "" : editTarget.amount) : ""}
                onChange={(e) => setEditTarget((s) => (s ? { ...s, amount: Number(e.target.value) || 0 } : s))}
              />
            </div>
            <div className="space-y-2">
              <Label>Cuenta</Label>
              <Select
                value={editTarget?.accountId ?? ""}
                onValueChange={(v) => setEditTarget((s) => (s ? { ...s, accountId: v } : s))}
              >
                <SelectTrigger><SelectValue placeholder="Cuenta" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={editTarget?.categoryId ?? ""}
                onValueChange={(v) => setEditTarget((s) => (s ? { ...s, categoryId: v } : s))}
              >
                <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditTarget(null)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!editTarget) return;
                updateMacroInGroup(editTarget.groupId, editTarget.macroId, {
                  name: editTarget.name,
                  emoji: editTarget.emoji,
                  amount: editTarget.amount,
                  accountId: editTarget.accountId,
                  categoryId: editTarget.categoryId ?? null,
                });
                toast({ title: "Macro actualizada" });
                setEditTarget(null);
              }}
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar macro</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p>¿Seguro que deseas eliminar la macro {deleteTarget?.name ? `"${deleteTarget.name}"` : "seleccionada"}?</p>
            <p className="text-sm text-muted-foreground">Esta acción realiza un soft delete. Podrás restaurarla más tarde.</p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleteTarget) return;
                deleteMacroFromGroup(deleteTarget.groupId, deleteTarget.macroId);
                toast({
                  title: "Macro eliminada",
                  description: "Se ocultó esta macro (soft delete).",
                  action: (
                    <Button
                      variant="secondary"
                      onClick={() => restoreMacroInGroup(deleteTarget.groupId, deleteTarget.macroId)}
                    >
                      Restaurar
                    </Button>
                  ),
                });
                setDeleteTarget(null);
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!restoreTarget} onOpenChange={(v) => { if (!v) setRestoreTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar macro</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p>¿Deseas restaurar la macro {restoreTarget?.name ? `"${restoreTarget.name}"` : "seleccionada"}?</p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRestoreTarget(null)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!restoreTarget) return;
                restoreMacroInGroup(restoreTarget.groupId, restoreTarget.macroId);
                toast({ title: "Macro restaurada" });
                setRestoreTarget(null);
              }}
            >
              Restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Macros;
