import { useFinance } from "@/store/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet-async";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { Toast } from "@capacitor/toast";
import { Share } from "@capacitor/share";
import { FilePicker } from "@capawesome/capacitor-file-picker";

const BackupSettings = () => {
  const { exportData, importData } = useFinance();

  const download = async () => {
    const data = exportData();
    const timestamp = Date.now();
    const fileName = `biyuyo-${timestamp}.json`;
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.requestPermissions();

        try {
          await Filesystem.mkdir({
            path: "biyuyo",
            directory: Directory.Documents,
            recursive: true,
          });
        } catch (_) {
          // ignore if already exists
        }

        await Filesystem.writeFile({
          path: `biyuyo/${fileName}`,
          data: data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true,
        });

        const { uri } = await Filesystem.getUri({
          directory: Directory.Documents,
          path: `biyuyo/${fileName}`,
        });
        console.log("Backup saved to:", uri);
        await Toast.show({ text: "Backup guardado en Documents" });

        try {
          const can = await Share.canShare();
          if (can.value) {
            await Share.share({
              title: "Backup exportado",
              text: "Respaldo de datos",
              files: [uri],
              dialogTitle: "Compartir backup",
            });
          }
        } catch (shareErr) {
          console.error("Error opening share sheet:", shareErr);
        }
      } catch (error) {
        console.error("Error saving backup:", error);
        try {
          await Toast.show({ text: "Error al guardar el backup" });
        } catch (_) {
          // ignore toast errors if plugin not installed yet
        }
      }
    } else {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const upload = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    importData(text);
  };

  const pickAndUploadNative = async () => {
    try {
      if (!Capacitor.isNativePlatform()) return;

      // Ensure directory exists (no-op if already there)
      try {
        await Filesystem.mkdir({
          path: "biyuyo",
          directory: Directory.Documents,
          recursive: true,
        });
      } catch (_) {
        // ignore if already exists
      }

      // On Android request permissions proactively
      if (Capacitor.getPlatform() === "android") {
        try {
          await Filesystem.requestPermissions();
        } catch (_) {
          // ignore
        }
      }

      const result = await FilePicker.pickFiles({
        types: ["application/json"],
        limit: 1,
        readData: true,
      });

      const file = result.files?.[0];
      if (!file) return;

      // Prefer base64 data provided by the plugin (safe for small JSON backups)
      if (file.data) {
        // Decode Base64 to string (backups are UTF-8/ASCII JSON)
        const text = atob(file.data);
        importData(text);
        await Toast.show({ text: "Backup importado" });
        return;
      } else {
        await Toast.show({ text: "No se pudo leer el archivo seleccionado" });
      }
    } catch (err) {
      console.error("Error picking file:", err);
      try {
        await Toast.show({ text: "Error al abrir el selector" });
      } catch (_) {}
    }
  };

  return (
    <div className="space-y-6 animate-enter">
      <Helmet>
        <title>Respaldo — Finanzas Local-First</title>
        <meta
          name="description"
          content="Exporta e importa tus datos financieros."
        />
      </Helmet>

      <Card>
        <CardHeader>
          <CardTitle>Exportar backup</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tu información es local y privada. Exporta tu backup para migrar o
            resguardar tus datos.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-4">
            <div>
              <Button className="w-full" onClick={download}>Exportar copia de seguridad</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Importar backup</CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecciona un archivo para restaurar tu respaldo
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Capacitor.isNativePlatform() ? (
              <Button className="w-full" onClick={pickAndUploadNative}>
                Seleccionar backup
              </Button>
            ) : (
              <Input
                type="file"
                accept="application/json"
                onChange={(e) => upload(e.target.files?.[0] ?? undefined)}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupSettings;