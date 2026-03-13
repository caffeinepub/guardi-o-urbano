import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRegisterUser } from "../hooks/useBackend";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [licenseCode, setLicenseCode] = useState("");
  const { mutate: register, isPending } = useRegisterUser();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !neighborhood || !licenseCode) {
      toast.error("Preencha todos os campos");
      return;
    }
    register(
      { name, phone, neighborhood, licenseCode },
      {
        onSuccess: () => {
          toast.success("Conta criada com sucesso!");
          navigate({ to: "/dashboard" });
        },
        onError: (err) => {
          toast.error(`Erro ao criar conta: ${err.message}`);
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Criar Conta
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Guardião Urbano
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              data-ocid="register.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="João Silva"
              className="h-12 bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Número de Telefone</Label>
            <Input
              id="phone"
              data-ocid="register.input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+258 84 000 0000"
              type="tel"
              className="h-12 bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro / Zona</Label>
            <Input
              id="neighborhood"
              data-ocid="register.input"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Bairro Central"
              className="h-12 bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="license">Código de Licença</Label>
            <Input
              id="license"
              data-ocid="register.input"
              value={licenseCode}
              onChange={(e) => setLicenseCode(e.target.value.toUpperCase())}
              placeholder="GU-XXXX-XXXX"
              className="h-12 bg-card font-mono tracking-widest"
            />
          </div>

          <Button
            type="submit"
            data-ocid="register.submit_button"
            disabled={isPending}
            className="h-14 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> A validar
                licença...
              </>
            ) : (
              "Validar e Criar Conta"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
