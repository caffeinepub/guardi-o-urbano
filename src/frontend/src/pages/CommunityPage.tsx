import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Flag, Plus, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "../components/BottomNav";
import {
  timeAgo,
  useConfirmIncident,
  useCreateIncident,
  useFlagIncident,
  useIncidents,
  useProfile,
} from "../hooks/useBackend";

const INCIDENT_TYPES = [
  { value: "assault", label: "Assalto", color: "bg-red-500/20 text-red-400" },
  {
    value: "accident",
    label: "Acidente",
    color: "bg-orange-500/20 text-orange-400",
  },
  {
    value: "suspicious",
    label: "Movimento Suspeito",
    color: "bg-yellow-500/20 text-yellow-400",
  },
  { value: "danger", label: "Perigo", color: "bg-red-700/20 text-red-600" },
  {
    value: "urgent",
    label: "Aviso Urgente",
    color: "bg-rose-500/20 text-rose-400",
  },
];

export function CommunityPage() {
  const { data: incidents } = useIncidents();
  const { data: profile } = useProfile();
  const { mutate: createIncident, isPending } = useCreateIncident();
  const { mutate: confirm } = useConfirmIncident();
  const { mutate: flag } = useFlagIncident();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  const handleSubmit = () => {
    if (!type || !description) {
      toast.error("Preencha o tipo e a descrição");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        createIncident(
          {
            userName: profile?.name ?? "Utilizador",
            incidentType: type,
            description,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            neighborhood: neighborhood || "Desconhecido",
          },
          {
            onSuccess: () => {
              toast.success("Ocorrência reportada!");
              setOpen(false);
              setType("");
              setDescription("");
              setNeighborhood("");
            },
            onError: () => toast.error("Erro ao reportar ocorrência"),
          },
        );
      },
      () => toast.error("Não foi possível obter localização"),
    );
  };

  const visible = (incidents ?? []).filter((i) => i.status !== "removed");

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
      <header className="relative z-10 border-b border-border/50 bg-card/80 px-4 py-4 backdrop-blur-sm">
        <h1 className="font-display text-xl font-bold text-foreground">
          Comunidade
        </h1>
        <p className="text-sm text-muted-foreground">
          Ocorrências reportadas pela comunidade
        </p>
      </header>

      <main className="relative z-10 flex-1 space-y-3 px-4 pt-4">
        {visible.length === 0 ? (
          <div
            data-ocid="community.empty_state"
            className="flex flex-col items-center gap-3 py-16 text-center"
          >
            <AlertTriangle className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              Nenhuma ocorrência reportada.
            </p>
          </div>
        ) : (
          visible.map((incident, idx) => {
            const typeInfo = INCIDENT_TYPES.find(
              (t) => t.value === incident.incidentType,
            );
            return (
              <div
                key={incident.id}
                data-ocid={`community.item.${idx + 1}`}
                className="rounded-2xl border border-border/50 bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    className={`text-xs ${typeInfo?.color ?? "bg-muted text-muted-foreground"}`}
                  >
                    {typeInfo?.label ?? incident.incidentType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(incident.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground">
                  {incident.description}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  📍 {incident.neighborhood} · por {incident.userName}
                </p>
                {incident.adminValidated && (
                  <Badge
                    variant="outline"
                    className="mt-2 text-xs text-green-400"
                  >
                    ✅ Validado
                  </Badge>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    data-ocid={`community.secondary_button.${idx + 1}`}
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-green-400 hover:text-green-300"
                    onClick={() => {
                      confirm(incident.id);
                      toast.success("Ocorrência confirmada");
                    }}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {Number(incident.confirmations)}
                  </Button>
                  <Button
                    data-ocid={`community.secondary_button.${idx + 1}`}
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      flag(incident.id);
                      toast.info("Denúncia enviada");
                    }}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {Number(incident.falseReports)}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            data-ocid="community.open_modal_button"
            className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-glow transition-all active:scale-95"
          >
            <Plus className="h-6 w-6 text-primary-foreground" />
          </button>
        </DialogTrigger>
        <DialogContent
          data-ocid="community.dialog"
          className="mx-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle>Reportar Ocorrência</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Ocorrência</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger data-ocid="community.select" className="bg-card">
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                data-ocid="community.textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o que aconteceu..."
                className="bg-card"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Bairro / Zona</Label>
              <Input
                data-ocid="community.input"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Bairro Central"
                className="bg-card"
              />
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="community.cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                data-ocid="community.submit_button"
                className="flex-1 bg-primary"
                onClick={handleSubmit}
                disabled={isPending}
              >
                Reportar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
