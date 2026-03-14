import { Link, useLocation } from "@tanstack/react-router";
import { Home, MapIcon, MapPin, User, Users } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Início", ocid: "nav.dashboard.link" },
  { to: "/map", icon: MapIcon, label: "Mapa", ocid: "nav.map.link" },
  {
    to: "/community",
    icon: Users,
    label: "Comunidade",
    ocid: "nav.community.link",
  },
  {
    to: "/location",
    icon: MapPin,
    label: "Localização",
    ocid: "nav.location.link",
  },
  { to: "/profile", icon: User, label: "Perfil", ocid: "nav.profile.link" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card/95 backdrop-blur-sm">
      {navItems.map(({ to, icon: Icon, label, ocid }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            data-ocid={ocid}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition-colors ${
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && (
              <span className="absolute top-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-primary" />
            )}
            <Icon className={`h-5 w-5 ${active ? "stroke-[2.5px]" : ""}`} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
