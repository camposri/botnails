import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";

const EmailPending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");

  // Pega o email do state passado na navegação
  useEffect(() => {
    const stateEmail = (location.state as { email?: string })?.email;
    if (stateEmail) {
      setEmail(stateEmail);
    }
  }, [location.state]);

  // Verifica se o usuário já confirmou o email
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user?.email_confirmed_at) {
          toast({
            title: "Email confirmado! 🎉",
            description: "Sua conta foi ativada com sucesso",
          });
          navigate("/dashboard");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleCheckConfirmation = async () => {
    const { data: { session } } = await supabase.auth.refreshSession();
    if (session?.user?.email_confirmed_at) {
      toast({
        title: "Email confirmado! 🎉",
        description: "Sua conta foi ativada com sucesso",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Ainda pendente",
        description: "Seu email ainda não foi confirmado. Tente recarregar a página.",
      });
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Erro",
        description: "Email não encontrado. Tente fazer o cadastro novamente.",
        variant: "destructive",
      });
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Erro ao reenviar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email reenviado! 📧",
          description: "Verifique sua caixa de entrada",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao reenviar o email",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {/* Ícone de email */}
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
            <Mail className="w-12 h-12 text-primary" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
          >
            <CheckCircle className="w-5 h-5 text-primary-foreground" />
          </motion.div>
        </div>

        {/* Conteúdo */}
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">
          Verifique seu email
        </h1>
        
        <p className="text-muted-foreground mb-2">
          Enviamos um link de confirmação para:
        </p>
        
        {email && (
          <p className="text-lg font-semibold text-foreground mb-6">
            {email}
          </p>
        )}

        <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-foreground mb-3">
            Próximos passos:
          </h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              Abra sua caixa de entrada
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              Procure pelo email do BotNails
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </span>
              Clique no link de confirmação
            </li>
          </ol>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Não recebeu o email? Verifique a pasta de spam ou
        </p>

        <Button
          variant="outline"
          onClick={handleResendEmail}
          disabled={resending}
          className="mb-6"
        >
          {resending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Reenviando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reenviar email
            </>
          )}
        </Button>

        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleCheckConfirmation}
            className="text-primary hover:text-primary/80 hover:bg-primary/5"
          >
            Já confirmei meu email
          </Button>
        </div>

        <div className="pt-6 border-t border-border">
          <a
            href="/auth"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailPending;
