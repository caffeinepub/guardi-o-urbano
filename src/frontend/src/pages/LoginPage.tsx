import { useNavigate } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

const features = [
  { icon: "🚨", text: "Alertas SOS em tempo real" },
  { icon: "🗺️", text: "Mapa colaborativo de ocorrências" },
  { icon: "📍", text: "Partilha de localização ao vivo" },
  { icon: "👥", text: "Comunidade de segurança urbana" },
];

export function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/register" });
  }, [navigate]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex w-full max-w-sm flex-col items-center gap-8"
      >
        <div className="relative flex h-24 w-24 items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "oklch(55% 0.22 25 / 0.25)" }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0.15, 0.5] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-3 rounded-full"
            style={{ background: "oklch(55% 0.22 25 / 0.40)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.3, 0.7] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />
          <Shield
            className="relative h-12 w-12"
            style={{ color: "oklch(75% 0.18 25)" }}
            strokeWidth={1.5}
          />
        </div>

        <div className="text-center">
          <h1
            className="font-display text-4xl font-bold tracking-tight"
            style={{ color: "oklch(98% 0.005 260)" }}
          >
            Guardião Urbano
          </h1>
          <p className="mt-2 text-sm" style={{ color: "oklch(80% 0.04 30)" }}>
            Segurança da cidade nas mãos da comunidade.
          </p>
        </div>

        <div
          className="w-full space-y-2 rounded-2xl p-4"
          style={{
            background: "oklch(15% 0.08 20 / 0.7)",
            border: "1px solid oklch(35% 0.12 25 / 0.5)",
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-xl">{f.icon}</span>
              <span
                className="text-sm"
                style={{ color: "oklch(85% 0.02 260)" }}
              >
                {f.text}
              </span>
            </motion.div>
          ))}
        </div>

        <p
          className="text-center text-xs"
          style={{ color: "oklch(70% 0.04 30)" }}
        >
          Sistema de licenciamento obrigatório.
          <br />
          Necessário código de ativação para acesso.
        </p>
      </motion.div>

      <footer
        className="absolute bottom-6 text-xs"
        style={{ color: "oklch(65% 0.04 30)" }}
      >
        © {new Date().getFullYear()}. Desenvolvido com ❤️ usando{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline"
          style={{ color: "oklch(75% 0.08 30)" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
