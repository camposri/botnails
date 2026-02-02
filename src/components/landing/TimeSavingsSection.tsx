import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Clock, Calendar, MessageSquare, TrendingUp, Zap } from "lucide-react";

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

const AnimatedCounter = ({ end, duration = 2, suffix = "", prefix = "" }: CounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
};

const savings = [
  {
    icon: Clock,
    value: 8,
    suffix: "h",
    label: "economizadas por semana",
    description: "em agendamentos manuais",
    color: "from-primary to-primary/70",
  },
  {
    icon: MessageSquare,
    value: 95,
    suffix: "%",
    label: "menos faltas",
    description: "com lembretes automáticos",
    color: "from-accent to-accent/70",
  },
  {
    icon: Calendar,
    value: 50,
    suffix: "+",
    label: "agendamentos/mês",
    description: "via link compartilhável",
    color: "from-primary to-accent",
  },
  {
    icon: TrendingUp,
    value: 30,
    suffix: "%",
    label: "mais receita",
    description: "com gestão otimizada",
    color: "from-accent to-primary",
  },
];

const comparisonItems = [
  { manual: "Anotar em caderno", automated: "Agenda digital automática", time: "15 min → 0" },
  { manual: "Ligar para confirmar", automated: "Lembrete automático", time: "30 min → 0" },
  { manual: "Calcular receita", automated: "Relatórios em tempo real", time: "1h → 5 seg" },
  { manual: "Responder WhatsApp", automated: "Link de agendamento", time: "20 min → 0" },
];

const TimeSavingsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl -translate-y-1/2" />

      <div className="container mx-auto px-6 relative z-10" ref={containerRef}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Economia de Tempo Real
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Quanto tempo você <span className="text-gradient">economiza?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja como a automação transforma seu dia a dia e libera tempo para o que realmente importa
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
          {savings.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 h-full text-center hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                {/* Icon */}
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>

                {/* Animated Counter */}
                <div className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">
                  {isInView && (
                    <AnimatedCounter end={item.value} suffix={item.suffix} duration={2.5} />
                  )}
                </div>

                {/* Labels */}
                <p className="text-sm font-medium text-foreground mb-1">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Before/After Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-display font-semibold text-center mb-6">
              Antes vs Depois do <span className="text-gradient">BotNails</span>
            </h3>

            <div className="space-y-4">
              {comparisonItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  {/* Manual task */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-muted-foreground line-through text-sm">
                      <div className="w-2 h-2 rounded-full bg-destructive/50" />
                      {item.manual}
                    </div>
                  </div>

                  {/* Arrow animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    className="flex-shrink-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>

                  {/* Automated task */}
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2 text-foreground font-medium text-sm">
                      {item.automated}
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  </div>

                  {/* Time saved badge */}
                  <div className="hidden sm:block">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Total savings */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center"
            >
              <p className="text-sm text-muted-foreground mb-1">Economia total por semana</p>
              <p className="text-2xl font-display font-bold text-gradient">
                {isInView && <AnimatedCounter end={8} duration={2} />} horas
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                = mais tempo para você e seus clientes
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TimeSavingsSection;
