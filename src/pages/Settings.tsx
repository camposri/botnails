import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Link, User, Building, Phone, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  business_name: string | null;
  phone: string | null;
  booking_slug: string | null;
}

const sanitizeSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

const randomCode = (length = 4) => Math.random().toString(36).substring(2, 2 + length);

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingSlug, setBookingSlug] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setBusinessName(data.business_name || "");
        setPhone(data.phone || "");
        setBookingSlug(data.booking_slug || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const base = businessName || fullName || "meu-negocio";
    setBookingSlug(sanitizeSlug(base));
  };

  const handleSave = async (options?: { silent?: boolean }) => {
    if (!user) return;

    setSaving(true);
    try {
      const normalizedBookingSlug = bookingSlug.trim() ? sanitizeSlug(bookingSlug.trim()) : "";
      const updates = {
        user_id: user.id,
        full_name: fullName.trim() || null,
        business_name: businessName.trim() || null,
        phone: phone.trim() || null,
        booking_slug: normalizedBookingSlug || null,
        updated_at: new Date().toISOString(),
      };

      const persist = async (payload: typeof updates) => {
        if (profile) {
          const { error } = await supabase
            .from("profiles")
            .update(payload)
            .eq("id", profile.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from("profiles").insert(payload);
          if (error) throw error;
        }
      };

      try {
        await persist(updates);
      } catch (error) {
        const err = error as { code?: unknown };
        if (String(err?.code || "") === "23505" && normalizedBookingSlug) {
          const suggestedSlug = `${randomCode()}-${normalizedBookingSlug}`;
          const retryUpdates = {
            ...updates,
            booking_slug: suggestedSlug,
          };
          await persist(retryUpdates);
          setBookingSlug(suggestedSlug);
          if (!options?.silent) {
            toast({
              title: "Link já estava em uso",
              description: `Usamos uma variação disponível: ${suggestedSlug}`,
            });
          }
        } else {
          throw error;
        }
      }

      if (!options?.silent) {
        toast({
          title: "Configurações salvas",
          description: "Suas informações foram atualizadas com sucesso.",
        });
      }

      await fetchProfile();
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);

      const err = error as { code?: unknown };
      if (String(err?.code || "") === "23505") {
        toast({
          title: "Slug já existe",
          description: "Este link personalizado já está em uso. Escolha outro.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as configurações.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const copyBookingLink = () => {
    if (!bookingSlug) return;
    
    const link = `${window.location.origin}/book/${bookingSlug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const bookingLink = bookingSlug ? `${window.location.origin}/book/${bookingSlug}` : null;
  const isBookingSlugDirty = bookingSlug.trim() !== (profile?.booking_slug || "");

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie seu perfil e link de agendamento público
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Perfil
                  </CardTitle>
                  <CardDescription>
                    Informações que serão exibidas na página de agendamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessName">Nome do negócio</Label>
                    <div className="relative mt-1">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Ex: Studio Maria Nails"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Booking Link Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5" />
                    Link de Agendamento
                  </CardTitle>
                  <CardDescription>
                    Compartilhe este link com seus clientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bookingSlug">Link personalizado</Label>
                    <div className="flex flex-col sm:flex-row gap-2 mt-1">
                      <Input
                        id="bookingSlug"
                        value={bookingSlug}
                        onChange={(e) => setBookingSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="seu-link-personalizado"
                      />
                      <Button
                        variant="outline"
                        onClick={generateSlug}
                        type="button"
                        className="w-full sm:w-auto"
                      >
                        Gerar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use apenas letras minúsculas, números e hífens
                    </p>
                    {isBookingSlugDirty && bookingSlug.trim() && (
                      <p className="text-xs text-amber-600 mt-2">
                        Salve as configurações para ativar este link.
                      </p>
                    )}
                  </div>

                  {bookingLink && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-2">Seu link:</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <code className="flex-1 text-sm bg-background px-3 py-2 rounded border break-all sm:truncate">
                          {bookingLink}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={async () => {
                            if (isBookingSlugDirty) {
                              const ok = await handleSave({ silent: true });
                              if (!ok) return;
                            }
                            copyBookingLink();
                          }}
                          className="w-full sm:w-10"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button onClick={() => handleSave()} disabled={saving} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar configurações"}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
