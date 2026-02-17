import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Users, DollarSign, TrendingUp, Plus, ArrowRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import AppointmentCard from "@/components/dashboard/AppointmentCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  client_name: string;
  service_name: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

interface DashboardStats {
  todayAppointments: number;
  totalClients: number;
  todayRevenue: number;
  monthRevenue: number;
  completedThisMonth: number;
}

interface RecentClient {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    totalClients: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    completedThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Fetch upcoming appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*")
        .gte("date", format(today, "yyyy-MM-dd"))
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(10);

      if (appointmentsError) throw appointmentsError;
      
      const typedAppointments = (appointmentsData || []).map(a => ({
        ...a,
        status: a.status as "pending" | "confirmed" | "completed" | "cancelled"
      }));
      setAppointments(typedAppointments);

      // Fetch today's appointments count
      const { count: todayCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("date", format(today, "yyyy-MM-dd"))
        .neq("status", "cancelled");

      // Fetch total clients
      const { count: clientsCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });

      const { data: recentClientsData, error: recentClientsError } = await supabase
        .from("clients")
        .select("id,name,phone,created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentClientsError) throw recentClientsError;
      setRecentClients(recentClientsData || []);

      const { data: todayRevenueData } = await supabase
        .from("appointments")
        .select("price")
        .eq("date", format(today, "yyyy-MM-dd"))
        .eq("status", "completed");

      const todayRevenue = todayRevenueData?.reduce((sum, a) => sum + Number(a.price), 0) || 0;

      // Fetch this month's revenue
      const { data: revenueData } = await supabase
        .from("appointments")
        .select("price")
        .gte("date", format(startOfMonth, "yyyy-MM-dd"))
        .lte("date", format(endOfMonth, "yyyy-MM-dd"))
        .eq("status", "completed");

      const monthRevenue = revenueData?.reduce((sum, a) => sum + Number(a.price), 0) || 0;

      // Fetch completed appointments this month
      const { count: completedCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("date", format(startOfMonth, "yyyy-MM-dd"))
        .lte("date", format(endOfMonth, "yyyy-MM-dd"))
        .eq("status", "completed");

      setStats({
        todayAppointments: todayCount || 0,
        totalClients: clientsCount || 0,
        todayRevenue,
        monthRevenue,
        completedThisMonth: completedCount || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const date = appointment.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  const userFirstName = useMemo(() => {
    const raw = String(user?.user_metadata?.full_name || "").trim();
    return raw ? raw.split(" ")[0] : "Profissional";
  }, [user?.user_metadata?.full_name]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1">
            Olá, {userFirstName}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </motion.div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-display font-semibold text-foreground">
              Resumo financeiro do dia
            </h2>
            <Button
              type="button"
              variant="ghost"
              className="h-11 px-3 text-muted-foreground"
              onClick={() => navigate("/dashboard/reports")}
            >
              Ver detalhes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatsCard
              title="Receita Hoje"
              value={`R$ ${stats.todayRevenue.toFixed(2).replace(".", ",")}`}
              icon={DollarSign}
              index={0}
            />
            <StatsCard
              title="Agendamentos Hoje"
              value={stats.todayAppointments}
              icon={Calendar}
              index={1}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatsCard
              title="Receita do Mês"
              value={`R$ ${stats.monthRevenue.toFixed(2).replace(".", ",")}`}
              icon={TrendingUp}
              index={2}
            />
            <StatsCard
              title="Total de Clientes"
              value={stats.totalClients}
              icon={Users}
              index={3}
            />
          </div>
        </section>

        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-foreground">
                Próximos agendamentos
              </h2>
              <Button
                size="sm"
                variant="outline"
                className="hidden md:inline-flex"
                onClick={() => navigate("/dashboard/appointments?new=1")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Nenhum agendamento</h3>
                <p className="text-sm text-muted-foreground">Você não tem agendamentos futuros.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
                  <div key={date}>
                    <h3 className="text-xs font-medium text-muted-foreground mb-3 capitalize">
                      {formatDateLabel(date)}
                    </h3>
                    <div className="space-y-3">
                      {dayAppointments.map((appointment, index) => (
                        <AppointmentCard
                          key={appointment.id}
                          clientName={appointment.client_name}
                          serviceName={appointment.service_name}
                          date={appointment.date}
                          startTime={appointment.start_time.slice(0, 5)}
                          endTime={appointment.end_time.slice(0, 5)}
                          price={appointment.price}
                          status={appointment.status}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-foreground">Clientes recentes</h2>
              <Button
                type="button"
                variant="ghost"
                className="h-11 px-3 text-muted-foreground"
                onClick={() => navigate("/dashboard/clients")}
              >
                Ver todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : recentClients.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <User className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Nenhum cliente ainda</h3>
                <p className="text-sm text-muted-foreground">Cadastre seu primeiro cliente para começar.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => navigate("/dashboard/clients")}
                    className="w-full flex items-center gap-3 py-3 text-left hover:bg-muted/40 rounded-xl px-3 -mx-3 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{client.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {client.phone || "Sem telefone"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </section>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
