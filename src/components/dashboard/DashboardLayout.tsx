import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfileStatus } from "@/hooks/useProfileStatus";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import DashboardSidebar from "./DashboardSidebar";
import TrialBanner from "./TrialBanner";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const { isActive, isLoading: profileLoading } = useProfileStatus();
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const navigate = useNavigate();

  const isLoading = loading || profileLoading || adminLoading;

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
    if (!isLoading && user && user.email_confirmed_at && !isActive && !isAdmin) {
      navigate("/access-pending");
    }
  }, [isLoading, user, isActive, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
            <span className="text-primary-foreground text-xl">💅</span>
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.email_confirmed_at) {
    return null;
  }

  // Bloqueia acesso para inativos (exceto admins)
  if (!isActive && !isAdmin) {
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
