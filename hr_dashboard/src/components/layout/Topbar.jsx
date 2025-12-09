// src/components/layout/Topbar.jsx
import {
  Bell,
  CalendarRange,
  Download,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-white/90 backdrop-blur border-b px-6 py-3">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative hidden md:block flex-1 max-w-xl">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search applicants, roles, or IDs"
            className="w-full pl-9 pr-12 py-2.5 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-white px-2 py-1 text-[10px] font-semibold text-gray-500">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        
        <button
          type="button"
          onClick={toggleTheme}
          className="relative rounded-full p-2 hover:bg-gray-100 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun size={18} className="text-gray-600" />
          ) : (
            <Moon size={18} className="text-gray-600" />
          )}
        </button>

        <button
          type="button"
          className="relative rounded-full p-2 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-gray-600" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
        </button>

        <div className="flex items-center gap-2 rounded-full border px-2 py-1">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            AH
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900 leading-tight">
              Abdullah
            </p>
            <p className="text-xs text-gray-500">HR Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
