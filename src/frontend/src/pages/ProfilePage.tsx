import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Copy, LogOut, Settings, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "../components/BottomNav";
import { formatDate, useProfile } from "../hooks/useBackend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { clear } = useInternetIdentity();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const initials =
    profile?.name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("") ?? "GU";

  const licenseStatus = profile?.licenseStatus ?? null;
  const licenseBadge =
    licenseStatus === "active"
      ? { label: "ATIVA", cls: "bg-green-600 text-white" }
      : licenseStatus === "expired"
        ? { label: "EXPIRADA", cls: "bg-red-700 text-white" }
        : { label: "INATIVA", cls: "bg-yellow-600 text-black" };

  const copyCode = () => {
    if (!profile?.licenseCode) return;
    navigator.clipboard.writeText(profile.licenseCode);
    setCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

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
      <header className="relative z-10 border-b border-white/10 bg-black/30 px-4 py-4 backdrop-blur-sm">
        <h1 className="text-lg font-bold text-white">Conta &amp; Licença</h1>
        <p className="text-xs text-white/50">Informações da tua conta</p>
      </header>

      <main className="relative z-10 flex flex-1 flex-col gap-4 px-4 pt-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3">
          {isLoading ? (
            <Skeleton className="h-20 w-20 rounded-full bg-white/10" />
          ) : (
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarFallback className="bg-orange-500/20 font-bold text-orange-400">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="text-center">
            {isLoading ? (
              <Skeleton className="mx-auto h-7 w-36 bg-white/10" />
            ) : (
              <h2 className="text-2xl font-bold text-white">
                {profile?.name ?? "—"}
              </h2>
            )}
            {profile?.isAdmin && (
              <Badge className="mt-1 bg-orange-500/20 text-orange-400">
                <Shield className="mr-1 h-3 w-3" /> Administrador
              </Badge>
            )}
          </div>
        </div>

        {/* License badge */}
        {isLoading ? (
          <Skeleton className="mx-auto h-8 w-24 bg-white/10" />
        ) : (
          <div className="flex justify-center">
            <Badge
              className={`px-5 py-1.5 text-base font-black ${licenseBadge.cls}`}
            >
              {licenseBadge.label}
            </Badge>
          </div>
        )}

        {/* Info rows */}
        <div className="space-y-2">
          {isLoading ? (
            ["a", "b", "c", "d"].map((k) => (
              <Skeleton
                key={k}
                className="h-14 w-full rounded-xl bg-white/10"
              />
            ))
          ) : (
            <>
              {profile?.phone && (
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-sm text-white/50">Telefone</span>
                  <span className="text-sm font-medium text-white">
                    {profile.phone}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm text-white/50">Expira em</span>
                <span className="text-sm font-medium text-white">
                  {profile ? formatDate(profile.licenseExpiry) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm text-white/50">Membro desde</span>
                <span className="text-sm font-medium text-white">
                  {profile ? formatDate(profile.registrationDate) : "—"}
                </span>
              </div>
              {profile?.licenseCode && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">
                      Código de Licença
                    </span>
                    <button
                      type="button"
                      data-ocid="profile.button"
                      onClick={copyCode}
                      className="flex items-center gap-1 text-xs text-orange-400 transition hover:text-orange-300"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                  <p className="mt-1 font-mono text-sm text-white">
                    {profile.licenseCode}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {profile?.isAdmin && (
          <Button
            data-ocid="profile.secondary_button"
            variant="outline"
            className="w-full gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={() => navigate({ to: "/admin" })}
          >
            <Settings className="h-4 w-4" />
            Painel de Administração
          </Button>
        )}

        <Button
          data-ocid="profile.delete_button"
          variant="destructive"
          className="w-full bg-red-800 hover:bg-red-700"
          onClick={clear}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair da Conta
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
