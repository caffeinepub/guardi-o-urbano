import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Incident } from "../backend.d";
import { BottomNav } from "../components/BottomNav";
import { timeAgo, useIncidents } from "../hooks/useBackend";

(L.Icon.Default.prototype as any)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function createColorIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

const incidentColors: Record<string, string> = {
  assault: "#dc2626",
  accident: "#f97316",
  suspicious: "#eab308",
  danger: "#b91c1c",
  urgent: "#7f1d1d",
  default: "#6b7280",
};

const incidentLabels: Record<string, string> = {
  assault: "Assalto",
  accident: "Acidente",
  suspicious: "Suspeito",
  danger: "Perigo",
  urgent: "Urgente",
};

const FILTERS = [
  "Todos",
  "assault",
  "accident",
  "suspicious",
  "danger",
  "urgent",
];
const FILTER_LABELS: Record<string, string> = {
  Todos: "Todos",
  assault: "Assalto",
  accident: "Acidente",
  suspicious: "Suspeito",
  danger: "Perigo",
  urgent: "Urgente",
};

function LocateControl() {
  const map = useMap();
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 14);
    });
  }, [map]);
  return null;
}

export function MapPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const { data: incidents } = useIncidents(
    activeFilter === "Todos" ? null : activeFilter,
  );

  const visible: Incident[] = (incidents ?? []).filter(
    (i) => i.status !== "removed",
  );

  return (
    <div className="relative flex h-screen flex-col bg-background">
      <div className="absolute left-0 right-0 top-0 z-[1000] flex gap-2 overflow-x-auto px-3 py-3 scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            data-ocid="map.tab"
            onClick={() => setActiveFilter(f)}
            className={`flex-none rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card/90 text-muted-foreground backdrop-blur-sm hover:bg-card"
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="flex-1 pb-16">
        <MapContainer
          center={[0, 20]}
          zoom={3}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <LocateControl />
          {visible.map((incident) => (
            <Marker
              key={incident.id}
              position={[incident.lat, incident.lng]}
              icon={createColorIcon(
                incidentColors[incident.incidentType] ?? incidentColors.default,
              )}
            >
              <Popup>
                <div className="min-w-[160px] p-1">
                  <div className="mb-1 font-semibold">
                    {incidentLabels[incident.incidentType] ??
                      incident.incidentType}
                  </div>
                  <p className="text-xs text-gray-600">
                    {incident.description}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {incident.neighborhood} · {timeAgo(incident.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    ✅ {Number(incident.confirmations)} confirmações
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <BottomNav />
    </div>
  );
}
