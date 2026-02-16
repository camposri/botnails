import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import DashboardSidebar from "./DashboardSidebar";
import TrialBanner from "./TrialBanner";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const { isLoading: trialLoading, isPremium, isExpired } = useTrialStatus();
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const navigate = useNavigate();

  const isLoading = loading || trialLoading || adminLoading;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
    
    // Verifica se o email foi confirmado
    if (!loading && user && !user.email_confirmed_at) {
      navigate("/email-pending", { state: { email: user.email } });
    }
  }, [user, loading, navigate]);

  // Redireciona para acesso pendente se não estiver ativo (exceto admins)
  useEffect(() => {
    if (!isLoading && user && user.email_confirmed_at && isExpired && !isPremium && !isAdmin) {
      navigate("/access-pending");
    }
  }, [isLoading, user, isExpired, isPremium, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/logo.png" 
            alt="BotNails Logo" 
            className="w-16 h-16 object-contain animate-pulse"
          />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.email_confirmed_at) {
    return null;
  }

  if (isExpired && !isPremium && !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="ml-20 md:ml-64 p-6 md:p-8 transition-all duration-300">
        <TrialBanner />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
