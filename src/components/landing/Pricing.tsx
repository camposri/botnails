import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

const features = [
  "Agenda ilimitada",
  "Cadastro de clientes ilimitado",
  "Relatórios financeiros completos",
  "Link personalizado de agendamento",
  "Confirmação automática via WhatsApp",
  "Suporte prioritário",
  "Backup automático dos dados",
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Preço Justo e Transparente
          </h2>
          <p className="text-lg text-muted-foreground">
            Sem surpresas, sem taxas ocultas, sem complicação
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg mx-auto"
        >
          <div className="relative p-1 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Mais Popular
              </span>
            </div>
            
            <div className="bg-card rounded-[1.4rem] p-8 md:p-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-display font-semibold mb-2">
                  Plano Profissional
                </h3>
                <p className="text-muted-foreground mb-6">
                  Tudo que você precisa para crescer
                </p>
                
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl md:text-6xl font-display font-bold text-gradient">
                    R$ 49,99
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                
                <p className="text-sm text-primary font-medium mt-2">
                  30 dias grátis para testar
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground py-6 text-lg shadow-xl shadow-primary/25"
              >
                Começar Teste Grátis
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                Cancele a qualquer momento, sem multa
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
