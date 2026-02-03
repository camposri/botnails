import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PaymentReceiptUpload } from "@/components/PaymentReceiptUpload";
import { Clock, Mail, ArrowLeft, RefreshCw, Copy, Check, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Configurações de contato - atualize com seus dados reais
const CONTACT_CONFIG = {
  pixKey: "contato@botnails.com.br", // Chave Pix real
  pixValue: "49,00", // Valor do pagamento
  whatsappNumber: "5511999999999", // Número do WhatsApp (formato: código país + DDD + número)
  whatsappDisplayNumber: "(11) 99999-9999", // Número formatado para exibição
};

const AccessPending = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [copied, setCopied] = useState(false);
  const [currentReceiptUrl, setCurrentReceiptUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("payment_receipt_url, is_active")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        // Se o usuário foi ativado, redireciona para o dashboard
        if (data?.is_active) {
          navigate("/dashboard");
          return;
        }

        setCurrentReceiptUrl(data?.payment_receipt_url || null);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_CONFIG.pixKey);
      setCopied(true);
      toast({
        title: "Chave Pix copiada!",
        description: "Cole no seu aplicativo de banco",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Copie manualmente a chave Pix",
        variant: "destructive",
      });
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Fiz o pagamento do BotNails e gostaria de liberar meu acesso.\n\nMeu email: ${user?.email || ""}`
    );
    window.open(
      `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${message}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        {/* Ícone */}
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/30"
          />
        </div>

        {/* Conteúdo */}
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">
          Acesso Pendente
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Sua conta está aguardando aprovação. Assim que o pagamento for confirmado, 
          seu acesso será liberado automaticamente.
        </p>

        {/* Instruções de pagamento */}
        <div className="bg-muted/50 rounded-lg p-6 mb-6 text-left">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Como efetuar o pagamento
          </h3>
          <ol className="space-y-4 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                1
              </span>
              <div className="flex-1">
                <span>
                  Faça o Pix no valor de <strong className="text-foreground">R$ {CONTACT_CONFIG.pixValue}</strong> para a chave:
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <code className="bg-muted px-3 py-2 rounded text-xs flex-1 break-all">
                    {CONTACT_CONFIG.pixKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPix}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                2
              </span>
              <span>
                Envie o comprovante abaixo ou via WhatsApp
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                3
              </span>
              <span>
                Aguarde a confirmação e seu acesso será liberado em até 24h
              </span>
            </li>
          </ol>
        </div>

        {/* Upload de comprovante */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3 text-left">
            Enviar comprovante de pagamento
          </h3>
          {user && (
            <PaymentReceiptUpload
              userId={user.id}
              currentReceiptUrl={currentReceiptUrl}
              onUploadSuccess={(url) => setCurrentReceiptUrl(url)}
            />
          )}
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <Button
            onClick={handleRefresh}
            className="w-full bg-gradient-to-r from-primary to-primary/90"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Verificar se foi aprovado
          </Button>

          <Button
            variant="outline"
            onClick={handleWhatsApp}
            className="w-full"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Enviar comprovante via WhatsApp
          </Button>
        </div>

        {/* Contato WhatsApp */}
        <p className="text-sm text-muted-foreground mt-4">
          Dúvidas? Entre em contato: {CONTACT_CONFIG.whatsappDisplayNumber}
        </p>

        {/* Navegação */}
        <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </button>
          
          <button
            onClick={signOut}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            Sair da conta
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessPending;
