import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  MapPin,
  RefreshCcw,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { formatDate, useIncidents, useProfile } from "../hooks/useBackend";

const helpSections = [
  {
    emoji: "🚨",
    title: "Alerta SOS",
    desc: "Prima o botão SOS na aba SOS em caso de emergência. O alerta será enviado com a sua localização GPS para os seus contactos de emergência.",
  },
  {
    emoji: "👥",
    title: "Contactos de Emergência",
    desc: "Na aba Contactos, adiciona as pessoas que receberão alertas SMS ou chamadas quando ativar o SOS.",
  },
  {
    emoji: "🗺️",
    title: "Mapa de Ocorrências",
    desc: "Acede ao Mapa pelo atalho rápido para ver ocorrências reportadas em tempo real na tua zona.",
  },
  {
    emoji: "📍",
    title: "Partilha de Localização",
    desc: "Em 'Localização', ativa a partilha em tempo real para que família ou equipa saiba onde estás.",
  },
  {
    emoji: "👤",
    title: "Conta & Licença",
    desc: "Na aba Conta vê o estado da tua licença, data de expiração e código de ativação.",
  },
];

export function DashboardPage() {
  const qc = useQueryClient();
  const { data: profile, isLoading: profileLoading, isError } = useProfile();
  const { data: incidents } = useIncidents();
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

  const licenseColor =
    profile?.licenseStatus === "active"
      ? "text-green-400"
      : profile?.licenseStatus === "expired"
        ? "text-red-400"
        : "text-yellow-400";

  return (
    <div
      className="flex min-h-screen flex-col pb-20"
      style={{
        background:
          "linear-gradient(135deg, oklch(25% 0.18 25) 0%, oklch(18% 0.14 20) 40%, oklch(12% 0.10 15) 100%)",
      }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 40%, oklch(45% 0.22 25 / 0.35) 0%, transparent 55%), radial-gradient(circle at 75% 70%, oklch(35% 0.18 20 / 0.25) 0%, transparent 45%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-400" />
          <span className="font-bold text-white">Guardião Urbano</span>
        </div>
        {profileLoading ? (
          <Skeleton className="h-5 w-20 bg-white/10" />
        ) : (
          <Badge
            variant={
              profile?.licenseStatus === "active" ? "default" : "destructive"
            }
            className={
              profile?.licenseStatus === "active"
                ? "bg-green-700 text-white"
                : ""
            }
          >
            {profile?.licenseStatus === "active" ? "Ativa" : "Inativa"}
          </Badge>
        )}
      </header>

      <main className="relative z-10 flex flex-1 flex-col gap-5 px-4 pt-5">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-white/50">Bem-vindo,</p>
          {profileLoading ? (
            <Skeleton className="mt-1 h-7 w-40 bg-white/10" />
          ) : isError || (!profileLoading && !profile) ? (
            <div
              data-ocid="dashboard.error_state"
              className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3"
            >
              <p className="text-sm text-red-300">
                Erro ao carregar dados. Tenta de novo.
              </p>
              <Button
                data-ocid="dashboard.secondary_button"
                size="sm"
                variant="ghost"
                className="mt-2 text-orange-400"
                onClick={() => qc.invalidateQueries({ queryKey: ["profile"] })}
              >
                <RefreshCcw className="mr-1.5 h-3.5 w-3.5" /> Tentar de novo
              </Button>
            </div>
          ) : (
            <h2 className="text-2xl font-bold text-white">
              {profile?.name ?? "Utilizador"}
            </h2>
          )}
        </motion.div>

        {/* Status cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${licenseColor}`} />
              <span className="text-xs text-white/50">Licença</span>
            </div>
            {profileLoading ? (
              <Skeleton className="mt-2 h-4 w-16 bg-white/10" />
            ) : (
              <>
                <p className={`mt-1 text-sm font-semibold ${licenseColor}`}>
                  {profile?.licenseStatus === "active"
                    ? "Ativa"
                    : (profile?.licenseStatus ?? "—")}
                </p>
                {profile && (
                  <p className="mt-0.5 text-xs text-white/40">
                    Expira: {formatDate(profile.licenseExpiry)}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <MapPin
                className={`h-4 w-4 ${location ? "text-green-400" : "text-yellow-400"}`}
              />
              <span className="text-xs text-white/50">GPS</span>
            </div>
            <p
              className={`mt-1 text-sm font-semibold ${location ? "text-green-400" : "text-yellow-400"}`}
            >
              {location ? "Disponível" : "A obter..."}
            </p>
            {location && (
              <p className="mt-0.5 text-xs text-white/40">
                {location.lat.toFixed(3)}, {location.lng.toFixed(3)}
              </p>
            )}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            {
              label: "Mapa",
              emoji: "🗺️",
              to: "/map",
              ocid: "dashboard.primary_button",
            },
            {
              label: "Comunidade",
              emoji: "👥",
              to: "/community",
              ocid: "dashboard.secondary_button",
            },
          ].map(({ label, emoji, to, ocid }) => (
            <button
              key={to}
              type="button"
              data-ocid={ocid}
              onClick={() => navigate({ to })}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm font-medium text-white/70 transition-all hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-white active:scale-95"
            >
              <span className="text-3xl">{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="font-medium text-white">Alertas Recentes</span>
            </div>
            <Badge variant="secondary" className="bg-white/10 text-white">
              {activeIncidents}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-white/50">
            {activeIncidents > 0
              ? `${activeIncidents} ocorrência${activeIncidents !== 1 ? "s" : ""} registada${activeIncidents !== 1 ? "s" : ""} na comunidade.`
              : "Sem ocorrências recentes na sua zona."}
          </p>
          <Button
            data-ocid="dashboard.secondary_button"
            variant="ghost"
            className="mt-1 h-8 px-0 text-xs text-orange-400 hover:text-orange-300"
            onClick={() => navigate({ to: "/map" })}
          >
            Ver no mapa →
          </Button>
        </motion.div>
      </main>

      {/* Help */}
      <button
        type="button"
        data-ocid="dashboard.button"
        onClick={() => setHelpOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/50 shadow-lg backdrop-blur transition-all hover:text-white active:scale-90"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      <Sheet open={helpOpen} onOpenChange={setHelpOpen}>
        <SheetContent
          side="bottom"
          data-ocid="help.sheet"
          className="max-h-[85vh] rounded-t-2xl border-white/10 bg-zinc-900 px-0 pb-6"
        >
          <SheetHeader className="px-6 pb-4">
            <SheetTitle className="text-lg font-bold text-white">
              Como Usar o Guardião Urbano
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full max-h-[65vh] px-6">
            <div className="flex flex-col gap-3 pb-4">
              {helpSections.map((section) => (
                <div
                  key={section.title}
                  className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <span className="mt-0.5 shrink-0 text-2xl">
                    {section.emoji}
                  </span>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-white">
                      {section.title}
                    </p>
                    <p className="text-xs leading-relaxed text-white/50">
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
