import { useState } from "react";
import { useFinance } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet-async";

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
    </div>
  );
};

export default CategoriesSettings;
