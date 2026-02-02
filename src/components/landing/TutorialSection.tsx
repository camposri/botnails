import { motion } from "framer-motion";
import { UserPlus, Settings, Calendar, Smartphone, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Crie sua Conta",
    description: "Cadastre-se gratuitamente com seu e-mail. Leva menos de 1 minuto para começar.",
    details: ["Nome e e-mail", "Escolha uma senha segura", "Confirme pelo e-mail"],
  },
  {
    number: "02",
    icon: Settings,
    title: "Configure seus Serviços",
    description: "Adicione os serviços que você oferece, como manicure, pedicure, alongamento e mais.",
    details: ["Escolha entre sugestões populares", "Defina preços e duração", "Personalize descrições"],
  },
  {
    number: "03",
    icon: Calendar,
    title: "Gerencie seus Horários",
    description: "Defina sua disponibilidade e comece a receber agendamentos dos seus clientes.",
    details: ["Configure dias e horários", "Bloqueie folgas e feriados", "Receba notificações"],
  },
  {
    number: "04",
    icon: Smartphone,
    title: "Compartilhe seu Link",
    description: "Envie seu link personalizado para as clientes agendarem online pelo WhatsApp.",
    details: ["Link exclusivo do seu salão", "Compartilhe nas redes sociais", "QR Code para divulgação"],
  },
];

const TutorialSection = () => {
  return (
    <section id="tutorial" className="py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            Simples e Rápido
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Comece a Usar em <span className="text-gradient">4 Passos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Configure seu salão em minutos e comece a receber agendamentos hoje mesmo
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                {/* Step number badge */}
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-display font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

                {/* Details list */}
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li
                      key={detailIndex}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                      {detail}
                    </li>
                  ))}
                </ul>

                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Button
            size="lg"
            className="group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-10 py-6 text-lg shadow-xl shadow-primary/25"
            asChild
          >
            <Link to="/auth">
              Criar Minha Conta Grátis
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Sem cartão de crédito • Teste grátis por 30 dias
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TutorialSection;
