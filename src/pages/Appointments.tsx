import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMinutes, parseISO, isToday, isTomorrow, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Check,
  List,
  LayoutGrid,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CalendarView from "@/components/dashboard/CalendarView";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  phone: string | null;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

interface Appointment {
  id: string;
  client_id: string | null;
  service_id: string | null;
  client_name: string;
  service_name: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
}

const statusConfig = {
  pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed: { label: "Confirmado", className: "bg-green-100 text-green-800 border-green-200" },
  completed: { label: "Concluído", className: "bg-blue-100 text-blue-800 border-blue-200" },
  cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800 border-red-200" },
};

const timeSlots = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
});

type ViewType = "list" | "calendar";

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<ViewType>("calendar");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<{
    client_id: string;
    service_id: string;
    date: Date;
    start_time: string;
    notes: string;
    status: Appointment["status"];
  }>({
    client_id: "",
    service_id: "",
    date: new Date(),
    start_time: "09:00",
    notes: "",
    status: "pending",
  });

  useEffect(() => {
    if (user) {
      fetchData();
      fetchAllAppointments();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [selectedDate, user]);

  const fetchData = async () => {
    try {
      const [clientsRes, servicesRes] = await Promise.all([
        supabase.from("clients").select("id, name, phone").order("name"),
        supabase.from("services").select("id, name, duration_minutes, price").eq("is_active", true).order("name"),
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (servicesRes.error) throw servicesRes.error;

      setClients(clientsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar clientes e serviços",
        variant: "destructive",
      });
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("date", format(selectedDate, "yyyy-MM-dd"))
        .order("start_time");

      if (error) throw error;

      const typedData = (data || []).map((a) => ({
        ...a,
        status: a.status as "pending" | "confirmed" | "completed" | "cancelled",
      }));

      setAppointments(typedData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAppointments = async () => {
    try {
      // Fetch appointments for a wider range (current month +/- 2 months)
      const start = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const end = format(endOfMonth(new Date(new Date().setMonth(new Date().getMonth() + 2))), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("date")
        .order("start_time");

      if (error) throw error;

      const typedData = (data || []).map((a) => ({
        ...a,
        status: a.status as "pending" | "confirmed" | "completed" | "cancelled",
      }));

      setAllAppointments(typedData);
    } catch (error) {
      console.error("Error fetching all appointments:", error);
    }
  };

  const openNewAppointmentDialog = () => {
    setSelectedAppointment(null);
    setFormData({
      client_id: "",
      service_id: "",
      date: selectedDate,
      start_time: "09:00",
      notes: "",
      status: "pending",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      client_id: appointment.client_id || "",
      service_id: appointment.service_id || "",
      date: parseISO(appointment.date),
      start_time: appointment.start_time.slice(0, 5),
      notes: appointment.notes || "",
      status: appointment.status,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteDialogOpen(true);
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = addMinutes(startDate, durationMinutes);
    return format(endDate, "HH:mm");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.client_id || !formData.service_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um cliente e um serviço",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const client = clients.find((c) => c.id === formData.client_id);
      const service = services.find((s) => s.id === formData.service_id);

      if (!client || !service) {
        throw new Error("Cliente ou serviço não encontrado");
      }

      const endTime = calculateEndTime(formData.start_time, service.duration_minutes);

      const appointmentData = {
        user_id: user.id,
        client_id: formData.client_id,
        service_id: formData.service_id,
        client_name: client.name,
        service_name: service.name,
        date: format(formData.date, "yyyy-MM-dd"),
        start_time: formData.start_time,
        end_time: endTime,
        price: service.price,
        status: formData.status,
        notes: formData.notes || null,
      };

      if (selectedAppointment) {
        const { error } = await supabase
          .from("appointments")
          .update(appointmentData)
          .eq("id", selectedAppointment.id);

        if (error) throw error;

        toast({
          title: "Agendamento atualizado! ✅",
          description: `Horário com ${client.name} foi atualizado`,
        });
      } else {
        const { error } = await supabase.from("appointments").insert(appointmentData);

        if (error) throw error;

        toast({
          title: "Agendamento criado! 🎉",
          description: `Horário com ${client.name} foi agendado`,
        });
      }

      setIsDialogOpen(false);
      fetchAppointments();
      fetchAllAppointments();
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o agendamento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", selectedAppointment.id);

      if (error) throw error;

      toast({
        title: "Agendamento removido",
        description: "O agendamento foi removido da sua agenda",
      });

      setIsDeleteDialogOpen(false);
      fetchAppointments();
      fetchAllAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o agendamento",
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (appointment: Appointment, newStatus: Appointment["status"]) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointment.id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Agendamento marcado como ${statusConfig[newStatus].label.toLowerCase()}`,
      });

      fetchAppointments();
      fetchAllAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const formatDateLabel = () => {
    if (isToday(selectedDate)) return "Hoje";
    if (isTomorrow(selectedDate)) return "Amanhã";
    return format(selectedDate, "EEEE", { locale: ptBR });
  };

  const selectedService = services.find((s) => s.id === formData.service_id);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Agenda
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus agendamentos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <Button
                variant={viewType === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewType("calendar")}
                className="rounded-none"
              >
                <LayoutGrid className="w-4 h-4 mr-1" />
                Calendário
              </Button>
              <Button
                variant={viewType === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewType("list")}
                className="rounded-none"
              >
                <List className="w-4 h-4 mr-1" />
                Lista
              </Button>
            </div>
            <Button
              onClick={openNewAppointmentDialog}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewType === "calendar" ? (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card rounded-2xl border border-border/50 p-4 md:p-6"
            >
              <CalendarView
                appointments={allAppointments}
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  setViewType("list");
                }}
                onAppointmentClick={openEditDialog}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Date Navigation */}
              <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-2xl border border-border/50">
                <Button variant="ghost" size="icon" onClick={() => navigateDate("prev")}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="flex flex-col items-center gap-0">
                      <span className="text-lg font-semibold capitalize">{formatDateLabel()}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card" align="center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" onClick={() => navigateDate("next")}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Appointments List */}
              <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                {loading ? (
                  <div className="p-8 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Nenhum agendamento
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Você não tem agendamentos para esta data
                    </p>
                    <Button
                      onClick={openNewAppointmentDialog}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Agendamento
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    <AnimatePresence>
                      {appointments.map((appointment, index) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 sm:p-6 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center min-w-[60px]">
                                <div className="text-lg font-semibold text-foreground">
                                  {appointment.start_time.slice(0, 5)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {appointment.end_time.slice(0, 5)}
                                </div>
                              </div>
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                                {appointment.client_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">
                                  {appointment.client_name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.service_name} • R$ {appointment.price.toFixed(2).replace(".", ",")}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={statusConfig[appointment.status].className}>
                                {statusConfig[appointment.status].label}
                              </Badge>
                              
                              {appointment.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateStatus(appointment, "confirmed")}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Confirmar"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(appointment)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(appointment)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-card">
            <DialogHeader>
              <DialogTitle className="font-display">
                {selectedAppointment ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Client Select */}
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    {clients.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Nenhum cliente cadastrado
                      </div>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                          {client.phone && (
                            <span className="text-muted-foreground ml-2">
                              ({client.phone})
                            </span>
                          )}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Select */}
              <div className="space-y-2">
                <Label>Serviço *</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => setFormData({ ...formData, service_id: value })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    {services.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Nenhum serviço cadastrado
                      </div>
                    ) : (
                      services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{service.name}</span>
                            <span className="text-muted-foreground ml-4">
                              {service.duration_minutes}min • R$ {service.price.toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.date, "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && setFormData({ ...formData, date })}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Horário *</Label>
                  <Select
                    value={formData.start_time}
                    onValueChange={(value) => setFormData({ ...formData, start_time: value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Horário" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-50 max-h-60">
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Service Info */}
              {selectedService && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium">{selectedService.duration_minutes} minutos</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Término estimado:</span>
                    <span className="font-medium">
                      {calculateEndTime(formData.start_time, selectedService.duration_minutes)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-semibold text-primary">
                      R$ {selectedService.price.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              )}

              {/* Status (for edit) */}
              {selectedAppointment && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as Appointment["status"] })
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-50">
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Observações sobre o agendamento..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Actions */}
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
                  disabled={saving || !formData.client_id || !formData.service_id}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
                >
                  {saving ? "Salvando..." : selectedAppointment ? "Atualizar" : "Agendar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Remover agendamento?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o agendamento de{" "}
                <strong>{selectedAppointment?.client_name}</strong>?
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

export default Appointments;
