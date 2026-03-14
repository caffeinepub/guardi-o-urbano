import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Loader2, Phone, Shield, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "../components/BottomNav";
import { useCreateSOS, useProfile } from "../hooks/useBackend";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  method: "sms" | "call" | "both";
}

function loadContacts(): EmergencyContact[] {
  try {
    return JSON.parse(localStorage.getItem("guardiao_contacts") ?? "[]");
  } catch {
    return [];
  }
}

export function SOSTabPage() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { mutate: createSOS, isPending: sosLoading } = useCreateSOS();

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [hasActiveSOS, setHasActiveSOS] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    setContacts(loadContacts());
    setHasActiveSOS(!!localStorage.getItem("guardiao_sos_id"));
  }, []);

  const handleSOS = async () => {
    if (hasActiveSOS) {
      navigate({ to: "/sos-active" });
      return;
    }

    setIsActivating(true);

    let lat = 0;
    let lng = 0;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000,
          maximumAge: 0,
        }),
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {
      toast.error("GPS indisponível. A enviar alerta sem localização.");
    }

    const mapsLink =
      lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : "";
    const message = mapsLink
      ? `ALERTA DE EMERGÊNCIA. Estou em perigo. Minha localização atual é: ${mapsLink}`
      : "ALERTA DE EMERGÊNCIA. Estou em perigo. Localização GPS indisponível.";

    const currentContacts = loadContacts();
    for (const contact of currentContacts) {
      if (contact.method === "sms" || contact.method === "both") {
        window.open(
          `sms:${contact.phone}?body=${encodeURIComponent(message)}`,
          "_blank",
        );
      } else if (contact.method === "call") {
        window.open(`tel:${contact.phone}`, "_blank");
      }
    }

    createSOS(
      {
        userName: profile?.name ?? "Utilizador",
        lat,
        lng,
        neighborhood: profile?.licenseCode ?? "",
      },
      {
        onSuccess: (id) => {
          localStorage.setItem("guardiao_sos_id", id as string);
          toast.success("Alerta SOS enviado! Contactos notificados.");
          setHasActiveSOS(true);
          setIsActivating(false);
          navigate({ to: "/sos-active" });
        },
        onError: () => {
          toast.error("Erro ao registar SOS");
          setIsActivating(false);
        },
      },
    );
  };

  const handleCancel = () => {
    localStorage.removeItem("guardiao_sos_id");
    setHasActiveSOS(false);
    toast.success("Alerta cancelado.");
  };

  const loading = isActivating || sosLoading;

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
            "radial-gradient(circle at 50% 30%, oklch(45% 0.22 25 / 0.4) 0%, transparent 60%)",
        }}
      />

      <header className="relative z-10 flex items-center gap-3 border-b border-white/10 bg-black/30 px-4 py-4 backdrop-blur-sm">
        <Shield className="h-6 w-6 text-red-400" />
        <div>
          <h1 className="font-bold text-white text-lg">SOS — Emergência</h1>
          <p className="text-xs text-white/50">Guardião Urbano</p>
        </div>
        {hasActiveSOS && (
          <Badge className="ml-auto animate-pulse bg-red-600 text-white">
            ATIVO
          </Badge>
        )}
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-6 py-8">
        {/* Main SOS button */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex flex-col items-center gap-4"
        >
          {hasActiveSOS && (
            <div className="absolute h-52 w-52 animate-ping rounded-full bg-red-500/20" />
          )}
          <button
            type="button"
            data-ocid="sos.primary_button"
            onClick={handleSOS}
            disabled={loading}
            className={`relative z-10 flex h-48 w-48 items-center justify-center rounded-full shadow-2xl transition-all active:scale-90 ${
              hasActiveSOS
                ? "bg-gradient-to-br from-red-500 to-red-700 shadow-red-600/60"
                : "bg-gradient-to-br from-red-600 to-red-800 shadow-red-700/50 hover:from-red-500 hover:to-red-700"
            }`}
            style={{
              boxShadow:
                "0 0 60px oklch(40% 0.25 25 / 0.6), 0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {loading ? (
              <Loader2 className="h-16 w-16 animate-spin text-white" />
            ) : (
              <span className="select-none text-5xl font-black tracking-wider text-white drop-shadow-lg">
                SOS
              </span>
            )}
          </button>

          <div className="text-center">
            {hasActiveSOS ? (
              <p className="text-base font-bold text-red-400">⚠️ ALERTA ATIVO</p>
            ) : (
              <p className="text-sm text-white/60">
                Pressione em caso de emergência
              </p>
            )}
          </div>
        </motion.div>

        {/* Active SOS actions */}
        {hasActiveSOS && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full max-w-xs flex-col gap-3"
          >
            <Button
              data-ocid="sos.secondary_button"
              className="h-12 w-full bg-orange-600 text-base font-bold hover:bg-orange-500"
              onClick={() => navigate({ to: "/sos-active" })}
            >
              Ver Alerta Ativo
            </Button>
            <Button
              data-ocid="sos.cancel_button"
              variant="outline"
              className="h-12 w-full border-red-500/40 text-red-400 hover:bg-red-500/10"
              onClick={handleCancel}
            >
              Cancelar Alerta
            </Button>
          </motion.div>
        )}

        {/* Contacts info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-xs"
        >
          {contacts.length > 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                <Users className="h-4 w-4 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  {contacts.length} contacto{contacts.length !== 1 ? "s" : ""}{" "}
                  configurado{contacts.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-white/50">Serão alertados no SOS</p>
              </div>
              <button
                type="button"
                data-ocid="sos.secondary_button"
                className="text-xs text-orange-400 underline underline-offset-2"
                onClick={() => navigate({ to: "/contacts" })}
              >
                Editar
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
                <div>
                  <p className="text-sm font-semibold text-yellow-300">
                    Nenhum contacto configurado
                  </p>
                  <p className="mt-0.5 text-xs text-yellow-400/70">
                    Adiciona contactos para receber alertas SOS
                  </p>
                  <Button
                    data-ocid="sos.secondary_button"
                    className="mt-3 h-8 bg-yellow-500 text-xs font-bold text-black hover:bg-yellow-400"
                    onClick={() => navigate({ to: "/contacts" })}
                  >
                    <Phone className="mr-1.5 h-3.5 w-3.5" />
                    Adicionar Contactos
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
