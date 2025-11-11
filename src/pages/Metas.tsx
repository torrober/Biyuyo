import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useFinance } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Minus, Trash2, Sparkles } from "lucide-react";
import type { Goal } from "@/store/finance";

const currency = (n: number) => n.toLocaleString("es-CO", { style: "currency", currency: "COP" });

const GoalCard = ({ goal, onEdit, onAdd, onRemove }: {
  goal: Goal;
  onEdit: () => void;
  onAdd: () => void;
  onRemove: () => void;
}) => {
  const progress = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);

  return (
    <Card className="relative">
      <CardContent className="p-6 space-y-4">
        {/* Header: Nombre y objetivo con botón de editar */}
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-semibold text-foreground">{goal.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-foreground">{currency(goal.targetAmount)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onEdit}
              aria-label="Editar meta"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Barra de progreso */}
        <Progress value={Math.min(100, progress)} className="h-2" />

        {/* Footer: Abonado y restante */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <span className="text-base font-medium text-primary">{currency(goal.savedAmount)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{currency(remaining)}</span>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4 mr-1" />
            Abonar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onRemove}
            disabled={goal.savedAmount === 0}
          >
            <Minus className="h-4 w-4 mr-1" />
            Quitar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Metas = () => {
  const { goals, addGoal, updateGoal, deleteGoal, addToGoal, removeFromGoal } = useFinance();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [amountDialog, setAmountDialog] = useState<{ goal: Goal; type: "add" | "remove" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Goal | null>(null);

  // Form state para crear/editar
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: 0,
    savedAmount: 0,
  });

  const [amountValue, setAmountValue] = useState("");

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      });
      return;
    }
    if (formData.targetAmount <= 0) {
      toast({
        title: "Error",
        description: "El objetivo debe ser mayor a 0",
        variant: "destructive",
      });
      return;
    }
    addGoal({
      name: formData.name.trim(),
      targetAmount: formData.targetAmount,
      savedAmount: formData.savedAmount || 0,
    });
    setIsCreateDialogOpen(false);
    setFormData({ name: "", targetAmount: 0, savedAmount: 0 });
    toast({
      title: "Meta creada",
      description: "La meta ha sido creada exitosamente",
    });
  };

  const handleEdit = () => {
    if (!editingGoal) return;
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      });
      return;
    }
    if (formData.targetAmount <= 0) {
      toast({
        title: "Error",
        description: "El objetivo debe ser mayor a 0",
        variant: "destructive",
      });
      return;
    }
    updateGoal(editingGoal.id, {
      name: formData.name.trim(),
      targetAmount: formData.targetAmount,
      savedAmount: formData.savedAmount,
    });
    setEditingGoal(null);
    setFormData({ name: "", targetAmount: 0, savedAmount: 0 });
    toast({
      title: "Meta actualizada",
      description: "La meta ha sido actualizada exitosamente",
    });
  };

  const handleAmount = () => {
    if (!amountDialog) return;
    const amount = Number(amountValue);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un monto válido",
        variant: "destructive",
      });
      return;
    }

    if (amountDialog.type === "add") {
      addToGoal(amountDialog.goal.id, amount);
      toast({
        title: "Dinero abonado",
        description: `Se abonaron ${currency(amount)} a la meta`,
      });
    } else {
      if (amount > amountDialog.goal.savedAmount) {
        toast({
          title: "Error",
          description: "No puedes quitar más de lo que hay abonado",
          variant: "destructive",
        });
        return;
      }
      removeFromGoal(amountDialog.goal.id, amount);
      toast({
        title: "Dinero retirado",
        description: `Se retiraron ${currency(amount)} de la meta`,
      });
    }
    setAmountDialog(null);
    setAmountValue("");
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      savedAmount: goal.savedAmount,
    });
  };

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Biyuyo — Metas</title>
        <meta name="description" content="Gestiona tus metas de ahorro" />
        <link rel="canonical" href="/metas" />
      </Helmet>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Metas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full flex items-center justify-center gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Crear nueva meta
          </Button>
        </CardContent>
      </Card>

      {/* Lista de metas */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No tienes metas aún</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primera meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => openEditDialog(goal)}
              onAdd={() => setAmountDialog({ goal, type: "add" })}
              onRemove={() => setAmountDialog({ goal, type: "remove" })}
            />
          ))}
        </div>
      )}

      {/* Dialog para crear meta */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Meta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Viaje a Minca"
              />
            </div>
            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={formData.targetAmount === 0 ? "" : formData.targetAmount}
                onChange={(e) =>
                  setFormData({ ...formData, targetAmount: Number(e.target.value) || 0 })
                }
                placeholder="2000000"
              />
            </div>
            <div className="space-y-2">
              <Label>Abonado inicial (opcional)</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={formData.savedAmount === 0 ? "" : formData.savedAmount}
                onChange={(e) =>
                  setFormData({ ...formData, savedAmount: Number(e.target.value) || 0 })
                }
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar meta */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Viaje a Minca"
              />
            </div>
            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={formData.targetAmount === 0 ? "" : formData.targetAmount}
                onChange={(e) =>
                  setFormData({ ...formData, targetAmount: Number(e.target.value) || 0 })
                }
                placeholder="2000000"
              />
            </div>
            <div className="space-y-2">
              <Label>Abonado</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={formData.savedAmount === 0 ? "" : formData.savedAmount}
                onChange={(e) =>
                  setFormData({ ...formData, savedAmount: Number(e.target.value) || 0 })
                }
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => {
                if (editingGoal) {
                  setDeleteConfirm(editingGoal);
                  setEditingGoal(null);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="secondary" onClick={() => setEditingGoal(null)} className="flex-1 sm:flex-none">
                Cancelar
              </Button>
              <Button onClick={handleEdit} className="flex-1 sm:flex-none">Guardar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para abonar/quitar dinero */}
      <Dialog open={!!amountDialog} onOpenChange={(open) => !open && setAmountDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {amountDialog?.type === "add" ? "Abonar a Meta" : "Quitar de Meta"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
            {amountDialog && (
              <div className="text-sm text-muted-foreground">
                <p>Meta: {amountDialog.goal.name}</p>
                <p>Abonado actual: {currency(amountDialog.goal.savedAmount)}</p>
                {amountDialog.type === "remove" && (
                  <p className="text-red-500">
                    Máximo a quitar: {currency(amountDialog.goal.savedAmount)}
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setAmountDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleAmount}>
              {amountDialog?.type === "add" ? "Abonar" : "Quitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Meta</DialogTitle>
          </DialogHeader>
          <p>¿Estás seguro de que quieres eliminar esta meta? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirm) {
                  deleteGoal(deleteConfirm.id);
                  setDeleteConfirm(null);
                  toast({
                    title: "Meta eliminada",
                    description: "La meta ha sido eliminada",
                  });
                }
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

export default Metas;

