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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Plus, RefreshCw, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  formatDate,
  timeAgo,
  useActivateLicense,
  useActiveSOSAlerts,
  useAllLicenses,
  useAllUsers,
  useBlockLicense,
  useBlockUser,
  useCreateLicense,
  useIncidents,
  useIsAdmin,
  useMetrics,
  useRemoveIncident,
  useRenewLicense,
  useSetAdmin,
  useUnblockUser,
  useValidateIncident,
} from "../hooks/useBackend";

function MetricCard({
  label,
  value,
  color = "text-foreground",
}: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-3xl font-bold font-display ${color}`}>{value}</p>
    </div>
  );
}

export function AdminPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: metrics } = useMetrics();
  const { data: licenses, refetch: refetchLicenses } = useAllLicenses();
  const { data: users } = useAllUsers();
  const { data: sosAlerts } = useActiveSOSAlerts();
  const { data: incidents } = useIncidents();

  const { mutate: createLicense, isPending: creatingLicense } =
    useCreateLicense();
  const { mutate: activateLicense } = useActivateLicense();
  const { mutate: renewLicense } = useRenewLicense();
  const { mutate: blockLicense } = useBlockLicense();
  const { mutate: blockUser } = useBlockUser();
  const { mutate: unblockUser } = useUnblockUser();
  const { mutate: validateIncident } = useValidateIncident();
  const { mutate: removeIncident } = useRemoveIncident();
  const { mutate: setAdmin } = useSetAdmin();

  const [newLicense, setNewLicense] = useState({
    code: "",
    clientName: "",
    phone: "",
  });
  const [licenseDialog, setLicenseDialog] = useState(false);
  const [search, setSearch] = useState("");

  if (adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-xl font-bold text-foreground">
          Acesso Restrito
        </h2>
        <p className="text-center text-muted-foreground">
          Esta área é exclusiva para administradores.
        </p>
        <Button
          data-ocid="admin.primary_button"
          onClick={() =>
            setAdmin(undefined, {
              onSuccess: () => toast.success("Admin definido!"),
              onError: () => toast.error("Erro"),
            })
          }
          variant="outline"
        >
          Tornar-me Administrador
        </Button>
        <Button
          data-ocid="admin.secondary_button"
          variant="ghost"
          onClick={() => navigate({ to: "/dashboard" })}
        >
          Voltar
        </Button>
      </div>
    );
  }

  const filteredLicenses = (licenses ?? []).filter(
    (l) =>
      l.clientName.toLowerCase().includes(search.toLowerCase()) ||
      l.assignedPhone.includes(search),
  );

  const licenseStatusColor = (s: string) =>
    s === "active"
      ? "text-green-400"
      : s === "expired"
        ? "text-destructive"
        : s === "blocked"
          ? "text-primary"
          : "text-yellow-400";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Painel Admin
            </h1>
            <p className="text-xs text-muted-foreground">
              Guardião Urbano · Acesso Restrito
            </p>
          </div>
          <Button
            data-ocid="admin.secondary_button"
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            ← Voltar
          </Button>
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="dashboard">
          <TabsList
            data-ocid="admin.tab"
            className="mb-4 w-full overflow-x-auto"
          >
            <TabsTrigger value="dashboard" className="flex-1 text-xs">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="licenses" className="flex-1 text-xs">
              Licenças
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1 text-xs">
              Utilizadores
            </TabsTrigger>
            <TabsTrigger value="sos" className="flex-1 text-xs">
              SOS
            </TabsTrigger>
            <TabsTrigger value="incidents" className="flex-1 text-xs">
              Ocorrências
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Total Utilizadores"
                value={Number(metrics?.totalUsers ?? 0)}
              />
              <MetricCard
                label="Licenças Ativas"
                value={Number(metrics?.activeLicenses ?? 0)}
                color="text-green-400"
              />
              <MetricCard
                label="Licenças Expiradas"
                value={Number(metrics?.expiredLicenses ?? 0)}
                color="text-destructive"
              />
              <MetricCard
                label="Total SOS"
                value={Number(metrics?.totalSOSCount ?? 0)}
              />
              <MetricCard
                label="SOS Ativos"
                value={Number(metrics?.activeSOSCount ?? 0)}
                color="text-primary"
              />
              <MetricCard
                label="Total Ocorrências"
                value={Number(metrics?.totalIncidents ?? 0)}
              />
            </div>
          </TabsContent>

          {/* Licenses */}
          <TabsContent value="licenses">
            <div className="mb-3 flex gap-2">
              <Input
                data-ocid="admin.search_input"
                placeholder="Pesquisar por nome ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-card"
              />
              <Dialog open={licenseDialog} onOpenChange={setLicenseDialog}>
                <DialogTrigger asChild>
                  <Button
                    data-ocid="admin.open_modal_button"
                    size="sm"
                    className="flex-none bg-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent data-ocid="admin.dialog">
                  <DialogHeader>
                    <DialogTitle>Nova Licença</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Código</Label>
                      <Input
                        data-ocid="admin.input"
                        value={newLicense.code}
                        onChange={(e) =>
                          setNewLicense({
                            ...newLicense,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="GU-XXXX-XXXX"
                        className="bg-card font-mono"
                      />
                    </div>
                    <div>
                      <Label>Nome do Cliente</Label>
                      <Input
                        data-ocid="admin.input"
                        value={newLicense.clientName}
                        onChange={(e) =>
                          setNewLicense({
                            ...newLicense,
                            clientName: e.target.value,
                          })
                        }
                        placeholder="João Silva"
                        className="bg-card"
                      />
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input
                        data-ocid="admin.input"
                        value={newLicense.phone}
                        onChange={(e) =>
                          setNewLicense({
                            ...newLicense,
                            phone: e.target.value,
                          })
                        }
                        placeholder="+258 84 000 0000"
                        className="bg-card"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-ocid="admin.cancel_button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setLicenseDialog(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        data-ocid="admin.submit_button"
                        className="flex-1 bg-primary"
                        disabled={creatingLicense}
                        onClick={() => {
                          createLicense(newLicense, {
                            onSuccess: () => {
                              toast.success("Licença criada!");
                              setLicenseDialog(false);
                              setNewLicense({
                                code: "",
                                clientName: "",
                                phone: "",
                              });
                              refetchLicenses();
                            },
                            onError: () => toast.error("Erro ao criar licença"),
                          });
                        }}
                      >
                        {creatingLicense ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Criar"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                data-ocid="admin.secondary_button"
                variant="ghost"
                size="sm"
                onClick={() => refetchLicenses()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {filteredLicenses.length === 0 ? (
                <div
                  data-ocid="admin.empty_state"
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhuma licença encontrada.
                </div>
              ) : (
                filteredLicenses.map((lic, idx) => (
                  <div
                    key={lic.code}
                    data-ocid={`admin.item.${idx + 1}`}
                    className="rounded-xl border border-border/50 bg-card p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-sm font-bold text-foreground">
                          {lic.code}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lic.clientName} · {lic.assignedPhone}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expira:{" "}
                          {lic.expiryDate > 0n
                            ? formatDate(lic.expiryDate)
                            : "N/A"}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs ${licenseStatusColor(lic.status)}`}
                      >
                        {lic.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {lic.status === "pending" && (
                        <Button
                          data-ocid={`admin.primary_button.${idx + 1}`}
                          size="sm"
                          className="h-7 bg-green-600 px-2 text-xs text-white hover:bg-green-700"
                          onClick={() => {
                            activateLicense(lic.code);
                            toast.success("Ativada!");
                          }}
                        >
                          Ativar
                        </Button>
                      )}
                      {lic.status === "active" && (
                        <Button
                          data-ocid={`admin.secondary_button.${idx + 1}`}
                          size="sm"
                          className="h-7 bg-primary px-2 text-xs text-primary-foreground hover:bg-primary/90"
                          onClick={() => {
                            renewLicense(lic.code);
                            toast.success("Renovada!");
                          }}
                        >
                          Renovar
                        </Button>
                      )}
                      {lic.status !== "blocked" && (
                        <Button
                          data-ocid={`admin.delete_button.${idx + 1}`}
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2 text-xs"
                          onClick={() => {
                            blockLicense(lic.code);
                            toast.success("Bloqueada!");
                          }}
                        >
                          Bloquear
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <div className="space-y-2">
              {(users ?? []).length === 0 ? (
                <div
                  data-ocid="admin.empty_state"
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum utilizador.
                </div>
              ) : (
                (users ?? []).map((user, idx) => (
                  <div
                    key={user.id.toString()}
                    data-ocid={`admin.item.${idx + 1}`}
                    className="rounded-xl border border-border/50 bg-card p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Licença: {user.licenseCode}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Registado: {formatDate(user.registrationDate)}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs ${licenseStatusColor(user.licenseStatus)}`}
                      >
                        {user.licenseStatus}
                      </Badge>
                    </div>
                    <div className="mt-2 flex gap-1">
                      <Button
                        data-ocid={`admin.delete_button.${idx + 1}`}
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          blockUser(user.id.toString());
                          toast.success("Utilizador bloqueado");
                        }}
                      >
                        Bloquear
                      </Button>
                      <Button
                        data-ocid={`admin.secondary_button.${idx + 1}`}
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          unblockUser(user.id.toString());
                          toast.success("Utilizador reativado");
                        }}
                      >
                        Reativar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* SOS */}
          <TabsContent value="sos">
            <div className="space-y-2">
              {(sosAlerts ?? []).length === 0 ? (
                <div
                  data-ocid="admin.empty_state"
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhum SOS ativo.
                </div>
              ) : (
                (sosAlerts ?? []).map((sos, idx) => (
                  <div
                    key={sos.id}
                    data-ocid={`admin.item.${idx + 1}`}
                    className="rounded-xl border border-destructive/30 bg-destructive/10 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-destructive">
                          {sos.userName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sos.neighborhood}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ativado {timeAgo(sos.activatedAt)} · Atualizado{" "}
                          {timeAgo(sos.lastLocationUpdate)}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {sos.lat.toFixed(5)}, {sos.lng.toFixed(5)}
                        </p>
                      </div>
                      <div className="h-3 w-3 animate-pulse rounded-full bg-destructive" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Incidents */}
          <TabsContent value="incidents">
            <div className="space-y-2">
              {(incidents ?? []).length === 0 ? (
                <div
                  data-ocid="admin.empty_state"
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhuma ocorrência.
                </div>
              ) : (
                (incidents ?? []).map((inc, idx) => (
                  <div
                    key={inc.id}
                    data-ocid={`admin.item.${idx + 1}`}
                    className="rounded-xl border border-border/50 bg-card p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="secondary" className="mb-1 text-xs">
                          {inc.incidentType}
                        </Badge>
                        <p className="text-sm text-foreground">
                          {inc.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {inc.neighborhood} · {timeAgo(inc.createdAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ✅ {Number(inc.confirmations)} · 🚩{" "}
                          {Number(inc.falseReports)}
                        </p>
                      </div>
                      {inc.adminValidated && (
                        <Badge className="text-xs text-green-400">
                          Validado
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 flex gap-1">
                      <Button
                        data-ocid={`admin.primary_button.${idx + 1}`}
                        size="sm"
                        className="h-7 bg-green-600 px-2 text-xs text-white hover:bg-green-700"
                        onClick={() => {
                          validateIncident(inc.id);
                          toast.success("Validada!");
                        }}
                      >
                        Validar
                      </Button>
                      <Button
                        data-ocid={`admin.delete_button.${idx + 1}`}
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          removeIncident(inc.id);
                          toast.success("Removida!");
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
