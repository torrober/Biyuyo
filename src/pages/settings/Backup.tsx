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
          <div className="flex gap-3">
            <Button onClick={download}>Exportar backup.json</Button>
            <Input type="file" accept="application/json" onChange={(e) => upload(e.target.files?.[0] ?? undefined)} />
          </div>
          <p className="text-sm text-muted-foreground">Tu información es local y privada. Exporta tu backup para migrar o resguardar.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupSettings;
