import { motion, AnimatePresence } from "framer-motion";
import { Crown, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumModal = ({ isOpen, onClose }: PremiumModalProps) => {
  const features = [
    "Agendamentos ilimitados",
    "Clientes ilimitados",
    "Relatórios avançados",
    "Lembretes automáticos por WhatsApp",
    "Link de agendamento personalizado",
    "Suporte prioritário",
    "Backup automático dos dados",
    "Múltiplos serviços",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header com gradiente */}
            <div className="relative p-8 text-center bg-gradient-to-br from-primary to-accent">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Torne-se Premium
              </h2>
              <p className="text-white/80">
                Desbloqueie todo o potencial do BotNails
              </p>
            </div>

            {/* Conteúdo */}
            <div className="p-8">
              <div className="flex items-baseline justify-center gap-1 mb-6">
                <span className="text-4xl font-bold text-foreground">R$ 49</span>
                <span className="text-muted-foreground">/mês</span>
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <Button
                className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg font-semibold shadow-lg"
                onClick={() => {
                  // TODO: Implementar integração com gateway de pagamento
                  window.open("https://wa.me/5511999999999?text=Olá! Quero assinar o plano premium do BotNails", "_blank");
                }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Assinar agora
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Cancele quando quiser. Sem fidelidade.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PremiumModal;
