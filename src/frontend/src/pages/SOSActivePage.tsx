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
import { Loader2, MapPin, ShieldAlert } from "lucide-react";
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

  return (
    <div className="emergency-bg flex min-h-screen flex-col items-center justify-between bg-background px-6 pb-10 pt-16">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-destructive/30" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-destructive/20">
            <ShieldAlert className="h-14 w-14 text-destructive" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="font-display text-3xl font-black tracking-widest text-destructive">
            EMERGÊNCIA ATIVA
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Alerta SOS em curso
          </p>
        </div>

        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-8 py-4">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">
            Tempo decorrido
          </p>
          <p className="font-mono text-4xl font-bold text-foreground">
            {formatElapsed(elapsed)}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card px-4 py-3">
          <MapPin className="h-4 w-4 text-green-400" />
          <div>
            <p className="text-sm text-foreground">{locationStatus}</p>
            <p className="text-xs text-muted-foreground">
              Última atualização: {lastUpdate.toLocaleTimeString("pt-PT")}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          A sua localização está a ser partilhada em tempo real com o sistema de
          segurança.
        </p>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            data-ocid="sos.open_modal_button"
            variant="outline"
            className="h-14 w-full max-w-sm border-destructive/50 text-base font-semibold text-destructive hover:bg-destructive/10"
          >
            {resolving ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : null}
            Cancelar Alerta
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent data-ocid="sos.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Alerta SOS?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que quer cancelar o alerta de emergência? Esta ação
              irá parar o rastreamento em tempo real.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="sos.cancel_button">
              Continuar Alerta
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="sos.confirm_button"
              className="bg-destructive text-destructive-foreground"
              onClick={handleCancel}
            >
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
