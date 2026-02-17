import { Link, useLocation } from "react-router-dom";
import { CalendarDays, Home, Settings, Users, Wallet } from "lucide-react";

type Tab = {
  label: string;
  to: string;
  icon: (props: { className?: string }) => JSX.Element;
  isActive: (pathname: string) => boolean;
};

const tabs: Tab[] = [
  {
    label: "Início",
    to: "/dashboard",
    icon: (props) => <Home {...props} />,
    isActive: (pathname) => pathname === "/dashboard",
  },
  {
    label: "Agenda",
    to: "/dashboard/appointments",
    icon: (props) => <CalendarDays {...props} />,
    isActive: (pathname) => pathname.startsWith("/dashboard/appointments"),
  },
  {
    label: "Clientes",
    to: "/dashboard/clients",
    icon: (props) => <Users {...props} />,
    isActive: (pathname) => pathname.startsWith("/dashboard/clients"),
  },
  {
    label: "Financeiro",
    to: "/dashboard/reports",
    icon: (props) => <Wallet {...props} />,
    isActive: (pathname) => pathname.startsWith("/dashboard/reports"),
  },
  {
    label: "Config",
    to: "/dashboard/settings",
    icon: (props) => <Settings {...props} />,
    isActive: (pathname) => pathname.startsWith("/dashboard/settings"),
  },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <div className="md:hidden fixed left-0 right-0 bottom-0 z-40">
      <div className="border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="grid grid-cols-5 px-1 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1">
          {tabs.map((tab) => {
            const active = tab.isActive(location.pathname);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex flex-col items-center justify-center gap-1 rounded-md px-1 py-2 min-h-12 transition-colors ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                aria-label={tab.label}
              >
                {tab.icon({ className: "w-5 h-5" })}
                <span className="text-[11px] font-medium leading-none truncate max-w-full">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

