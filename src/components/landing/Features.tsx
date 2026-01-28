import { motion } from "framer-motion";
import { Calendar, Users, BarChart3, Smartphone, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Agendamento Inteligente",
    description: "Confirmações automáticas via WhatsApp que reduzem faltas",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "CRM simples para histórico e relacionamento com clientes",
  },
  {
    icon: BarChart3,
    title: "Relatórios Financeiros",
    description: "Relatórios claros em tempo real para decisões rápidas",
  },
  {
    icon: Smartphone,
    title: "100% Responsivo",
    description: "Experiência fluida em qualquer dispositivo",
  },
  {
    icon: Clock,
    title: "Economia de Tempo",
    description: "Automatize tarefas e foque no atendimento",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    description: "Segurança e criptografia de nível empresarial",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Recursos que geram resultado
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas profissionais para reduzir faltas, ganhar tempo e escalar seu atendimento
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative p-8 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                style={{
                  background: "linear-gradient(135deg, hsl(350 65% 55% / 0.05) 0%, hsl(35 70% 55% / 0.05) 100%)"
                }}
              />
              
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              
              <h3 className="text-xl font-display font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
