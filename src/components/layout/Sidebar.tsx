import { NavLink } from "react-router-dom";
import { Home, Settings, Weight, Server, Network, Layers, Group } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Konfiguracje Wag", href: "/configurations", icon: Weight },
  { name: "Urządzenia I/O", href: "/devices", icon: Network },
  { name: "Hosty", href: "/hosts", icon: Server },
  { name: "Grupy I/O", href: "/groups", icon: Group },
  { name: "Szablony Grup", href: "/templates", icon: Layers },
];

const Sidebar = () => {
  return (
    <aside className="hidden w-64 flex-col border-r bg-white dark:bg-neutral-950 sm:flex">
      <div className="flex h-16 items-center border-b px-6">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <Settings className="h-6 w-6" />
          <span>ScaleIT</span>
        </NavLink>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-gray-50",
                isActive && "bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-gray-50"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;