import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Edit2, Phone, Plus, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "../components/BottomNav";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  method: "sms" | "call" | "both";
}

function loadContacts(): EmergencyContact[] {
  try {
    return JSON.parse(localStorage.getItem("guardiao_contacts") ?? "[]");
  } catch {
    return [];
  }
}

function saveContacts(contacts: EmergencyContact[]) {
  localStorage.setItem("guardiao_contacts", JSON.stringify(contacts));
}

const methodLabels: Record<EmergencyContact["method"], string> = {
  sms: "SMS",
  call: "Ligação",
  both: "Ambos",
};

const methodColors: Record<EmergencyContact["method"], string> = {
  sms: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  call: "bg-green-500/20 text-green-300 border-green-500/30",
  both: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

export function EmergencyContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editContact, setEditContact] = useState<EmergencyContact | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    method: "sms" as EmergencyContact["method"],
  });

  useEffect(() => {
    setContacts(loadContacts());
  }, []);

  const openAdd = () => {
    setEditContact(null);
    setForm({ name: "", phone: "", method: "sms" });
    setDialogOpen(true);
  };

  const openEdit = (contact: EmergencyContact) => {
    setEditContact(contact);
    setForm({
      name: contact.name,
      phone: contact.phone,
      method: contact.method,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Preenche o nome e o telefone.");
      return;
    }
    let updated: EmergencyContact[];
    if (editContact) {
      updated = contacts.map((c) =>
        c.id === editContact.id ? { ...c, ...form } : c,
      );
      toast.success("Contacto atualizado!");
    } else {
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        ...form,
      };
      updated = [...contacts, newContact];
      toast.success("Contacto adicionado!");
    }
    setContacts(updated);
    saveContacts(updated);
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveContacts(updated);
    setDeleteId(null);
    toast.success("Contacto removido.");
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
            "radial-gradient(circle at 30% 40%, oklch(45% 0.22 25 / 0.3) 0%, transparent 55%)",
        }}
      />

      <header className="relative z-10 border-b border-white/10 bg-black/30 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-orange-400" />
          <div>
            <h1 className="font-bold text-white text-lg">
              Contactos de Emergência
            </h1>
            <p className="text-xs text-white/50">Pessoas alertadas no SOS</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 pt-4">
        {contacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid="contacts.empty_state"
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Phone className="h-9 w-9 text-white/20" />
            </div>
            <div>
              <p className="font-semibold text-white">
                Nenhum contacto adicionado
              </p>
              <p className="mt-1 text-sm text-white/50">
                Adiciona pelo menos um contacto para receber alertas SOS
              </p>
            </div>
            <Button
              data-ocid="contacts.primary_button"
              className="mt-2 bg-orange-600 font-bold hover:bg-orange-500"
              onClick={openAdd}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Contacto
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact, idx) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                data-ocid={`contacts.item.${idx + 1}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                    <span className="text-sm font-bold text-orange-400">
                      {contact.name[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {contact.name}
                    </p>
                    <p className="text-sm text-white/60">{contact.phone}</p>
                  </div>
                  <Badge
                    className={`shrink-0 border text-xs ${methodColors[contact.method]}`}
                  >
                    {methodLabels[contact.method]}
                  </Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    data-ocid={`contacts.edit_button.${idx + 1}`}
                    variant="ghost"
                    size="sm"
                    className="flex-1 border border-white/10 text-white/70 hover:text-white"
                    onClick={() => openEdit(contact)}
                  >
                    <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    data-ocid={`contacts.delete_button.${idx + 1}`}
                    variant="ghost"
                    size="sm"
                    className="flex-1 border border-red-500/20 text-red-400 hover:bg-red-500/10"
                    onClick={() => setDeleteId(contact.id)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Remover
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      {contacts.length > 0 && (
        <button
          type="button"
          data-ocid="contacts.open_modal_button"
          onClick={openAdd}
          className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 shadow-lg transition-all hover:bg-orange-500 active:scale-90"
          style={{ boxShadow: "0 4px 24px oklch(60% 0.2 55 / 0.4)" }}
        >
          <Plus className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="contacts.dialog"
          className="mx-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border-white/10 bg-zinc-900"
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              {editContact ? "Editar Contacto" : "Novo Contacto"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-white/70">Nome</Label>
              <Input
                data-ocid="contacts.input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Nome completo"
                className="border-white/10 bg-black text-white placeholder:text-white/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/70">Telefone</Label>
              <Input
                data-ocid="contacts.input"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+258 84 000 0000"
                type="tel"
                className="border-white/10 bg-black text-white placeholder:text-white/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/70">Tipo de alerta</Label>
              <Select
                value={form.method}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    method: v as EmergencyContact["method"],
                  }))
                }
              >
                <SelectTrigger
                  data-ocid="contacts.select"
                  className="border-white/10 bg-black text-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-zinc-900">
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="call">Ligação</SelectItem>
                  <SelectItem value="both">Ambos (SMS + Ligação)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="contacts.cancel_button"
              variant="ghost"
              className="flex-1 border border-white/10 text-white/70"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              data-ocid="contacts.save_button"
              className="flex-1 bg-orange-600 font-bold hover:bg-orange-500"
              onClick={handleSave}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent
          data-ocid="contacts.dialog"
          className="mx-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border-white/10 bg-zinc-900"
        >
          <DialogHeader>
            <DialogTitle className="text-white">Remover Contacto?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/60">
            Este contacto não receberá mais alertas SOS.
          </p>
          <DialogFooter className="gap-2 pt-2">
            <Button
              data-ocid="contacts.cancel_button"
              variant="ghost"
              className="flex-1 border border-white/10 text-white/70"
              onClick={() => setDeleteId(null)}
            >
              Cancelar
            </Button>
            <Button
              data-ocid="contacts.confirm_button"
              className="flex-1 bg-red-700 font-bold hover:bg-red-600"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
