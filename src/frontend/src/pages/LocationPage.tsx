import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, MapPin, Navigation, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "../components/BottomNav";
import {
  timeAgo,
  useCreateLocationShare,
  useDeactivateLocationShare,
  useOwnLocationShares,
  useProfile,
  useUpdateLocationShare,
} from "../hooks/useBackend";

export function LocationPage() {
  const { data: shares, refetch } = useOwnLocationShares();
  const { data: profile } = useProfile();
  const { mutate: createShare, isPending } = useCreateLocationShare();
  const { mutate: updateShare } = useUpdateLocationShare();
  const { mutate: deactivate } = useDeactivateLocationShare();

  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const watchRef = useRef<number | null>(null);
  const updateShareRef = useRef(updateShare);
  updateShareRef.current = updateShare;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    );
  }, []);

  const startAutoUpdate = useCallback(() => {
    const ids: string[] = JSON.parse(
      localStorage.getItem("guardiao_share_ids") ?? "[]",
    );
    if (!ids.length) return;
    watchRef.current = window.setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        for (const id of ids) {
          updateShareRef.current({
            id,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        }
      });
    }, 30000);
  }, []);

  useEffect(() => {
    startAutoUpdate();
    return () => {
      if (watchRef.current) clearInterval(watchRef.current);
    };
  }, [startAutoUpdate]);

  const handleStart = () => {
    if (!location) {
      toast.error("Localização não disponível");
      return;
    }
    const shareId = Math.random().toString(36).substring(2, 10);
    const shareLink = `/share/${shareId}`;
    createShare(
      {
        ownerName: profile?.name ?? "Utilizador",
        lat: location.lat,
        lng: location.lng,
        shareLink,
        description: description || null,
      },
      {
        onSuccess: (id) => {
          const ids = JSON.parse(
            localStorage.getItem("guardiao_share_ids") ?? "[]",
          );
          ids.push(id as string);
          localStorage.setItem("guardiao_share_ids", JSON.stringify(ids));
          toast.success("Partilha iniciada!");
          setOpen(false);
          setDescription("");
          refetch();
        },
        onError: () => toast.error("Erro ao iniciar partilha"),
      },
    );
  };

  const handleStop = (id: string) => {
    deactivate(id, {
      onSuccess: () => {
        const ids: string[] = JSON.parse(
          localStorage.getItem("guardiao_share_ids") ?? "[]",
        );
        localStorage.setItem(
          "guardiao_share_ids",
          JSON.stringify(ids.filter((i) => i !== id)),
        );
        toast.success("Partilha encerrada");
      },
    });
  };

  const copyLink = (shareLink: string, id: string) => {
    const full = `${window.location.origin}${shareLink}`;
    navigator.clipboard.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Link copiado!");
  };

  const activeShares = (shares ?? []).filter((s) => s.isActive);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <header className="border-b border-border/50 bg-card/80 px-4 py-4 backdrop-blur-sm">
        <h1 className="font-display text-xl font-bold text-foreground">
          Partilha de Localização
        </h1>
        <p className="text-sm text-muted-foreground">
          Partilhe a sua localização em tempo real
        </p>
      </header>

      <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${location ? "bg-green-500/20" : "bg-yellow-500/20"}`}
        >
          <Navigation
            className={`h-5 w-5 ${location ? "text-green-400" : "text-yellow-400"}`}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {location ? "GPS Disponível" : "A obter localização..."}
          </p>
          {location && (
            <p className="text-xs text-muted-foreground">
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </p>
          )}
        </div>
      </div>

      <main className="flex-1 px-4 pt-4">
        <div className="mb-4">
          <h2 className="font-medium text-foreground">
            Sessões Ativas ({activeShares.length})
          </h2>
        </div>

        {activeShares.length === 0 ? (
          <div
            data-ocid="location.empty_state"
            className="flex flex-col items-center gap-3 py-12 text-center"
          >
            <MapPin className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhuma partilha ativa.</p>
            <p className="text-sm text-muted-foreground">
              Inicie uma nova partilha para partilhar a sua localização.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeShares.map((share, idx) => (
              <div
                key={share.id}
                data-ocid={`location.item.${idx + 1}`}
                className="rounded-2xl border border-border/50 bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                      <span className="text-sm font-medium text-foreground">
                        Partilha Ativa
                      </span>
                    </div>
                    {share.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {share.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Atualizado {timeAgo(share.lastUpdate)}
                    </p>
                  </div>
                  <Button
                    data-ocid={`location.delete_button.${idx + 1}`}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleStop(share.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    data-ocid={`location.secondary_button.${idx + 1}`}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs"
                    onClick={() => copyLink(share.shareLink, share.id)}
                  >
                    {copiedId === share.id ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copiar Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            data-ocid="location.open_modal_button"
            className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-glow transition-all active:scale-95"
          >
            <Plus className="h-6 w-6 text-primary-foreground" />
          </button>
        </DialogTrigger>
        <DialogContent
          data-ocid="location.dialog"
          className="mx-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle>Nova Partilha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A sua localização será partilhada em tempo real através de um link
              único.
            </p>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                data-ocid="location.input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: A caminho do trabalho..."
                className="bg-card"
              />
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="location.cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                data-ocid="location.submit_button"
                className="flex-1 bg-primary"
                onClick={handleStart}
                disabled={isPending || !location}
              >
                Iniciar Partilha
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
