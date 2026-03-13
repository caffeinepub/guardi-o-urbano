import { Button } from "@/components/ui/button";
import { LogOut, ShieldX } from "lucide-react";
import { formatDate, useProfile } from "../hooks/useBackend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function ExpiredPage() {
  const { clear } = useInternetIdentity();
  const { data: profile } = useProfile();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-destructive/20">
          <ShieldX className="h-12 w-12 text-destructive" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Licença Expirada
          </h1>
          <p className="mt-3 text-muted-foreground">
            A sua licença expirou. Contacte o administrador para renovação.
          </p>
          {profile && (
            <p className="mt-2 text-sm text-muted-foreground">
              Data de expiração:{" "}
              <span className="font-medium text-foreground">
                {formatDate(profile.licenseExpiry)}
              </span>
            </p>
          )}
        </div>

        <div className="w-full rounded-2xl border border-border/50 bg-card p-4">
          <p className="text-sm font-medium text-foreground">
            Para renovar a sua licença:
          </p>
          <ul className="mt-2 space-y-1 text-left text-sm text-muted-foreground">
            <li>📞 Contacte o administrador do sistema</li>
            <li>💳 Efectue o pagamento correspondente</li>
            <li>🔑 Receba o novo código de activação</li>
          </ul>
        </div>

        <Button
          data-ocid="expired.button"
          onClick={clear}
          variant="outline"
          className="h-12 w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair da Conta
        </Button>
      </div>
    </div>
  );
}
