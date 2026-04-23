import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div className={`${collapsed ? "ml-20" : "ml-64"} transition-all duration-200 flex min-h-screen flex-col`}>
        <Topbar />
        <main className="flex-1 overflow-y-auto px-3 py-6 lg:px-6">
          <div className="w-full max-w-[1500px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
