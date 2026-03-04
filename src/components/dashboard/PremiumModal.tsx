import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";
import { toast } from "@/hooks/use-toast";
import { buildPixCopyPastePayload } from "@/lib/pix";

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

  const [showPix, setShowPix] = useState(false);
  const [pixQrDataUrl, setPixQrDataUrl] = useState<string | null>(null);
  const [pixPayload, setPixPayload] = useState<string | null>(null);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);

  const pixConfig = useMemo(
    () => ({
      pixKey: "27178920874",
      amount: 49,
      merchantName: "BOTNAILS",
      merchantCity: "BRASILIA",
      txid: "BOTNAILS",
      description: "Assinatura BotNails Premium",
    }),
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      setShowPix(false);
      setPixQrDataUrl(null);
      setPixPayload(null);
      setIsGeneratingPix(false);
    }
  }, [isOpen]);

  const handleGeneratePix = async () => {
    setShowPix(true);
    if (pixQrDataUrl && pixPayload) return;

    setIsGeneratingPix(true);
    try {
      const payload = buildPixCopyPastePayload(pixConfig);
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 1,
        errorCorrectionLevel: "M",
      });
      setPixPayload(payload);
      setPixQrDataUrl(dataUrl);
    } catch {
      toast({
        title: "Erro ao gerar QR Code",
        description: "Não foi possível gerar o Pix agora. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleCopyPix = async () => {
    if (!pixPayload) return;
    try {
      await navigator.clipboard.writeText(pixPayload);
      toast({
        title: "Pix copiado!",
        description: "Cole no app do seu banco para pagar.",
      });
    } catch {
      toast({
        title: "Não foi possível copiar",
        description: "Copie manualmente o código Pix (copia e cola).",
        variant: "destructive",
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header com gradiente */}
            <div className="relative p-6 sm:p-8 text-center bg-gradient-to-br from-primary to-accent">
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
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
                onClick={handleGeneratePix}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar QR Code Pix
              </Button>

              <AnimatePresence>
                {showPix && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="mt-6"
                  >
                    <div className="rounded-xl border bg-card p-5">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="font-semibold text-foreground">Pagamento via Pix</p>
                          <p className="text-sm text-muted-foreground">R$ {pixConfig.amount.toFixed(2)} / mês</p>
                        </div>
                        <Button variant="outline" onClick={() => setShowPix(false)}>
                          Fechar
                        </Button>
                      </div>

                      {isGeneratingPix && (
                        <div className="py-10 text-center text-sm text-muted-foreground">Gerando QR Code…</div>
                      )}

                      {!isGeneratingPix && pixQrDataUrl && (
                        <div className="flex flex-col items-center">
                          <img
                            src={pixQrDataUrl}
                            alt="QR Code Pix"
                            className="w-full max-w-64 aspect-square h-auto rounded-lg border bg-white"
                          />

                          {pixPayload && (
                            <div className="w-full mt-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <p className="text-sm font-medium text-foreground">Pix (copia e cola)</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCopyPix}
                                  className="w-full sm:w-auto"
                                >
                                  Copiar
                                </Button>
                              </div>
                              <code className="block w-full bg-muted px-3 py-2 rounded text-xs break-all select-text">
                                {pixPayload}
                              </code>
                              <p className="text-xs text-muted-foreground mt-2">
                                Após pagar, envie o comprovante para liberar o acesso premium.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
