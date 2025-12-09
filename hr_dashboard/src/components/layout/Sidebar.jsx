// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  PieChart,
  Calendar,
  Layers,
  Menu,
  Download,
  Kanban,
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

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white/95 backdrop-blur border-r border-gray-200 shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">HR</p>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <span className="h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
          AH
        </span>
      </div>

      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        Menu
      </div>
      <nav className="flex flex-col gap-1">
        {menuItems.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${isActive ? "bg-gray-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`
            }
          >
            <Icon size={18} />
            {name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-lg border border-dashed border-gray-200 p-3 mb-3">
          <p className="text-sm font-semibold text-gray-900">
            Download report
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Export the latest hiring metrics.
          </p>
          <button className="mt-3 inline-flex items-center justify-center gap-2 w-full rounded-md bg-gray-900 text-white px-3 py-2 text-sm font-semibold hover:bg-gray-800 transition-colors">
            <Download size={14} />
            Export PDF
          </button>
        </div>

        <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
          <span className="flex items-center gap-2">
            <Menu size={16} />
            Collapse menu
          </span>
        </button>
      </div>
    </aside>
  );
}
