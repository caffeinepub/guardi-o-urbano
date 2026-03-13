import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useProfile } from "../hooks/useBackend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  { icon: "🚨", text: "Alertas SOS em tempo real" },
  { icon: "🗺️", text: "Mapa colaborativo de ocorrências" },
  { icon: "📍", text: "Partilha de localização ao vivo" },
  { icon: "👥", text: "Comunidade de segurança urbana" },
];

export function LoginPage() {
  const { login, isLoggingIn, identity, isInitializing } =
    useInternetIdentity();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    if (!identity || isInitializing) return;
    if (profileLoading) return;
    if (profile === null) {
      navigate({ to: "/register" });
    } else if (profile) {
      if (
        profile.licenseStatus === "expired" ||
        profile.licenseStatus === "blocked"
      ) {
        navigate({ to: "/expired" });
      } else {
        navigate({ to: "/dashboard" });
      }
    }
  }, [identity, isInitializing, profile, profileLoading, navigate]);

  const isLoading =
    isLoggingIn || (!!identity && (isInitializing || profileLoading));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div
        className="pointer-events-none fixed inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, oklch(50% 0.23 27) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(30% 0.1 240) 0%, transparent 40%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex w-full max-w-sm flex-col items-center gap-8"
      >
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-primary/20" />
          <div className="absolute inset-2 rounded-xl bg-primary/30" />
          <Shield
            className="relative h-12 w-12 text-primary"
            strokeWidth={1.5}
          />
        </div>

        <div className="text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            Guardião Urbano
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Segurança da cidade nas mãos da comunidade.
          </p>
        </div>

        <div className="w-full space-y-2 rounded-2xl border border-border/50 bg-card p-4">
          {features.map((f, i) => (
            <motion.div
              key={f.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm text-muted-foreground">{f.text}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full"
        >
          <Button
            data-ocid="login.primary_button"
            onClick={() => login()}
            disabled={isLoading}
            className="h-14 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> A carregar...
              </>
            ) : (
              "Entrar com Internet Identity"
            )}
          </Button>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground">
          Sistema de licenciamento obrigatório.
          <br />
          Necessário código de ativação para acesso.
        </p>
      </motion.div>

      <footer className="absolute bottom-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Desenvolvido com ❤️ usando{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
