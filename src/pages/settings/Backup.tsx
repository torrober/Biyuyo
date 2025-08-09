import { useFinance } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet-async";

const BackupSettings = () => {
  const { exportData, importData } = useFinance();

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
        <title>Respaldo — Finanzas Local-First</title>
        <meta name="description" content="Exporta e importa tus datos financieros." />
      </Helmet>

      <Card>
        <CardHeader><CardTitle>Exportar / Importar</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-4">
            <div>
              <Button className="w-full" onClick={download}>Exportar backup.json</Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Selecciona un archivo para restaurar tu respaldo</p>
              <Input type="file" accept="application/json" onChange={(e) => upload(e.target.files?.[0] ?? undefined)} />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Tu información es local y privada. Exporta tu backup para migrar o resguardar tus datos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupSettings;
