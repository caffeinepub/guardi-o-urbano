import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Loader2,
  MapPin,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "../components/BottomNav";
import {
  formatDate,
  useCreateSOS,
  useIncidents,
  useProfile,
} from "../hooks/useBackend";

const helpSections = [
  {
    emoji: "🚨",
    title: "Alerta SOS",
    desc: "Prima o botão vermelho SOS em caso de emergência. O alerta será enviado com a sua localização GPS para toda a comunidade. Prima novamente para ver o estado do alerta.",
  },
  {
    emoji: "🗺️",
    title: "Mapa de Ocorrências",
    desc: "Aceda ao separador 'Mapa' para ver ocorrências reportadas em tempo real. Pode adicionar novas ocorrências tocando no botão '+' no mapa.",
  },
  {
    emoji: "👥",
    title: "Comunidade",
    desc: "No separador 'Comunidade' veja e comente as últimas ocorrências reportadas pelos outros membros.",
  },
  {
    emoji: "📍",
    title: "Partilha de Localização",
    desc: "Em 'Localização', active a partilha de localização em tempo real para que a sua família ou equipa saiba onde está. Pode também gerar um link para partilhar.",
  },
  {
    emoji: "👤",
    title: "Perfil e Licença",
    desc: "No separador 'Perfil' veja o estado da sua licença, data de expiração e código de ativação. A licença é gerida pelo administrador.",
  },
  {
    emoji: "🔐",
    title: "Acesso Admin",
    desc: "Se for o administrador, no perfil encontrará o botão para aceder ao painel de gestão de licenças e utilizadores.",
  },
];

export function DashboardPage() {
  const { data: profile } = useProfile();
  const { data: incidents } = useIncidents();
  const { mutate: createSOS, isPending: sosLoading } = useCreateSOS();
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    );
  }, []);

  const activeIncidents =
    incidents?.filter((i) => i.status !== "removed").length ?? 0;
  const hasActiveSOS = !!localStorage.getItem("guardiao_sos_id");

  const handleSOS = () => {
    if (!profile) return;
    if (hasActiveSOS) {
      navigate({ to: "/sos-active" });
      return;
    }
    if (!location) {
      toast.error("Aguardando localização GPS...");
      return;
    }
    createSOS(
      {
        userName: profile.name,
        lat: location.lat,
        lng: location.lng,
        neighborhood: profile.licenseCode,
      },
      {
        onSuccess: (id) => {
          localStorage.setItem("guardiao_sos_id", id as string);
          toast.success("Alerta SOS enviado!");
          navigate({ to: "/sos-active" });
        },
        onError: () => toast.error("Erro ao enviar SOS"),
      },
    );
  };

  const licenseColor =
    profile?.licenseStatus === "active"
      ? "text-green-400"
      : profile?.licenseStatus === "expired"
        ? "text-destructive"
        : "text-yellow-400";

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <header className="flex items-center justify-between border-b border-border/50 bg-card/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-display text-sm font-bold text-foreground">
            Guardião Urbano
          </span>
        </div>
        <Badge
          variant={
            profile?.licenseStatus === "active" ? "default" : "destructive"
          }
          className="text-xs"
        >
          {profile?.licenseStatus === "active"
            ? "Licença Ativa"
            : "Licença Inativa"}
        </Badge>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-muted-foreground">Bem-vindo,</p>
          <h2 className="font-display text-2xl font-bold text-foreground">
            {profile?.name ?? "Utilizador"}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-3 py-4"
        >
          <button
            type="button"
            data-ocid="dashboard.primary_button"
            onClick={handleSOS}
            disabled={sosLoading}
            className={`relative flex h-36 w-36 items-center justify-center rounded-full font-display text-2xl font-black tracking-wider text-white shadow-glow transition-all active:scale-95 ${
              hasActiveSOS
                ? "bg-orange-600 sos-pulse"
                : "bg-destructive sos-pulse hover:bg-destructive/90"
            }`}
          >
            {sosLoading ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : (
              <span className="select-none">SOS</span>
            )}
          </button>
          <p className="text-sm text-muted-foreground">
            {hasActiveSOS
              ? "⚠️ Alerta ativo — toque para ver"
              : "Toque em caso de emergência"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="rounded-2xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${licenseColor}`} />
              <span className="text-xs text-muted-foreground">Licença</span>
            </div>
            <p className={`mt-1 text-sm font-semibold ${licenseColor}`}>
              {profile?.licenseStatus === "active"
                ? "Ativa"
                : (profile?.licenseStatus ?? "—")}
            </p>
            {profile && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Expira: {formatDate(profile.licenseExpiry)}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2">
              <MapPin
                className={`h-4 w-4 ${location ? "text-green-400" : "text-yellow-400"}`}
              />
              <span className="text-xs text-muted-foreground">Localização</span>
            </div>
            <p
              className={`mt-1 text-sm font-semibold ${location ? "text-green-400" : "text-yellow-400"}`}
            >
              {location ? "Disponível" : "A obter..."}
            </p>
            {location && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/50 bg-card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="font-medium text-foreground">
                Alertas Recentes
              </span>
            </div>
            <Badge variant="secondary">{activeIncidents}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeIncidents > 0
              ? `${activeIncidents} ocorrência${activeIncidents !== 1 ? "s" : ""} registada${activeIncidents !== 1 ? "s" : ""} na comunidade.`
              : "Sem ocorrências recentes na sua zona."}
          </p>
          <Button
            data-ocid="dashboard.secondary_button"
            variant="ghost"
            className="mt-2 h-8 px-2 text-xs text-primary"
            onClick={() => navigate({ to: "/map" })}
          >
            Ver no mapa →
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-2"
        >
          {[
            { label: "Mapa", emoji: "🗺️", to: "/map" },
            { label: "Comunidade", emoji: "👥", to: "/community" },
            { label: "Localização", emoji: "📍", to: "/location" },
          ].map(({ label, emoji, to }) => (
            <button
              key={to}
              type="button"
              data-ocid="dashboard.secondary_button"
              onClick={() => navigate({ to })}
              className="flex flex-col items-center gap-1 rounded-2xl border border-border/50 bg-card p-3 text-xs text-muted-foreground transition-colors hover:bg-accent"
            >
              <span className="text-2xl">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </motion.div>
      </main>

      {/* Floating Help Button */}
      <button
        type="button"
        data-ocid="dashboard.help_button"
        onClick={() => setHelpOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground shadow-lg transition-all hover:bg-accent hover:text-foreground active:scale-95"
        aria-label="Como usar"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {/* How to Use Sheet */}
      <Sheet open={helpOpen} onOpenChange={setHelpOpen}>
        <SheetContent
          side="bottom"
          data-ocid="help.sheet"
          className="max-h-[85vh] rounded-t-2xl border-border/50 bg-card px-0 pb-6"
        >
          <SheetHeader className="px-6 pb-4">
            <SheetTitle className="font-display text-lg font-bold text-foreground">
              Como Usar o Guardião Urbano
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full max-h-[65vh] px-6">
            <div className="flex flex-col gap-3 pb-4">
              {helpSections.map((section) => (
                <div
                  key={section.title}
                  className="flex gap-4 rounded-xl border border-border/40 bg-background/60 p-4"
                >
                  <span className="mt-0.5 shrink-0 text-2xl">
                    {section.emoji}
                  </span>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-foreground">
                      {section.title}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {section.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <BottomNav />
    </div>
  );
}
