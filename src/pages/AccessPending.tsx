import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Clock, Mail, ArrowLeft, RefreshCw } from "lucide-react";

const AccessPending = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
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
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">
          Acesso Pendente
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Sua conta está aguardando aprovação. Assim que o pagamento for confirmado, 
          seu acesso será liberado automaticamente.
        </p>

        <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Como efetuar o pagamento
          </h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                1
              </span>
              <span>
                Faça o Pix no valor de <strong className="text-foreground">R$ 49,00</strong> para a chave:
                <br />
                <code className="bg-muted px-2 py-1 rounded text-xs mt-1 inline-block">
                  pix@botnails.com.br
                </code>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                2
              </span>
              <span>
                Envie o comprovante para nosso WhatsApp
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
            onClick={() => window.open("https://wa.me/5511999999999?text=Olá! Fiz o pagamento do BotNails e gostaria de liberar meu acesso. Meu email é: " + (user?.email || ""), "_blank")}
            className="w-full"
          >
            Enviar comprovante via WhatsApp
          </Button>
        </div>

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
