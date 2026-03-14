import { Link, useLocation } from "@tanstack/react-router";
import { AlertTriangle, Home, MapPin, User, Users } from "lucide-react";

const navItems = [
  {
    to: "/dashboard",
    icon: Home,
    label: "Home",
    ocid: "nav.dashboard.link",
    isSOS: false,
  },
  {
    to: "/contacts",
    icon: Users,
    label: "Contactos",
    ocid: "nav.contacts.link",
    isSOS: false,
  },
  {
    to: "/sos",
    icon: AlertTriangle,
    label: "SOS",
    ocid: "nav.sos.link",
    isSOS: true,
  },
  {
    to: "/location",
    icon: MapPin,
    label: "Localização",
    ocid: "nav.location.link",
    isSOS: false,
  },
  {
    to: "/profile",
    icon: User,
    label: "Conta",
    ocid: "nav.profile.link",
    isSOS: false,
  },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-black/60 backdrop-blur-md">
      {navItems.map(({ to, icon: Icon, label, ocid, isSOS }) => {
        const active = location.pathname === to;
        if (isSOS) {
          return (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              className="relative flex flex-1 flex-col items-center justify-center py-2"
            >
              <span
                className={`flex h-12 w-12 -translate-y-2 items-center justify-center rounded-full shadow-lg transition-all active:scale-90 ${
                  active
                    ? "bg-red-600 shadow-red-500/60"
                    : "bg-red-700 shadow-red-700/40"
                }`}
              >
                <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
              </span>
              <span className="-mt-1 text-[10px] font-bold text-red-400">
                {label}
              </span>
            </Link>
          );
        }
        return (
          <Link
            key={to}
            to={to}
            data-ocid={ocid}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition-colors ${
              active ? "text-orange-400" : "text-white/50 hover:text-white/80"
            }`}
          >
            {active && (
              <span className="absolute top-0 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-orange-400" />
            )}
            <Icon className={`h-5 w-5 ${active ? "stroke-[2.5px]" : ""}`} />
            <span className="font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
