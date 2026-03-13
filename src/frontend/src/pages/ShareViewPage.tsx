import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useParams } from "@tanstack/react-router";
import { MapPin, RefreshCw } from "lucide-react";
import { timeAgo, useGetLocationShare } from "../hooks/useBackend";

// Fix Leaflet icons
(L.Icon.Default.prototype as any)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

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
        <MapContainer
          center={[share.lat, share.lng]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={[share.lat, share.lng]}>
            <Popup>{share.ownerName}</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="border-t border-border/50 bg-card/80 px-4 py-2 text-center text-xs text-muted-foreground">
        Guardião Urbano · Partilha atualiza automaticamente a cada 30 segundos
      </div>
    </div>
  );
}
