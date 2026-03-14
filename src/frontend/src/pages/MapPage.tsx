import { AlertTriangle, Car, Eye, Flame, Skull } from "lucide-react";
import { useState } from "react";
import type { Incident } from "../backend.d";
import { BottomNav } from "../components/BottomNav";
import { timeAgo, useIncidents } from "../hooks/useBackend";

const incidentColors: Record<string, string> = {
  assault: "text-red-400",
  accident: "text-orange-400",
  suspicious: "text-yellow-400",
  danger: "text-red-600",
  urgent: "text-red-800",
  default: "text-muted-foreground",
};

const incidentLabels: Record<string, string> = {
  assault: "Assalto",
  accident: "Acidente",
  suspicious: "Suspeito",
  danger: "Perigo",
  urgent: "Urgente",
};

const IncidentIcon = ({ type }: { type: string }) => {
  const cls = `h-4 w-4 ${incidentColors[type] ?? incidentColors.default}`;
  switch (type) {
    case "assault":
      return <Skull className={cls} />;
    case "accident":
      return <Car className={cls} />;
    case "suspicious":
      return <Eye className={cls} />;
    case "danger":
      return <Flame className={cls} />;
    default:
      return <AlertTriangle className={cls} />;
  }
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

export function MapPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [selected, setSelected] = useState<Incident | null>(null);
  const { data: incidents } = useIncidents(
    activeFilter === "Todos" ? null : activeFilter,
  );

  const visible: Incident[] = (incidents ?? []).filter(
    (i) => i.status !== "removed",
  );

  const mapCenter = selected
    ? `${selected.lat},${selected.lng}`
    : "-8.8368,13.2343";

  return (
    <div
      className="relative flex h-screen flex-col"
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
      {/* Filter bar */}
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

      {/* Map iframe */}
      <div className="flex-1 pb-16">
        <iframe
          title="Mapa de Ocorrências"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(mapCenter.split(",")[1]) - 0.1},${Number(mapCenter.split(",")[0]) - 0.1},${Number(mapCenter.split(",")[1]) + 0.1},${Number(mapCenter.split(",")[0]) + 0.1}&layer=mapnik&marker=${mapCenter}`}
          className="h-full w-full border-0"
          style={{ filter: "invert(0.9) hue-rotate(180deg)" }}
        />
      </div>

      {/* Incidents list panel */}
      {visible.length > 0 && (
        <div className="absolute bottom-16 left-0 right-0 z-[999] max-h-48 overflow-y-auto border-t border-border/50 bg-card/95 backdrop-blur-md">
          <div className="flex flex-col gap-0.5 p-2">
            {visible.map((incident, idx) => (
              <button
                key={incident.id}
                type="button"
                data-ocid={`map.item.${idx + 1}`}
                onClick={() =>
                  setSelected(incident === selected ? null : incident)
                }
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                  selected?.id === incident.id
                    ? "bg-primary/20"
                    : "hover:bg-accent"
                }`}
              >
                <IncidentIcon type={incident.incidentType} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {incidentLabels[incident.incidentType] ??
                      incident.incidentType}
                    {incident.neighborhood ? ` · ${incident.neighborhood}` : ""}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {incident.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(incident.createdAt)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {visible.length === 0 && (
        <div className="absolute bottom-16 left-0 right-0 z-[999] border-t border-border/50 bg-card/95 px-4 py-3 text-center backdrop-blur-md">
          <p
            data-ocid="map.empty_state"
            className="text-sm text-muted-foreground"
          >
            Sem ocorrências registadas nesta área.
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
