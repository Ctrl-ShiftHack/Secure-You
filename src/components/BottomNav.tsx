import { Home, MapPin, Users, Settings, Image } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: MapPin, label: "Map", path: "/map" },
    { icon: Image, label: "Incidents", path: "/incidents" },
    { icon: Users, label: "Contacts", path: "/contacts" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-strong z-50">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-2 gap-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={
                `flex flex-col items-center justify-center gap-0 py-1 rounded-lg transition-all duration-200 text-[10px]`
                + (isActive ? ' text-primary bg-accent' : ' text-muted-foreground hover:text-foreground hover:bg-muted')
              }
            >
              <div className="flex items-center justify-center w-8 h-8">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium mt-1 leading-3">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
