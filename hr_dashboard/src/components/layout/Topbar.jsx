// src/components/layout/Topbar.jsx
import { Bell, Moon, Search, Sun, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { fetchApplicants } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notifError, setNotifError] = useState(null);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // sync search box with current q param when on applicants page
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setSearchTerm(q);
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    navigate(q ? `/applicants?q=${encodeURIComponent(q)}` : "/applicants");
    setIsNotificationOpen(false);
    setIsProfileOpen(false);
  };

  // Fetch latest applicants and turn them into notifications
  useEffect(() => {
    let isMounted = true;
    setNotifLoading(true);
    fetchApplicants()
      .then((rows) => {
        if (!isMounted) return;
        const sorted = [...rows].sort((a, b) => {
          const da = a.appliedDate ? new Date(a.appliedDate) : new Date(0);
          const db = b.appliedDate ? new Date(b.appliedDate) : new Date(0);
          return db - da;
        });
        const top = sorted.slice(0, 5).map((row) => ({
          id: row.id || row.candidateCode || row.email || String(Math.random()),
          title: row.name ? `${row.name} applied for ${row.role || "a role"}` : "New applicant",
          time: row.appliedDate || "Recently",
          subtitle: row.status || "Applied",
          read: false,
        }));
        setNotifications(top);
        setNotifError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setNotifications([]);
        setNotifError(err.message || "Unable to load notifications");
      })
      .finally(() => {
        if (isMounted) setNotifLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-white/90 backdrop-blur border-b px-6 py-3">
      <div className="flex flex-1 items-center gap-3">
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden md:block flex-1 max-w-xl"
        >
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search applicants, roles, or IDs"
            className="w-full pl-9 pr-12 py-2.5 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-white px-2 py-1 text-[10px] font-semibold text-gray-500 hover:bg-gray-100"
          >
            Go
          </button>
        </form>
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
          ref={notificationRef}
          onClick={() => setIsNotificationOpen((v) => !v)}
          className="relative rounded-full p-2 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-semibold text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}

          {isNotificationOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-xl border bg-white shadow-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  <p className="text-xs text-gray-500">Recent applicant activity</p>
                </div>
                <button
                  onClick={markAllRead}
                  className="text-xs font-semibold text-primary hover:text-primary/80 disabled:text-gray-300"
                  disabled={!notifications.length}
                >
                  Mark all read
                </button>
              </div>
              {notifLoading && (
                <div className="py-6 text-center text-sm text-gray-500">Loading...</div>
              )}
              {!notifLoading && notifError && (
                <div className="flex items-center gap-2 text-sm text-amber-600 py-4">
                  <AlertCircle size={16} />
                  <span>{notifError}</span>
                </div>
              )}
              {!notifLoading && !notifError && (
                <>
                  <div className="divide-y divide-gray-100 max-h-64 overflow-auto">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((item) =>
                              item.id === n.id ? { ...item, read: true } : item
                            )
                          )
                        }
                        className={`w-full text-left py-2 px-2 rounded-lg hover:bg-gray-50 transition flex items-start gap-3 ${
                          n.read ? "text-gray-600" : "text-gray-900"
                        }`}
                      >
                        <div
                          className={`mt-1 h-2.5 w-2.5 rounded-full ${
                            n.read ? "bg-gray-200" : "bg-primary"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-tight">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.subtitle}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                        {n.read && <CheckCircle2 size={14} className="text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                  {!notifications.length && (
                    <div className="text-center py-6 text-sm text-gray-500">No notifications yet.</div>
                  )}
                </>
              )}
            </div>
          )}
        </button>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border px-2 py-1 hover:bg-gray-50 transition"
            aria-label="Profile menu"
          >
            <div className="h-9 w-9 rounded-full bg-indigo-900 text-white flex items-center justify-center font-semibold">
              HR
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                HR Manager
              </p>
              {/* <p className="text-xs text-gray-500">HR Manager</p> */}
            </div>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-white shadow-lg z-20">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-semibold text-gray-900">HR Manager</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => navigate("/")}>
                Overview
              </button>
              <button
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
