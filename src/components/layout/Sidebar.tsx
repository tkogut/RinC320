import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown, ChevronRight, Scale, List, ToggleRight, Factory, BookCopy, Package, FileText, Server, Printer, Settings, Network, Layers, Group, BarChart2, History, GitCommitHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Wskazania wag", href: "/scales-indications", icon: Scale },
  { name: "Lista ważeń", href: "/weighing-list", icon: List },
  { name: "Sterowanie I/O", href: "/pins", icon: ToggleRight },
  {
    name: "Dozowanie",
    icon: Factory,
    children: [
      { name: "Zlecenia produkcji", href: "/order" },
      {
        name: "Receptury",
        children: [
          { name: "Pojemnik - Grupa dozowanie", href: "/recipe/some-uuid" },
        ],
      },
      { name: "Surowce", href: "/raw-material" },
      { name: "Raport surowców", href: "/raw-material-report" },
    ],
  },
  { name: "Wagi", type: "category" },
  {
    name: "Konfiguracja",
    icon: Settings,
    children: [
      { name: "Hosty", href: "/hosts", icon: Server },
      { name: "Wagi", href: "/scales", icon: Scale },
      { name: "Drukarki", href: "/printers", icon: Printer },
      {
        name: "I/O",
        icon: GitCommitHorizontal,
        children: [
          { name: "Urządzenia I/O", href: "/io", icon: Network },
          { name: "Szablony grup I/O", href: "/group-templates", icon: Layers },
          { name: "Grupy I/O", href: "/groups", icon: Group },
        ],
      },
    ],
  },
];

const Sidebar = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Dozowanie: true,
    Konfiguracja: true,
  });

  const toggleSection = (name: string) => {
    setOpenSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className="fixed left-0 top-[60px] z-20 hidden h-[calc(100vh-60px)] w-[230px] flex-col bg-sidebar-dark sm:flex">
      <nav className="flex-1 space-y-1 p-2">
        <SidebarNav items={navigation} openSections={openSections} onToggle={toggleSection} level={0} />
      </nav>
    </aside>
  );
};

const SidebarNav = ({ items, openSections, onToggle, level }: any) => {
  const location = useLocation();

  return (
    <ul className={cn("space-y-1", level > 0 && "pl-4")}>
      {items.map((item: any) => {
        if (item.type === 'category') {
          return (
            <li key={item.name} className="px-3 py-2 text-xs font-semibold uppercase text-text-light/50">
              {item.name}
            </li>
          );
        }

        const isExpandable = item.children && item.children.length > 0;
        const isOpen = openSections[item.name] || false;
        const isActive = item.href && location.pathname === item.href;

        if (isExpandable) {
          return (
            <li key={item.name}>
              <button
                onClick={() => onToggle(item.name)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-light hover:bg-white/10 hover:text-white"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span className="flex-1 text-left">{item.name}</span>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {isOpen && (
                <div className="pt-1">
                  <SidebarNav items={item.children} openSections={openSections} onToggle={onToggle} level={level + 1} />
                </div>
              )}
            </li>
          );
        }

        return (
          <li key={item.name}>
            <NavLink
              to={item.href || "#"}
              className={({ isActive: navIsActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-light transition-all hover:bg-white/10 hover:text-white",
                  navIsActive && "bg-accent-cyan/20 text-white"
                )
              }
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.name}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
};

export default Sidebar;