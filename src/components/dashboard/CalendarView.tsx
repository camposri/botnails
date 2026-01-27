import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  client_name: string;
  service_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

interface CalendarViewProps {
  appointments: Appointment[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}

type ViewMode = "month" | "week";

const statusColors = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-400",
};

export default function CalendarView({
  appointments,
  selectedDate,
  onDateSelect,
  onAppointmentClick,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigatePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    onDateSelect(new Date());
  };

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      const dateKey = apt.date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(apt);
    });
    return map;
  }, [appointments]);

  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateKey = format(date, "yyyy-MM-dd");
    return appointmentsByDate.get(dateKey) || [];
  };

  // Generate days for month view
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  // Generate days for week view
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { locale: ptBR });
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [currentDate]);

  // Time slots for week view
  const timeSlots = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const hour = i + 7;
      return `${hour.toString().padStart(2, "0")}:00`;
    });
  }, []);

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
      {/* Header */}
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
        <div
          key={day}
          className="bg-muted/50 py-2 text-center text-sm font-medium text-muted-foreground"
        >
          {day}
        </div>
      ))}

      {/* Days */}
      {monthDays.map((day, index) => {
        const dayAppointments = getAppointmentsForDate(day);
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentDay = isToday(day);

        return (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDateSelect(day)}
            className={cn(
              "bg-card min-h-[80px] md:min-h-[100px] p-1 md:p-2 text-left transition-all relative",
              !isCurrentMonth && "opacity-40",
              isSelected && "ring-2 ring-primary ring-inset",
              isCurrentDay && "bg-primary/5"
            )}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-medium",
                isCurrentDay && "bg-primary text-primary-foreground",
                isSelected && !isCurrentDay && "bg-accent"
              )}
            >
              {format(day, "d")}
            </span>

            {/* Appointments preview */}
            <div className="mt-1 space-y-0.5 overflow-hidden">
              {dayAppointments.slice(0, 3).map((apt) => (
                <div
                  key={apt.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentClick?.(apt);
                  }}
                  className={cn(
                    "text-xs p-0.5 md:p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                    apt.status === "cancelled"
                      ? "bg-muted text-muted-foreground line-through"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  <span className="hidden md:inline">{apt.start_time.slice(0, 5)} </span>
                  <span className="font-medium">{apt.client_name.split(" ")[0]}</span>
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{dayAppointments.length - 3}
                </div>
              )}
            </div>

            {/* Status dots */}
            {dayAppointments.length > 0 && (
              <div className="absolute bottom-1 right-1 flex gap-0.5">
                {dayAppointments.slice(0, 4).map((apt) => (
                  <div
                    key={apt.id}
                    className={cn("w-1.5 h-1.5 rounded-full", statusColors[apt.status])}
                  />
                ))}
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header with days */}
        <div className="grid grid-cols-8 gap-px bg-border rounded-t-lg overflow-hidden">
          <div className="bg-muted/50 py-3 px-2 text-center text-sm font-medium text-muted-foreground">
            Hora
          </div>
          {weekDays.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={index}
                onClick={() => onDateSelect(day)}
                className={cn(
                  "bg-muted/50 py-2 text-center transition-colors hover:bg-muted",
                  isSelected && "bg-primary/10",
                  isCurrentDay && "bg-primary/5"
                )}
              >
                <div className="text-xs text-muted-foreground capitalize">
                  {format(day, "EEE", { locale: ptBR })}
                </div>
                <div
                  className={cn(
                    "text-lg font-semibold mt-1 inline-flex items-center justify-center w-8 h-8 rounded-full",
                    isCurrentDay && "bg-primary text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </div>
              </button>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-8 gap-px bg-border">
          {timeSlots.map((time) => (
            <>
              <div
                key={`time-${time}`}
                className="bg-card py-3 px-2 text-xs text-muted-foreground text-right border-r"
              >
                {time}
              </div>
              {weekDays.map((day, dayIndex) => {
                const dayAppointments = getAppointmentsForDate(day).filter((apt) => {
                  const aptHour = parseInt(apt.start_time.slice(0, 2));
                  const slotHour = parseInt(time.slice(0, 2));
                  return aptHour === slotHour;
                });

                return (
                  <div
                    key={`${time}-${dayIndex}`}
                    onClick={() => onDateSelect(day)}
                    className="bg-card min-h-[60px] p-1 border-r last:border-r-0 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    {dayAppointments.map((apt) => (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick?.(apt);
                        }}
                        className={cn(
                          "text-xs p-1.5 rounded mb-1 cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                          apt.status === "cancelled"
                            ? "bg-muted text-muted-foreground line-through"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        <div className="font-medium truncate">{apt.client_name}</div>
                        <div className="text-[10px] opacity-80">
                          {apt.start_time.slice(0, 5)} - {apt.end_time.slice(0, 5)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={navigatePrev}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[180px] text-center capitalize">
            {viewMode === "month"
              ? format(currentDate, "MMMM yyyy", { locale: ptBR })
              : `${format(weekDays[0], "d MMM", { locale: ptBR })} - ${format(
                  weekDays[6],
                  "d MMM",
                  { locale: ptBR }
                )}`}
          </h2>
          <Button variant="ghost" size="icon" onClick={navigateNext}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
              className="rounded-none"
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              Mês
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className="rounded-none"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Semana
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">Pendente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Confirmado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Concluído</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="text-muted-foreground">Cancelado</span>
        </div>
      </div>

      {/* Calendar */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === "month" ? renderMonthView() : renderWeekView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
