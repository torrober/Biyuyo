import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { useFinance, Transaction, TxType } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const currency = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD" });

const Transacciones = () => {
  const {
    accounts,
    categories,
    transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    createTransfer,
  } = useFinance();

  const [query, setQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState<string | "all">("all");

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

  // New transaction form (advanced)
  const [newTx, setNewTx] = useState<Omit<Transaction, "id">>({
    type: "expense",
    amount: 0,
    date: new Date().toISOString().slice(0, 16), // for datetime-local
    description: "",
    accountId: accounts[0]?.id ?? "",
    categoryId: categories[0]?.id ?? null,
  });

  // Transfer form
  const [transfer, setTransfer] = useState({
    amount: 0,
    from: accounts[0]?.id ?? "",
    to: accounts[1]?.id ?? "",
    date: new Date().toISOString().slice(0, 16),
    description: "Transferencia",
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

  const onCreateTransfer = () => {
    const iso = new Date(transfer.date).toISOString();
    if (!transfer.from || !transfer.to || transfer.from === transfer.to) return;
    createTransfer({ fromAccountId: transfer.from, toAccountId: transfer.to, amount: transfer.amount, date: iso, description: transfer.description });
  };

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Transacciones — Finanzas Local-First</title>
        <meta name="description" content="Historial completo con búsqueda, filtros y edición/eliminación." />
        <link rel="canonical" href="/transacciones" />
      </Helmet>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nueva transacción (avanzado)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
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
              <Input type="number" value={newTx.amount} onChange={(e) => setNewTx((s) => ({ ...s, amount: Number(e.target.value) }))} />
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
            <div className="col-span-2">
              <Label>Descripción</Label>
              <Input value={newTx.description ?? ""} onChange={(e) => setNewTx((s) => ({ ...s, description: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Button onClick={onCreateNew}>Agregar</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nueva transferencia</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div>
              <Label>Monto</Label>
              <Input type="number" value={transfer.amount} onChange={(e) => setTransfer((s) => ({ ...s, amount: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Fecha</Label>
              <Input type="datetime-local" value={transfer.date} onChange={(e) => setTransfer((s) => ({ ...s, date: e.target.value }))} />
            </div>
            <div>
              <Label>Desde</Label>
              <Select value={transfer.from} onValueChange={(v) => setTransfer((s) => ({ ...s, from: v }))}>
                <SelectTrigger><SelectValue placeholder="Desde" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hacia</Label>
              <Select value={transfer.to} onValueChange={(v) => setTransfer((s) => ({ ...s, to: v }))}>
                <SelectTrigger><SelectValue placeholder="Hacia" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Descripción</Label>
              <Input value={transfer.description} onChange={(e) => setTransfer((s) => ({ ...s, description: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Button onClick={onCreateTransfer}>Transferir</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <Input placeholder="Buscar descripción..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <Select value={accountFilter} onValueChange={(v) => setAccountFilter(v)}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Cuenta" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Fecha</th>
                  <th>Descripción</th>
                  <th>Cuenta</th>
                  <th>Categoría</th>
                  <th>Tipo</th>
                  <th className="text-right">Monto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const acc = accounts.find((a) => a.id === t.accountId)?.name ?? "";
                  const cat = categories.find((c) => c.id === t.categoryId)?.name ?? "";
                  const date = new Date(t.date).toLocaleString();
                  return (
                    <tr key={t.id} className="border-b">
                      <td className="py-2">{date}</td>
                      <td>{t.description}</td>
                      <td>{acc}</td>
                      <td>{cat || "—"}</td>
                      <td>{t.transferId ? "Transferencia" : t.type === "expense" ? "Gasto" : "Ingreso"}</td>
                      <td className="text-right">{t.type === "expense" ? `- ${currency(t.amount)}` : `+ ${currency(t.amount)}`}</td>
                      <td className="text-right">
                        {!t.transferId && (
                          <Button variant="outline" size="sm" onClick={() => setEditing(t)}>Editar</Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(t)}>Eliminar</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
                <Input type="number" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })} />
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
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
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
