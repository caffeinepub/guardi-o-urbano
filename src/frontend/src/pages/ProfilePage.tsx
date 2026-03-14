import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Settings, Shield } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { formatDate, useProfile } from "../hooks/useBackend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function ProfilePage() {
  const { data: profile } = useProfile();
  const { clear, identity } = useInternetIdentity();
  const navigate = useNavigate();

  const initials =
    profile?.name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("") ?? "GU";

  const licenseColor =
    profile?.licenseStatus === "active"
      ? "text-green-400"
      : profile?.licenseStatus === "expired"
        ? "text-destructive"
        : "text-yellow-400";

  const principalStr = identity
    ? `${identity.getPrincipal().toString().slice(0, 20)}...`
    : "—";

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
          Perfil
        </h1>
      </header>

      <main className="relative z-10 flex flex-1 flex-col gap-4 px-4 pt-6">
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-20 w-20 text-2xl">
            <AvatarFallback className="bg-primary/20 font-display font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {profile?.name ?? "—"}
            </h2>
            {profile?.isAdmin && (
              <Badge className="mt-1 bg-primary/20 text-primary">
                <Shield className="mr-1 h-3 w-3" /> Administrador
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {[
            { label: "Principal", value: principalStr },
            {
              label: "Membro desde",
              value: profile ? formatDate(profile.registrationDate) : "—",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-4 py-3"
            >
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-medium text-foreground">
                {value}
              </span>
            </div>
          ))}

          <div className="rounded-xl border border-border/50 bg-card px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Estado da Licença
              </span>
              <span className={`text-sm font-semibold ${licenseColor}`}>
                {profile?.licenseStatus ?? "—"}
              </span>
            </div>
            {profile && (
              <p className="mt-1 text-xs text-muted-foreground">
                Expira em {formatDate(profile.licenseExpiry)}
              </p>
            )}
          </div>
        </div>

        {profile?.isAdmin && (
          <Button
            data-ocid="profile.secondary_button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => navigate({ to: "/admin" })}
          >
            <Settings className="h-4 w-4" />
            Painel de Administração
          </Button>
        )}

        <Button
          data-ocid="profile.button"
          variant="destructive"
          className="w-full"
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
