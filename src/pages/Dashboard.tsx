import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Users, DollarSign, TrendingUp, Plus } from "lucide-react";
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
  monthRevenue: number;
  completedThisMonth: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    totalClients: 0,
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Olá, {user?.user_metadata?.full_name?.split(" ")[0] || "Profissional"}! 👋
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Agendamentos Hoje"
            value={stats.todayAppointments}
            icon={Calendar}
            index={0}
          />
          <StatsCard
            title="Total de Clientes"
            value={stats.totalClients}
            icon={Users}
            index={1}
          />
          <StatsCard
            title="Receita do Mês"
            value={`R$ ${stats.monthRevenue.toFixed(2).replace(".", ",")}`}
            icon={DollarSign}
            index={2}
          />
          <StatsCard
            title="Atendimentos no Mês"
            value={stats.completedThisMonth}
            icon={TrendingUp}
            index={3}
          />
        </div>

        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Próximos Agendamentos
            </h2>
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum agendamento
              </h3>
              <p className="text-muted-foreground mb-4">
                Você não tem agendamentos futuros. Que tal criar um novo?
              </p>
              <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Criar Agendamento
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
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
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
