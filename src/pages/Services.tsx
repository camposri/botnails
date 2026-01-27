import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Clock, DollarSign, Edit2, Trash2, Scissors, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

interface ServiceSuggestion {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  category: "classico" | "tendencia" | "premium";
}

const serviceSuggestions: ServiceSuggestion[] = [
  // Clássicos
  { name: "Manicure Tradicional", description: "Corte, lixamento e esmaltação das unhas das mãos", duration_minutes: 45, price: 35, category: "classico" },
  { name: "Pedicure Tradicional", description: "Corte, lixamento e esmaltação das unhas dos pés", duration_minutes: 60, price: 45, category: "classico" },
  { name: "Manicure + Pedicure", description: "Combo completo mãos e pés", duration_minutes: 90, price: 70, category: "classico" },
  { name: "Cutilagem", description: "Remoção de cutículas com alicate profissional", duration_minutes: 30, price: 25, category: "classico" },
  { name: "Esmaltação Simples", description: "Aplicação de esmalte comum", duration_minutes: 20, price: 20, category: "classico" },
  // Tendências
  { name: "Esmaltação em Gel", description: "Esmalte em gel com maior durabilidade (até 3 semanas)", duration_minutes: 60, price: 60, category: "tendencia" },
  { name: "Unhas de Fibra de Vidro", description: "Alongamento natural com fibra de vidro", duration_minutes: 90, price: 120, category: "tendencia" },
  { name: "Unhas em Gel Moldado", description: "Alongamento com gel moldado na unha", duration_minutes: 120, price: 150, category: "tendencia" },
  { name: "Nail Art Simples", description: "Decoração artística simples (flores, listras, pontos)", duration_minutes: 30, price: 25, category: "tendencia" },
  { name: "Nail Art Elaborada", description: "Decoração artística complexa e personalizada", duration_minutes: 60, price: 50, category: "tendencia" },
  { name: "Francesinha", description: "Esmaltação estilo francês clássico ou colorido", duration_minutes: 45, price: 40, category: "tendencia" },
  { name: "Baby Boomer", description: "Degradê suave do branco ao nude, estilo clássico", duration_minutes: 60, price: 55, category: "tendencia" },
  { name: "Unhas Cromadas", description: "Efeito espelhado metalizado nas unhas", duration_minutes: 50, price: 65, category: "tendencia" },
  { name: "Pedrarias e Joias", description: "Aplicação de pedrarias, strass e joias de unha", duration_minutes: 40, price: 45, category: "tendencia" },
  // Premium
  { name: "Spa dos Pés", description: "Escalda pés, esfoliação, hidratação profunda e pedicure", duration_minutes: 90, price: 120, category: "premium" },
  { name: "Spa das Mãos", description: "Esfoliação, hidratação intensiva e manicure completa", duration_minutes: 60, price: 80, category: "premium" },
  { name: "Blindagem de Unhas", description: "Fortalecimento e proteção das unhas naturais", duration_minutes: 45, price: 70, category: "premium" },
  { name: "Manutenção de Alongamento", description: "Retoque e manutenção de unhas alongadas", duration_minutes: 60, price: 80, category: "premium" },
  { name: "Remoção de Alongamento", description: "Remoção segura de unhas de gel ou acrílico", duration_minutes: 45, price: 50, category: "premium" },
];

const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  duration_minutes: z.number().min(15, "Duração mínima de 15 minutos"),
  price: z.number().min(0, "Preço deve ser positivo"),
  is_active: z.boolean(),
});

const Services = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_minutes: 60,
    price: 0,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredServices(services);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredServices(
        services.filter(
          (service) =>
            service.name.toLowerCase().includes(query) ||
            service.description?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, services]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setServices(data || []);
      setFilteredServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({
        title: "Erro ao carregar serviços",
        description: "Não foi possível carregar a lista de serviços",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openNewServiceDialog = () => {
    setSelectedService(null);
    setFormData({
      name: "",
      description: "",
      duration_minutes: 60,
      price: 0,
      is_active: true,
    });
    setErrors({});
    setShowSuggestions(true);
    setIsDialogOpen(true);
  };

  const selectSuggestion = (suggestion: ServiceSuggestion) => {
    setFormData({
      name: suggestion.name,
      description: suggestion.description,
      duration_minutes: suggestion.duration_minutes,
      price: suggestion.price,
      is_active: true,
    });
    setShowSuggestions(false);
  };

  const getCategoryLabel = (category: ServiceSuggestion["category"]) => {
    switch (category) {
      case "classico": return "Clássico";
      case "tendencia": return "Tendência";
      case "premium": return "Premium";
    }
  };

  const getCategoryColor = (category: ServiceSuggestion["category"]) => {
    switch (category) {
      case "classico": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "tendencia": return "bg-pink-500/10 text-pink-600 border-pink-500/20";
      case "premium": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    }
  };

  const openEditServiceDialog = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      duration_minutes: service.duration_minutes,
      price: service.price,
      is_active: service.is_active,
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  const validateForm = () => {
    try {
      serviceSchema.parse(formData);
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        e.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    setSaving(true);
    try {
      if (selectedService) {
        const { error } = await supabase
          .from("services")
          .update({
            name: formData.name,
            description: formData.description || null,
            duration_minutes: formData.duration_minutes,
            price: formData.price,
            is_active: formData.is_active,
          })
          .eq("id", selectedService.id);

        if (error) throw error;

        toast({
          title: "Serviço atualizado! ✅",
          description: `${formData.name} foi atualizado com sucesso`,
        });
      } else {
        const { error } = await supabase.from("services").insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          duration_minutes: formData.duration_minutes,
          price: formData.price,
          is_active: formData.is_active,
        });

        if (error) throw error;

        toast({
          title: "Serviço cadastrado! 🎉",
          description: `${formData.name} foi adicionado à sua lista`,
        });
      }

      setIsDialogOpen(false);
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o serviço",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", selectedService.id);

      if (error) throw error;

      toast({
        title: "Serviço removido",
        description: `${selectedService.name} foi removido da sua lista`,
      });

      setIsDeleteDialogOpen(false);
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o serviço",
        variant: "destructive",
      });
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ is_active: !service.is_active })
        .eq("id", service.id);

      if (error) throw error;

      toast({
        title: service.is_active ? "Serviço desativado" : "Serviço ativado",
        description: `${service.name} foi ${service.is_active ? "desativado" : "ativado"}`,
      });

      fetchServices();
    } catch (error) {
      console.error("Error toggling service status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do serviço",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Serviços
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus serviços e preços
            </p>
          </div>
          <Button
            onClick={openNewServiceDialog}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? "Nenhum serviço encontrado" : "Nenhum serviço cadastrado"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Tente buscar por outro termo"
                  : "Comece adicionando seu primeiro serviço"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={openNewServiceDialog}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Serviço
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={`p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all ${
                      !service.is_active ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <Scissors className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleServiceStatus(service)}
                          className="text-muted-foreground hover:text-foreground"
                          title={service.is_active ? "Desativar" : "Ativar"}
                        >
                          {service.is_active ? (
                            <ToggleRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditServiceDialog(service)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(service)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatDuration(service.duration_minutes)}
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-foreground">
                        <DollarSign className="w-4 h-4 text-primary" />
                        {formatPrice(service.price)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Add/Edit Service Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl bg-card max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {selectedService ? "Editar Serviço" : "Novo Serviço"}
              </DialogTitle>
            </DialogHeader>

            {/* Service Suggestions - Only show when adding new service */}
            {!selectedService && showSuggestions && (
              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Escolha um serviço popular ou crie o seu próprio</span>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {(["classico", "tendencia", "premium"] as const).map((category) => (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getCategoryColor(category)}`}>
                          {getCategoryLabel(category)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {serviceSuggestions
                          .filter((s) => s.category === category)
                          .map((suggestion) => (
                            <button
                              key={suggestion.name}
                              type="button"
                              onClick={() => selectSuggestion(suggestion)}
                              className="text-left p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                            >
                              <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                {suggestion.name}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {suggestion.duration_minutes}min
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  R$ {suggestion.price}
                                </span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 border-t border-border" />
                  <span className="text-xs text-muted-foreground">ou preencha manualmente</span>
                  <div className="flex-1 border-t border-border" />
                </div>
              </div>
            )}

            {!selectedService && !showSuggestions && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(true)}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Ver sugestões de serviços
              </Button>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Serviço *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Manicure Tradicional"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (showSuggestions) setShowSuggestions(false);
                  }}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o serviço..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="5"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_minutes: parseInt(e.target.value) || 0,
                      })
                    }
                    className={errors.duration_minutes ? "border-destructive" : ""}
                  />
                  {errors.duration_minutes && (
                    <p className="text-sm text-destructive">{errors.duration_minutes}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={errors.price ? "border-destructive" : ""}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Serviço Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Serviços inativos não aparecem para agendamento
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
                >
                  {saving ? "Salvando..." : selectedService ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Remover serviço?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover <strong>{selectedService?.name}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Services;
