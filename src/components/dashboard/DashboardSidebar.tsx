import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Shield,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Início", path: "/dashboard" },
  { icon: Calendar, label: "Agenda", path: "/dashboard/appointments" },
  { icon: Users, label: "Clientes", path: "/dashboard/clients" },
  { icon: Scissors, label: "Serviços", path: "/dashboard/services" },
  { icon: BarChart3, label: "Relatórios", path: "/dashboard/reports" },
  { icon: Settings, label: "Configurações", path: "/dashboard/settings" },
];

type DashboardSidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

const DashboardSidebar = ({
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
}: DashboardSidebarProps) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { isAdmin } = useAdminStatus();

  const items = useMemo(() => {
    const base = [...menuItems];
    if (isAdmin) {
      base.push({ icon: Shield, label: "Admin", path: "/admin" });
    }
    return base;
  }, [isAdmin]);

  const renderNav = (options: { collapsed: boolean; onNavigate?: () => void }) => (
    <>
      <nav className="flex-1 space-y-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={options.onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!options.collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => {
          options.onNavigate?.();
          signOut();
        }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
      >
        <LogOut className="w-5 h-5 flex-shrink-0" />
        {!options.collapsed && <span className="font-medium">Sair</span>}
      </button>
    </>
  );

  return (
    <>
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`hidden md:block fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="BotNails Logo"
                className="w-10 h-10 object-contain"
              />
              {!collapsed && (
                <span className="text-xl font-display font-semibold text-foreground">
                  BotNails
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCollapsedChange(!collapsed)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </Button>
          </div>

          {renderNav({ collapsed })}
        </div>
      </motion.aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => onMobileOpenChange(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "tween", duration: 0.2 }}
            className="absolute left-0 top-0 h-full w-64 bg-card border-r border-border"
          >
            <div className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between mb-8">
                <Link
                  to="/"
                  className="flex items-center gap-3"
                  onClick={() => onMobileOpenChange(false)}
                >
                  <img
                    src="/logo.png"
                    alt="BotNails Logo"
                    className="w-10 h-10 object-contain"
                  />
                  <span className="text-xl font-display font-semibold text-foreground">
                    BotNails
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMobileOpenChange(false)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {renderNav({
                collapsed: false,
                onNavigate: () => onMobileOpenChange(false),
              })}
            </div>
          </motion.aside>
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;
