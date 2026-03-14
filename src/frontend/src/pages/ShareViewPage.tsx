import { useParams } from "@tanstack/react-router";
import { MapPin, RefreshCw } from "lucide-react";
import { timeAgo, useGetLocationShare } from "../hooks/useBackend";

export function ShareViewPage() {
  const { id } = useParams({ from: "/share/$id" });
  const { data: share, isLoading, isError } = useGetLocationShare(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          data-ocid="share.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">A carregar localização...</p>
        </div>
      </div>
    );
  }

  if (isError || !share) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div data-ocid="share.error_state" className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-3 text-muted-foreground">
            Localização não encontrada ou inativa.
          </p>
        </div>
      </div>
    );
  }

  const bbox = `${share.lng - 0.008},${share.lat - 0.008},${share.lng + 0.008},${share.lat + 0.008}`;

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="border-b border-border/50 bg-card/90 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{share.ownerName}</p>
            {share.description && (
              <p className="text-xs text-muted-foreground">
                {share.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              <span className="text-green-400">●</span> Atualizado{" "}
              {timeAgo(share.lastUpdate)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <iframe
          title="Localização partilhada"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${share.lat},${share.lng}`}
          className="h-full w-full border-0"
          style={{ filter: "invert(0.9) hue-rotate(180deg)" }}
        />
      </div>

      <div className="border-t border-border/50 bg-card/80 px-4 py-2 text-center text-xs text-muted-foreground">
        Guardião Urbano · Partilha atualiza automaticamente a cada 30 segundos
      </div>
    </div>
  );
}
