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
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, Loader2, MapPin, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useResolveSOS, useUpdateSOS } from "../hooks/useBackend";

export function SOSActivePage() {
  const navigate = useNavigate();
  const sosId = localStorage.getItem("guardiao_sos_id") ?? "";
  const { mutate: resolveSOS, isPending: resolving } = useResolveSOS();
  const { mutate: updateLocation } = useUpdateSOS();

  const [elapsed, setElapsed] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [locationStatus, setLocationStatus] = useState(
    "A obter localização...",
  );
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const intervalRef = useRef<number | null>(null);
  const locationRef = useRef<number | null>(null);
  const startTime = useRef<number>(Date.now());
  const navigateRef = useRef(navigate);
  const updateRef = useRef(updateLocation);
  navigateRef.current = navigate;
  updateRef.current = updateLocation;

  useEffect(() => {
    if (!sosId) {
      navigateRef.current({ to: "/dashboard" });
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);

    locationRef.current = window.setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateRef.current({
            id: sosId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setCurrentCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLastUpdate(new Date());
          setLocationStatus("Localização enviada");
        },
        () => setLocationStatus("Erro ao obter localização"),
      );
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateRef.current({
          id: sosId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setCurrentCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLastUpdate(new Date());
        setLocationStatus("Localização a ser partilhada em tempo real");
      },
      () => setLocationStatus("GPS indisponível"),
    );

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (locationRef.current) clearInterval(locationRef.current);
    };
  }, [sosId]);

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((s % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const handleCancel = () => {
    resolveSOS(sosId, {
      onSuccess: () => {
        localStorage.removeItem("guardiao_sos_id");
        toast.success("Alerta cancelado");
        navigate({ to: "/dashboard" });
      },
      onError: () => toast.error("Erro ao cancelar alerta"),
    });
  };

  const mapsUrl = currentCoords
    ? `https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`
    : null;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-between px-6 pb-10 pt-16"
      style={{
        background:
          "linear-gradient(135deg, oklch(22% 0.20 25) 0%, oklch(15% 0.16 20) 50%, oklch(10% 0.12 15) 100%)",
      }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 30%, oklch(40% 0.25 25 / 0.5) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-red-900/50 border-2 border-red-500/50">
            <ShieldAlert className="h-14 w-14 text-red-400" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black tracking-widest text-red-400">
            EMERGÊNCIA ATIVA
          </h1>
          <p className="mt-2 text-sm text-white/50">Alerta SOS em curso</p>
        </div>

        <div className="rounded-2xl border border-red-500/30 bg-red-950/50 px-8 py-4">
          <p className="text-center text-xs uppercase tracking-widest text-white/50">
            Tempo decorrido
          </p>
          <p className="font-mono text-4xl font-bold text-white">
            {formatElapsed(elapsed)}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <MapPin className="h-4 w-4 text-green-400" />
          <div>
            <p className="text-sm text-white">{locationStatus}</p>
            <p className="text-xs text-white/40">
              Última atualização: {lastUpdate.toLocaleTimeString("pt-PT")}
            </p>
            {currentCoords && (
              <p className="text-xs text-white/40">
                {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
              </p>
            )}
          </div>
        </div>

        {mapsUrl && (
          <Button
            data-ocid="sos.secondary_button"
            variant="outline"
            className="gap-2 border-green-500/40 text-green-400 hover:bg-green-500/10"
            onClick={() => window.open(mapsUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            Ver no Google Maps
          </Button>
        )}

        <p className="text-center text-xs text-white/30">
          A sua localização está a ser partilhada em tempo real com o sistema de
          segurança.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              data-ocid="sos.open_modal_button"
              variant="outline"
              className="h-14 w-full border-red-500/50 text-base font-semibold text-red-400 hover:bg-red-500/10"
            >
              {resolving ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              Cancelar Alerta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            data-ocid="sos.dialog"
            className="border-white/10 bg-zinc-900"
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Cancelar Alerta SOS?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/60">
                Tem a certeza que quer cancelar o alerta de emergência? Esta
                ação irá parar o rastreamento em tempo real.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-ocid="sos.cancel_button"
                className="border-white/10 text-white"
              >
                Continuar Alerta
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="sos.confirm_button"
                className="bg-red-700 text-white hover:bg-red-600"
                onClick={handleCancel}
              >
                Sim, Cancelar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
