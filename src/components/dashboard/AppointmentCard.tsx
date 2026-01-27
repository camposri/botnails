import { motion } from "framer-motion";
import { Clock, User, Scissors } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AppointmentCardProps {
  clientName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  index: number;
}

const statusConfig = {
  pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed: { label: "Confirmado", className: "bg-green-100 text-green-800 border-green-200" },
  completed: { label: "Concluído", className: "bg-blue-100 text-blue-800 border-blue-200" },
  cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800 border-red-200" },
};

const AppointmentCard = ({
  clientName,
  serviceName,
  date,
  startTime,
  endTime,
  price,
  status,
  index,
}: AppointmentCardProps) => {
  const statusInfo = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
            {clientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{clientName}</h4>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Scissors className="w-3 h-3" />
              {serviceName}
            </div>
          </div>
        </div>
        <Badge variant="outline" className={statusInfo.className}>
          {statusInfo.label}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {startTime} - {endTime}
          </span>
        </div>
        <span className="font-semibold text-foreground">
          R$ {price.toFixed(2).replace(".", ",")}
        </span>
      </div>
    </motion.div>
  );
};

export default AppointmentCard;
