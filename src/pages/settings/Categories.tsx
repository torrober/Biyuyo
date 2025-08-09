import { useState } from "react";
import { useFinance } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet-async";
import { Trash2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CategoriesSettings = () => {
  const { categories, addCategory, deleteCategory } = useFinance();
  const [cat, setCat] = useState({ name: "", emoji: "" });

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Categorías — Finanzas Local-First</title>
        <meta name="description" content="Gestiona las categorías para tus gastos e ingresos." />
      </Helmet>

      <Card>
        <CardHeader><CardTitle>Gestión de categorías</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Emoji</Label>
              <Input value={cat.emoji} onChange={(e) => setCat((s) => ({ ...s, emoji: e.target.value }))} placeholder="🍔" />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={cat.name} onChange={(e) => setCat((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div>
              <Button className="w-full" onClick={() => cat.name && addCategory({ name: cat.name, emoji: cat.emoji })}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-md border p-2">
                <div className="text-sm">{c.emoji} {c.name}</div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro de que deseas eliminar la categoría "{c.name}"? Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteCategory(c.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesSettings;
