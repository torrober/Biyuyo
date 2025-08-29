import { Helmet } from "react-helmet-async";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useFinance, Transaction, TxType } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const currency = (n: number) => n.toLocaleString("es-CO", { style: "currency", currency: "COP" });

const Transacciones = () => {
  const {
    accounts,
    categories,
    transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
  } = useFinance();

  const [query, setQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState<string | "all">("all");
  const [searchParams, setSearchParams] = useSearchParams();

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return transactions.filter((t) => {
      if (accountFilter !== "all" && t.accountId !== accountFilter) return false;
      if (!q) return true;
      const desc = (t.description ?? "").toLowerCase();
      return desc.includes(q);
    });
  }, [transactions, query, accountFilter]);

  // Edit dialog
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Transaction | null>(null);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // New transaction modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState<Omit<Transaction, "id">>({
    type: "expense",
    amount: 0,
    date: new Date().toISOString().slice(0, 16),
    description: "",
    accountId: accounts[0]?.id ?? "",
    categoryId: categories[0]?.id ?? null,
  });

  const onSaveEdit = () => {
    if (!editing) return;
    editTransaction(editing.id, editing);
    setEditing(null);
  };

  const onCreateNew = () => {
    const iso = new Date(newTx.date as string).toISOString();
    addTransaction({ ...newTx, date: iso });
  };

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(Math.min(10, filtered.length));
  }, [filtered]);

  // Load more on reaching page bottom
  useEffect(() => {
    const onScroll = () => {
      const threshold = 100;
      const scrolledToBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold;
      if (scrolledToBottom) {
        setIsLoading(true);
        setVisibleCount((c) => {
          const next = Math.min(c + 5, filtered.length);
          if (next === c) {
            setIsLoading(false);
          } else {
            setTimeout(() => setIsLoading(false), 200);
          }
          return next;
        });
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [filtered.length]);

  const visibleTransactions = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  // Open modal from FAB query param (?new=1)
  useEffect(() => {
    const shouldOpen = searchParams.get("new") === "1";
    if (shouldOpen) setIsModalOpen(true);
  }, [searchParams]);

  // When closing modal, clear ?new param if present
  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open && searchParams.get("new")) {
      searchParams.delete("new");
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Transacciones — Finanzas Local-First</title>
        <meta name="description" content="Historial completo con búsqueda, filtros y edición/eliminación." />
        <link rel="canonical" href="/transacciones" />
      </Helmet>

      {/* Removed the New Transaction card and modal */}

      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Transacciones</h2>
          <div className="grid gap-4">
            {visibleTransactions.map((t) => {
              const date = new Date(t.date);
              const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)} - ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
              const title = t.description || "Transacción";
              
              return (
                <Card
                  key={t.id}
                  className="cursor-pointer transition-colors rounded-xl border"
                  onClick={() => setEditing(t)}
                >
                  <CardHeader className="py-3">
                    <div className="flex items-start gap-3 items-center">
                      <div
                        className={`${
                          t.type === "income"
                            ? "bg-green-100 dark:bg-green-900"
                            : "bg-red-100 dark:bg-red-900"
                        } rounded-md w-9 h-9 flex items-center justify-center shrink-0`}
                      >
                        {t.type === "income" ? (
                          <ArrowUpRight className="h-5 w-5 text-green-700 dark:text-green-300" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-700 dark:text-red-300" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">{title}</span>
                        <span className={`font-semibold ${t.type === "expense" ? "text-red-700 dark:text-red-200" : "text-green-800 dark:text-green-200"}`}>
                          {t.type === "expense" ? `- ${currency(t.amount)}` : `+ ${currency(t.amount)}`}
                        </span>
                        <span className="text-sm text-muted-foreground">{formattedDate}</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay transacciones.</p>
          )}
          {filtered.length > 0 && !hasMore && (
            <p className="text-xs text-muted-foreground text-center">No hay más transacciones</p>
          )}
          {filtered.length > 0 && hasMore && isLoading && (
            <p className="text-xs text-muted-foreground text-center">Cargando más...</p>
          )}
        </div>

        {/* Infinite scroll loads more automatically when reaching the bottom */}
      </div>

      {/* New Transaction Modal (simple form only, opened from FAB) */}
      <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent className="!fixed !inset-0 !left-0 !top-0 !right-0 !bottom-0 !m-0 !w-screen !h-screen !max-w-none !rounded-none !p-4 sm:!p-6 !translate-x-0 !translate-y-0 overflow-y-auto overscroll-none">
          <DialogHeader>
            <DialogTitle>Nueva Transacción</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Tipo</Label>
              <Select value={newTx.type} onValueChange={(v: TxType) => setNewTx((s) => ({ ...s, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Gasto</SelectItem>
                  <SelectItem value="income">Ingreso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Monto</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={newTx.amount === 0 ? "" : newTx.amount}
                onChange={(e) => setNewTx((s) => ({ ...s, amount: Number(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>Fecha</Label>
              <Input type="datetime-local" value={newTx.date as string} onChange={(e) => setNewTx((s) => ({ ...s, date: e.target.value }))} />
            </div>

            <div>
              <Label>Cuenta</Label>
              <Select value={newTx.accountId} onValueChange={(v) => setNewTx((s) => ({ ...s, accountId: v }))}>
                <SelectTrigger><SelectValue placeholder="Cuenta" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Categoría</Label>
              <Select value={newTx.categoryId ?? "none"} onValueChange={(v) => setNewTx((s) => ({ ...s, categoryId: v === "none" ? null : v }))}>
                <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.emoji ?? ""} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descripción</Label>
              <Input value={newTx.description ?? ""} onChange={(e) => setNewTx((s) => ({ ...s, description: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => {
              onCreateNew();
              handleModalOpenChange(false);
            }}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar transacción</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Tipo</Label>
                <Select value={editing.type} onValueChange={(v: TxType) => setEditing({ ...editing, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Gasto</SelectItem>
                    <SelectItem value="income">Ingreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Monto</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={editing.amount === 0 ? "" : editing.amount}
                  onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Fecha</Label>
                <Input type="datetime-local" value={editing.date.slice(0,16)} onChange={(e) => setEditing({ ...editing, date: new Date(e.target.value).toISOString() })} />
              </div>
              <div>
                <Label>Cuenta</Label>
                <Select value={editing.accountId} onValueChange={(v) => setEditing({ ...editing, accountId: v })}>
                  <SelectTrigger><SelectValue placeholder="Cuenta" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoría</Label>
                <Select value={editing.categoryId ?? "none"} onValueChange={(v) => setEditing({ ...editing, categoryId: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Descripción</Label>
                <Input value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={onSaveEdit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar transacción</DialogTitle>
          </DialogHeader>
          <p>Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDelete) deleteTransaction(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transacciones;
