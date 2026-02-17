import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, DollarSign, Scissors, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { TooltipProps } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import { toast } from "@/hooks/use-toast";

interface MonthlyRevenue {
  month: string;
  revenue: number;
  appointments: number;
}

interface ServiceStats {
  name: string;
  count: number;
  revenue: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(346 77% 70%)",
  "hsl(38 92% 60%)",
  "hsl(280 65% 60%)",
  "hsl(200 70% 50%)",
];

const Reports = () => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [averageTicket, setAverageTicket] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [user]);

  const fetchReportData = async () => {
    try {
      const today = new Date();
      const sixMonthsAgo = subMonths(today, 5);

      // Fetch all completed appointments from last 6 months
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("date, price, service_name, status")
        .gte("date", format(startOfMonth(sixMonthsAgo), "yyyy-MM-dd"))
        .lte("date", format(endOfMonth(today), "yyyy-MM-dd"))
        .eq("status", "completed");

      if (error) throw error;

      // Process monthly revenue data
      const monthlyMap = new Map<string, { revenue: number; appointments: number }>();
      
      // Initialize all 6 months
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const monthKey = format(monthDate, "yyyy-MM");
        monthlyMap.set(monthKey, { revenue: 0, appointments: 0 });
      }

      // Process service stats
      const serviceMap = new Map<string, { count: number; revenue: number }>();

      appointments?.forEach((apt) => {
        const monthKey = apt.date.substring(0, 7);
        const existing = monthlyMap.get(monthKey);
        if (existing) {
          existing.revenue += Number(apt.price);
          existing.appointments += 1;
        }

        // Service stats
        const serviceExisting = serviceMap.get(apt.service_name) || { count: 0, revenue: 0 };
        serviceExisting.count += 1;
        serviceExisting.revenue += Number(apt.price);
        serviceMap.set(apt.service_name, serviceExisting);
      });

      // Convert to arrays
      const monthlyArray: MonthlyRevenue[] = Array.from(monthlyMap.entries()).map(
        ([month, data]) => ({
          month: format(new Date(month + "-01"), "MMM", { locale: ptBR }),
          revenue: data.revenue,
          appointments: data.appointments,
        })
      );

      const serviceArray: ServiceStats[] = Array.from(serviceMap.entries())
        .map(([name, data]) => ({
          name: name.length > 15 ? name.substring(0, 15) + "..." : name,
          count: data.count,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      setMonthlyData(monthlyArray);
      setServiceStats(serviceArray);

      // Calculate totals
      const total = appointments?.reduce((sum, apt) => sum + Number(apt.price), 0) || 0;
      const count = appointments?.length || 0;
      setTotalRevenue(total);
      setTotalAppointments(count);
      setAverageTicket(count > 0 ? total / count : 0);
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Erro ao carregar relatórios",
        description: "Não foi possível carregar os dados dos relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toFixed(2).replace(".", ",")}`;

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground capitalize">{label}</p>
          <p className="text-primary">
            Receita: {formatCurrency(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-muted-foreground">
              Atendimentos: {payload[1].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{payload[0].name}</p>
          <p className="text-primary">{payload[0].value} atendimentos</p>
        </div>
      );
    }
    return null;
  };

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
            Relatórios Financeiros 📊
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho do seu negócio nos últimos 6 meses
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Receita Total (6 meses)"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            index={0}
          />
          <StatsCard
            title="Total de Atendimentos"
            value={totalAppointments}
            icon={Calendar}
            index={1}
          />
          <StatsCard
            title="Ticket Médio"
            value={formatCurrency(averageTicket)}
            icon={TrendingUp}
            index={2}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border/50 p-6"
          >
            <h2 className="text-xl font-display font-semibold text-foreground mb-6">
              Faturamento Mensal
            </h2>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : monthlyData.every((d) => d.revenue === 0) ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <DollarSign className="w-12 h-12 mb-4 opacity-50" />
                <p>Nenhum dado de receita encontrado</p>
                <p className="text-sm">Complete atendimentos para ver os gráficos</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Services Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border/50 p-6"
          >
            <h2 className="text-xl font-display font-semibold text-foreground mb-6">
              Serviços Mais Realizados
            </h2>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : serviceStats.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <Scissors className="w-12 h-12 mb-4 opacity-50" />
                <p>Nenhum serviço realizado</p>
                <p className="text-sm">Complete atendimentos para ver os gráficos</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="name"
                  >
                    {serviceStats.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-sm text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Top Services Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl border border-border/50 p-6 lg:col-span-2"
          >
            <h2 className="text-xl font-display font-semibold text-foreground mb-6">
              Ranking de Serviços
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : serviceStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum serviço realizado ainda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        #
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Serviço
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                        Atendimentos
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                        Receita
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceStats.map((service, index) => (
                      <motion.tr
                        key={service.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length] + "20",
                              color: COLORS[index % COLORS.length],
                            }}
                          >
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium text-foreground">
                          {service.name}
                        </td>
                        <td className="py-4 px-4 text-center text-muted-foreground">
                          {service.count}
                        </td>
                        <td className="py-4 px-4 text-right font-medium text-primary">
                          {formatCurrency(service.revenue)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
