import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatDate,
  timeAgo,
  useAdminActivateLicense,
  useAdminActiveSOSAlerts,
  useAdminAllLicenses,
  useAdminAllUsers,
  useAdminBlockLicense,
  useAdminBlockUser,
  useAdminCreateLicense,
  useAdminIncidents,
  useAdminMetrics,
  useAdminRemoveIncident,
  useAdminRenewLicense,
  useAdminUnblockUser,
  useAdminValidateIncident,
} from "@/hooks/useBackend";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText,
  Lock,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  Ticket,
  Trash2,
  Unlock,
  User,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "GUARDIAN-REMOT-1003";
const AUTH_KEY = "remoteAdminAuth";

const gradientBg = {
  background: "linear-gradient(135deg, #2d0000 0%, #1a0000 50%, #0d0000 100%)",
  minHeight: "100vh",
};

// --- Login Gate ---
function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      onAuth();
    } else {
      setError("Senha incorreta. Tente novamente.");
      setPassword("");
    }
  }

  return (
    <div style={gradientBg} className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <Card className="border border-red-900/40 bg-black/60 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-red-900/40 border border-red-700/50 flex items-center justify-center">
                <Shield className="w-7 h-7 text-orange-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-display text-white">
              Painel Remoto
            </CardTitle>
            <p className="text-sm text-white/50 font-body mt-1">
              Guardião Urbano · Acesso Restrito
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs uppercase tracking-wider">
                  Senha de Administrador
                </Label>
                <Input
                  data-ocid="remote_admin.input"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••••••••••••"
                  className="bg-red-950/30 border-red-900/40 text-white placeholder:text-white/30 focus:border-orange-500/50"
                />
                {error && (
                  <p
                    data-ocid="remote_admin.error_state"
                    className="text-red-400 text-xs mt-1"
                  >
                    {error}
                  </p>
                )}
              </div>
              <Button
                data-ocid="remote_admin.submit_button"
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold"
              >
                <Lock className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// --- Metric Card ---
function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="bg-black/50 border-red-900/30 relative overflow-hidden">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${color}`}
        style={{ borderRadius: "4px 0 0 4px" }}
      />
      <CardContent className="pt-4 pb-4 pl-5">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-orange-400 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-white leading-none">
              {value}
            </p>
            <p className="text-xs text-white/50 mt-0.5">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Create License Dialog ---
function CreateLicenseDialog() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const create = useAdminCreateLicense();

  async function handleCreate() {
    if (!code || !clientName || !phone) {
      toast.error("Preenche todos os campos");
      return;
    }
    try {
      await create.mutateAsync({ code, clientName, phone });
      toast.success("Licença criada com sucesso!");
      setOpen(false);
      setCode("");
      setClientName("");
      setPhone("");
    } catch {
      toast.error("Erro ao criar licença");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          data-ocid="remote_admin.license.open_modal_button"
          className="bg-orange-600 hover:bg-orange-500 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Nova Licença
        </Button>
      </DialogTrigger>
      <DialogContent
        data-ocid="remote_admin.license.dialog"
        className="bg-zinc-950 border-red-900/40 text-white"
      >
        <DialogHeader>
          <DialogTitle className="text-orange-400">
            Criar Nova Licença
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-white/70 text-xs">Código</Label>
            <Input
              data-ocid="remote_admin.license.input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="LIC-2026-XXXX"
              className="bg-red-950/20 border-red-900/30 text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-white/70 text-xs">Nome do Cliente</Label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome completo"
              className="bg-red-950/20 border-red-900/30 text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-white/70 text-xs">Telefone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+258 84 000 0000"
              className="bg-red-950/20 border-red-900/30 text-white mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            data-ocid="remote_admin.license.cancel_button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            data-ocid="remote_admin.license.confirm_button"
            onClick={handleCreate}
            disabled={create.isPending}
            className="bg-orange-600 hover:bg-orange-500 text-white"
          >
            {create.isPending ? "A criar..." : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Admin Dashboard ---
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [licenseSearch, setLicenseSearch] = useState("");
  const metrics = useAdminMetrics();
  const licenses = useAdminAllLicenses();
  const users = useAdminAllUsers();
  const sosAlerts = useAdminActiveSOSAlerts();
  const incidents = useAdminIncidents();
  const activateLicense = useAdminActivateLicense();
  const renewLicense = useAdminRenewLicense();
  const blockLicense = useAdminBlockLicense();
  const blockUser = useAdminBlockUser();
  const unblockUser = useAdminUnblockUser();
  const validateIncident = useAdminValidateIncident();
  const removeIncident = useAdminRemoveIncident();

  const m = metrics.data;
  const filteredLicenses = (licenses.data ?? []).filter(
    (l) =>
      !licenseSearch ||
      l.code.toLowerCase().includes(licenseSearch.toLowerCase()) ||
      l.clientName.toLowerCase().includes(licenseSearch.toLowerCase()),
  );

  async function handleActivate(code: string) {
    try {
      await activateLicense.mutateAsync(code);
      toast.success("Licença ativada!");
    } catch {
      toast.error("Erro ao ativar licença");
    }
  }

  async function handleRenew(code: string) {
    try {
      await renewLicense.mutateAsync(code);
      toast.success("Licença renovada por 3 meses!");
    } catch {
      toast.error("Erro ao renovar licença");
    }
  }

  async function handleBlockLicense(code: string) {
    try {
      await blockLicense.mutateAsync(code);
      toast.success("Licença bloqueada.");
    } catch {
      toast.error("Erro ao bloquear licença");
    }
  }

  async function handleBlockUser(id: string) {
    try {
      await blockUser.mutateAsync(id);
      toast.success("Utilizador bloqueado.");
    } catch {
      toast.error("Erro ao bloquear utilizador");
    }
  }

  async function handleUnblockUser(id: string) {
    try {
      await unblockUser.mutateAsync(id);
      toast.success("Utilizador reativado.");
    } catch {
      toast.error("Erro ao reativar utilizador");
    }
  }

  async function handleValidateIncident(id: string) {
    try {
      await validateIncident.mutateAsync(id);
      toast.success("Ocorrência validada!");
    } catch {
      toast.error("Erro ao validar ocorrência");
    }
  }

  async function handleRemoveIncident(id: string) {
    try {
      await removeIncident.mutateAsync(id);
      toast.success("Ocorrência removida.");
    } catch {
      toast.error("Erro ao remover ocorrência");
    }
  }

  function getLicenseStatusBadge(status: string) {
    if (status === "active")
      return (
        <Badge className="bg-green-900/60 text-green-300 border-green-700/40">
          Ativa
        </Badge>
      );
    if (status === "expired")
      return (
        <Badge className="bg-red-900/60 text-red-300 border-red-700/40">
          Expirada
        </Badge>
      );
    if (status === "blocked")
      return (
        <Badge className="bg-zinc-800 text-zinc-400 border-zinc-600/40">
          Bloqueada
        </Badge>
      );
    return (
      <Badge className="bg-yellow-900/60 text-yellow-300 border-yellow-700/40">
        Pendente
      </Badge>
    );
  }

  return (
    <div style={gradientBg}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-red-900/30 bg-black/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600/20 border border-orange-600/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white font-display leading-none">
                Painel Remoto · Guardião Urbano
              </h1>
              <p className="text-xs text-white/40 mt-0.5">
                Controlo a distância
              </p>
            </div>
          </div>
          <Button
            data-ocid="remote_admin.logout.button"
            variant="destructive"
            size="sm"
            onClick={onLogout}
            className="bg-red-900/70 hover:bg-red-800 border border-red-700/40 text-white"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Terminar Sessão
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="overview">
          <TabsList
            data-ocid="remote_admin.tab"
            className="bg-black/50 border border-red-900/30 mb-6 flex flex-wrap h-auto gap-1 p-1"
          >
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-white/60"
            >
              <Activity className="w-3.5 h-3.5 mr-1" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="licenses"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-white/60"
            >
              <Ticket className="w-3.5 h-3.5 mr-1" />
              Licenças
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-white/60"
            >
              <Users className="w-3.5 h-3.5 mr-1" />
              Utilizadores
            </TabsTrigger>
            <TabsTrigger
              value="sos"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-white/60"
            >
              <Zap className="w-3.5 h-3.5 mr-1" />
              SOS ao Vivo
            </TabsTrigger>
            <TabsTrigger
              value="incidents"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-white/60"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              Ocorrências
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview">
            {metrics.isLoading ? (
              <div
                data-ocid="remote_admin.overview.loading_state"
                className="text-white/40 text-center py-8"
              >
                A carregar métricas...
              </div>
            ) : metrics.isError ? (
              <div
                data-ocid="remote_admin.overview.error_state"
                className="text-red-400 text-center py-8"
              >
                Erro ao carregar métricas. Verifica a ligação.
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-3"
              >
                <MetricCard
                  label="Total Utilizadores"
                  value={Number(m?.totalUsers ?? 0)}
                  icon={Users}
                  color="bg-orange-500"
                />
                <MetricCard
                  label="Licenças Ativas"
                  value={Number(m?.activeLicenses ?? 0)}
                  icon={CheckCircle}
                  color="bg-green-500"
                />
                <MetricCard
                  label="Licenças Expiradas"
                  value={Number(m?.expiredLicenses ?? 0)}
                  icon={Ticket}
                  color="bg-yellow-500"
                />
                <MetricCard
                  label="Total SOS"
                  value={Number(m?.totalSOSCount ?? 0)}
                  icon={ShieldAlert}
                  color="bg-red-500"
                />
                <MetricCard
                  label="SOS Ativos"
                  value={sosAlerts.data?.length ?? 0}
                  icon={Zap}
                  color="bg-red-600"
                />
                <MetricCard
                  label="Total Ocorrências"
                  value={Number(m?.totalIncidents ?? 0)}
                  icon={FileText}
                  color="bg-blue-500"
                />
              </motion.div>
            )}
          </TabsContent>

          {/* Licenças */}
          <TabsContent value="licenses">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <Input
                  data-ocid="remote_admin.license.search_input"
                  placeholder="Pesquisar por código ou nome..."
                  value={licenseSearch}
                  onChange={(e) => setLicenseSearch(e.target.value)}
                  className="bg-black/50 border-red-900/30 text-white placeholder:text-white/30 max-w-xs"
                />
                <CreateLicenseDialog />
              </div>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {licenses.isLoading && (
                    <div
                      data-ocid="remote_admin.license.loading_state"
                      className="text-white/40 text-center py-8"
                    >
                      A carregar licenças...
                    </div>
                  )}
                  {licenses.isError && (
                    <div
                      data-ocid="remote_admin.license.error_state"
                      className="text-red-400 text-center py-8"
                    >
                      Erro ao carregar licenças.
                    </div>
                  )}
                  {!licenses.isLoading &&
                    !licenses.isError &&
                    filteredLicenses.length === 0 && (
                      <div
                        data-ocid="remote_admin.license.empty_state"
                        className="text-white/40 text-center py-8"
                      >
                        Nenhuma licença encontrada.
                      </div>
                    )}
                  {filteredLicenses.map((license, i) => (
                    <Card
                      key={license.code}
                      data-ocid={`remote_admin.license.item.${i + 1}`}
                      className="bg-black/50 border-red-900/20 hover:border-orange-600/30 transition-colors"
                    >
                      <CardContent className="py-3 px-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-orange-400 font-mono text-sm font-semibold">
                                {license.code}
                              </span>
                              {getLicenseStatusBadge(license.status)}
                            </div>
                            <p className="text-white/70 text-xs">
                              {license.clientName} · {license.assignedPhone}
                            </p>
                            {license.expiryDate > 0n && (
                              <p className="text-white/40 text-xs">
                                Expira: {formatDate(license.expiryDate)}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              data-ocid={`remote_admin.license.edit_button.${i + 1}`}
                              size="sm"
                              variant="outline"
                              onClick={() => handleActivate(license.code)}
                              className="border-green-700/40 text-green-400 hover:bg-green-900/20 text-xs h-7"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ativar
                            </Button>
                            <Button
                              data-ocid={`remote_admin.license.save_button.${i + 1}`}
                              size="sm"
                              variant="outline"
                              onClick={() => handleRenew(license.code)}
                              className="border-orange-700/40 text-orange-400 hover:bg-orange-900/20 text-xs h-7"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Renovar
                            </Button>
                            <Button
                              data-ocid={`remote_admin.license.delete_button.${i + 1}`}
                              size="sm"
                              variant="outline"
                              onClick={() => handleBlockLicense(license.code)}
                              className="border-red-700/40 text-red-400 hover:bg-red-900/20 text-xs h-7"
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              Bloquear
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Utilizadores */}
          <TabsContent value="users">
            <ScrollArea className="h-[550px]">
              <div className="space-y-2">
                {users.isLoading && (
                  <div
                    data-ocid="remote_admin.users.loading_state"
                    className="text-white/40 text-center py-8"
                  >
                    A carregar utilizadores...
                  </div>
                )}
                {!users.isLoading && (users.data ?? []).length === 0 && (
                  <div
                    data-ocid="remote_admin.users.empty_state"
                    className="text-white/40 text-center py-8"
                  >
                    Nenhum utilizador encontrado.
                  </div>
                )}
                {(users.data ?? []).map((user, i) => (
                  <Card
                    key={String(user.id)}
                    data-ocid={`remote_admin.users.item.${i + 1}`}
                    className="bg-black/50 border-red-900/20 hover:border-orange-600/30 transition-colors"
                  >
                    <CardContent className="py-3 px-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-900/30 border border-orange-700/30 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {user.name}
                            </p>
                            <p className="text-white/40 text-xs">
                              {user.licenseCode}
                            </p>
                            <p className="text-white/30 text-xs font-mono">
                              {String(user.id).slice(0, 20)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            data-ocid={`remote_admin.users.secondary_button.${i + 1}`}
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnblockUser(String(user.id))}
                            className="border-green-700/40 text-green-400 hover:bg-green-900/20 text-xs h-7"
                          >
                            <Unlock className="w-3 h-3 mr-1" />
                            Reativar
                          </Button>
                          <Button
                            data-ocid={`remote_admin.users.delete_button.${i + 1}`}
                            size="sm"
                            variant="outline"
                            onClick={() => handleBlockUser(String(user.id))}
                            className="border-red-700/40 text-red-400 hover:bg-red-900/20 text-xs h-7"
                          >
                            <Lock className="w-3 h-3 mr-1" />
                            Bloquear
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* SOS ao Vivo */}
          <TabsContent value="sos">
            <div className="space-y-2">
              {sosAlerts.isLoading && (
                <div
                  data-ocid="remote_admin.sos.loading_state"
                  className="text-white/40 text-center py-8"
                >
                  A carregar alertas SOS...
                </div>
              )}
              {!sosAlerts.isLoading && (sosAlerts.data ?? []).length === 0 && (
                <Card
                  data-ocid="remote_admin.sos.empty_state"
                  className="bg-black/50 border-red-900/20"
                >
                  <CardContent className="py-10 text-center">
                    <Shield className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">Nenhum SOS ativo</p>
                    <p className="text-white/20 text-xs mt-1">
                      A plataforma está tranquila
                    </p>
                  </CardContent>
                </Card>
              )}
              {(sosAlerts.data ?? []).map((sos, i) => (
                <Card
                  key={sos.id}
                  data-ocid={`remote_admin.sos.item.${i + 1}`}
                  className="bg-red-950/30 border-red-700/40"
                >
                  <CardContent className="py-4 px-4">
                    <div className="flex items-start gap-3">
                      <div className="relative mt-1 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-white font-semibold text-sm">
                            {sos.userName}
                          </p>
                          <Badge className="bg-red-800/60 text-red-200 border-red-600/40 text-xs">
                            {timeAgo(sos.activatedAt)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3 h-3 text-red-400" />
                          <span className="text-white/60 text-xs">
                            {sos.neighborhood}
                          </span>
                        </div>
                        <p className="text-white/40 text-xs font-mono mt-1">
                          {sos.lat.toFixed(6)}, {sos.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Ocorrências */}
          <TabsContent value="incidents">
            <ScrollArea className="h-[550px]">
              <div className="space-y-2">
                {incidents.isLoading && (
                  <div
                    data-ocid="remote_admin.incidents.loading_state"
                    className="text-white/40 text-center py-8"
                  >
                    A carregar ocorrências...
                  </div>
                )}
                {!incidents.isLoading &&
                  (incidents.data ?? []).length === 0 && (
                    <div
                      data-ocid="remote_admin.incidents.empty_state"
                      className="text-white/40 text-center py-8"
                    >
                      Nenhuma ocorrência registada.
                    </div>
                  )}
                {(incidents.data ?? []).map((incident, i) => (
                  <Card
                    key={incident.id}
                    data-ocid={`remote_admin.incidents.item.${i + 1}`}
                    className="bg-black/50 border-red-900/20 hover:border-orange-600/30 transition-colors"
                  >
                    <CardContent className="py-3 px-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-orange-400 text-xs font-semibold uppercase">
                              {incident.incidentType}
                            </span>
                            <Badge
                              className={`text-xs ${
                                incident.adminValidated
                                  ? "bg-green-900/50 text-green-300 border-green-700/30"
                                  : "bg-yellow-900/50 text-yellow-300 border-yellow-700/30"
                              }`}
                            >
                              {incident.adminValidated
                                ? "Validada"
                                : "Pendente"}
                            </Badge>
                          </div>
                          <p className="text-white/70 text-xs mt-1 line-clamp-2">
                            {incident.description}
                          </p>
                          <p className="text-white/40 text-xs mt-0.5">
                            {incident.neighborhood} ·{" "}
                            {timeAgo(incident.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {!incident.adminValidated && (
                            <Button
                              data-ocid={`remote_admin.incidents.confirm_button.${i + 1}`}
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleValidateIncident(incident.id)
                              }
                              className="border-green-700/40 text-green-400 hover:bg-green-900/20 text-xs h-7"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Validar
                            </Button>
                          )}
                          <Button
                            data-ocid={`remote_admin.incidents.delete_button.${i + 1}`}
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveIncident(incident.id)}
                            className="border-red-700/40 text-red-400 hover:bg-red-900/20 text-xs h-7"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 pt-2">
        <p className="text-white/20 text-xs">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-white/40"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

// --- Main Page ---
export function RemoteAdminPage() {
  const [authed, setAuthed] = useState(
    () => localStorage.getItem(AUTH_KEY) === "true",
  );

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    toast.success("Sessão terminada.");
  }

  if (!authed) {
    return <LoginGate onAuth={() => setAuthed(true)} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
