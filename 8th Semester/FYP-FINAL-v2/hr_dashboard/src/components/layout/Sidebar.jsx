// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  PieChart,
  Calendar,
  Layers,
  Download,
  Kanban,
  Menu,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Applicants", icon: Users, path: "/applicants" },
  { name: "Departments", icon: Layers, path: "/departments" },
  { name: "Interviews", icon: Calendar, path: "/interviews" },
  { name: "Analytics", icon: PieChart, path: "/analytics" },
  { name: "Kanban", icon: Kanban, path: "/kanban" },
  { name: "Jobs", icon: Download, path: "/jobs" },
];

export default function Sidebar({ collapsed = false, onToggle = () => {} }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 ${
        collapsed ? "w-20" : "w-64"
      } bg-white/95 backdrop-blur border-r border-gray-200 shadow-sm p-4 flex flex-col transition-all duration-200`}
    >
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} mb-6`}>
        {!collapsed && (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">HR</p>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
        )}
        <span className="h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
          HR
        </span>
      </div>

      <div className={`text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 ${collapsed ? "hidden" : ""}`}>
        Menu
      </div>
      <nav className="flex flex-col gap-1">
        {menuItems.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center ${collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2"} rounded-lg text-sm font-medium transition-all ${
                isActive ? "bg-gray-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <Icon size={18} />
            {!collapsed && name}
          </NavLink>
        ))}
      </nav>

      {/* Removed export PDF block per request */}

      <div className="mt-auto pt-4">
        <button
          onClick={onToggle}
          className={`w-full inline-flex items-center ${collapsed ? "justify-center px-0" : "justify-between px-3"} py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors`}
          aria-label="Toggle sidebar"
        >
          <span className="flex items-center gap-2">
            <Menu size={16} />
            {!collapsed && "Collapse menu"}
          </span>
        </button>
      </div>
    </aside>
  );
}
