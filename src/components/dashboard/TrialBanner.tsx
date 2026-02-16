import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { Clock, Crown, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import PremiumModal from "./PremiumModal";

const TrialBanner = () => {
  const { isLoading, isPremium, daysRemaining, isExpired } = useTrialStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Não exibe nada se ainda está carregando, é premium ou foi fechado
  if (isLoading || isPremium || (isDismissed && !isExpired)) {
    return null;
  }

  // Se expirou, mostra o modal automaticamente
  if (isExpired && !showPremiumModal) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-destructive">
                  Seu período de teste expirou
                </p>
                <p className="text-sm text-muted-foreground">
                  Assine o plano premium para continuar usando todas as funcionalidades
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowPremiumModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              <Crown className="w-4 h-4 mr-2" />
              Assinar Premium
            </Button>
          </div>
        </motion.div>
        <PremiumModal 
          isOpen={showPremiumModal} 
          onClose={() => setShowPremiumModal(false)} 
        />
      </>
    );
  }

  // Determina o estilo baseado nos dias restantes
  const getBannerStyle = () => {
    if (daysRemaining <= 1) {
      return {
        bg: "bg-destructive/10 border-destructive/20",
        icon: "bg-destructive/20 text-destructive",
        text: "text-destructive",
      };
    }
    if (daysRemaining <= 7) {
      return {
        bg: "bg-amber-500/10 border-amber-500/20",
        icon: "bg-amber-500/20 text-amber-600",
        text: "text-amber-600",
      };
    }
    return {
      bg: "bg-emerald-500/10 border-emerald-500/20",
      icon: "bg-emerald-500/20 text-emerald-600",
      text: "text-emerald-600",
    };
  };

  const style = getBannerStyle();

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`${style.bg} border rounded-lg p-4 mb-6`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${style.icon} flex items-center justify-center`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className={`font-semibold ${style.text}`}>
                  {daysRemaining <= 1
                    ? `Último dia do seu período de teste!`
                    : daysRemaining <= 7
                    ? `Seu trial expira em ${daysRemaining} dias`
                    : `Você tem ${daysRemaining} dias restantes no período gratuito`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {daysRemaining <= 7
                    ? "Assine agora e não perca acesso às funcionalidades"
                    : "Aproveite todas as funcionalidades premium"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPremiumModal(true)}
                className="w-full sm:w-auto border-primary/20 hover:bg-primary/10"
              >
                <Crown className="w-4 h-4 mr-2 text-primary" />
                Ver planos
              </Button>
              {daysRemaining > 7 && (
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </>
  );
};

export default TrialBanner;
