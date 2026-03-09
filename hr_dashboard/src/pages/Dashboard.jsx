import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, Download, MoreHorizontal, X } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import { ChartsRow } from "../components/dashboard/Charts";
import ApplicantsTable from "../components/dashboard/ApplicantsTable";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { fetchApplicants, checkApiConnection, fetchJobs } from "../lib/apiClient";

export default function Dashboard() {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const dateRef = useRef(null);
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [dataStatus, setDataStatus] = useState({
    state: "loading",
    message: "Fetching applicants...",
  });
  const hasError = dataStatus.state === "error";
  useEffect(() => {
    checkApiConnection().catch((err) => {
      setDataStatus({ state: "error", message: err.message || "API unavailable" });
    });
  }, []);

  useEffect(() => {
    fetchJobs()
      .then(setJobs)
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  useEffect(() => {
    setDataStatus({
      state: "loading",
      message: "Fetching applicants...",
    });

    fetchApplicants({ startDate, endDate })
      .then((rows) => {
        setApplicants(rows);
        setDataStatus({
          state: "ok",
          message: rows.length ? `Loaded ${rows.length} applicants` : "No applicants found",
        });
      })
      .catch((err) => {
        setApplicants([]);
        setDataStatus({
          state: "error",
          message: err.message || "Unable to fetch applicants",
        });
      });
  }, [startDate, endDate]);

  const label = useMemo(() => {
    if (startDate && endDate) {
      return `${startDate} – ${endDate}`;
    }
    return "This week";
  }, [startDate, endDate]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setIsDateOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsDateOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isInRange = (dateStr) => {
    if (!dateStr) return false;
    if (!startDate || !endDate) return true;
    const d = new Date(dateStr);
    return d >= new Date(startDate) && d <= new Date(endDate);
  };

  const filteredApplicants = useMemo(() => {
    if (!startDate || !endDate) return applicants;
    return applicants.filter((app) => isInRange(app.appliedDate));
  }, [startDate, endDate, applicants]);

  const computedStats = useMemo(() => {
    const total = filteredApplicants.length;
    const shortlisted = filteredApplicants.filter((a) => a.status === "Shortlisted").length;
    const interviews = filteredApplicants.filter((a) => a.status === "Interview Scheduled").length;
    const openPositions = jobs.length;
    const departmentsCount = new Set(jobs.map((j) => j.department)).size;

    return [
      {
        id: 1,
        title: "Total Applicants",
        value: total,
        subtitle: startDate && endDate ? "Within selected dates" : "Across all departments",
        trend: null,
        trendType: "up",
      },
      {
        id: 2,
        title: "Shortlisted",
        value: shortlisted,
        subtitle: "Ready for interviews",
        trend: null,
        trendType: "up",
      },
      {
        id: 3,
        title: "Interviews Scheduled",
        value: interviews,
        subtitle: "This range",
        trend: null,
        trendType: "down",
      },
      {
        id: 4,
        title: "Positions Open",
        value: openPositions,
        subtitle: `${departmentsCount || 0} departments`,
        trend: null,
        trendType: "up",
      },
    ];
  }, [filteredApplicants, startDate, endDate]);

  const filteredLineData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // If no range, group all applicants by month
    if (!startDate || !endDate) {
      const monthMap = new Map();
      filteredApplicants.forEach((a) => {
        const d = new Date(a.appliedDate);
        if (Number.isNaN(d)) return;
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        const prev = monthMap.get(key) || { month: label, date: `${d.getFullYear()}-${d.getMonth() + 1}-01`, applications: 0 };
        monthMap.set(key, { ...prev, applications: prev.applications + 1 });
      });
      return Array.from(monthMap.values()).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayMs = 24 * 60 * 60 * 1000;
    const spanDays = Math.max(1, Math.round((end - start) / dayMs) + 1);

    // Group applicants by date
    const entries = filteredApplicants.map((a) => ({
      date: a.appliedDate,
      applications: 1,
    }));

    if (entries.length === 0) {
      return [];
    }

    // Decide granularity based on span
    if (spanDays <= 45) {
      // Daily
      const dayMap = new Map();
      entries.forEach(({ date }) => {
        dayMap.set(date, (dayMap.get(date) || 0) + 1);
      });
      return Array.from(dayMap.entries())
        .map(([date, applications]) => ({
          label: date,
          date,
          applications,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (spanDays <= 370) {
      // Monthly
      const monthMap = new Map();
      entries.forEach(({ date }) => {
        const d = new Date(date);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        const prev = monthMap.get(key) || { month: label, date: `${d.getFullYear()}-${d.getMonth() + 1}-01`, applications: 0 };
        monthMap.set(key, { ...prev, applications: prev.applications + 1 });
      });
      return Array.from(monthMap.values()).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    }

    // Yearly for long spans
    const yearMap = new Map();
    entries.forEach(({ date }) => {
      const d = new Date(date);
      const key = `${d.getFullYear()}`;
      const prev = yearMap.get(key) || { label: key, date: `${key}-01-01`, applications: 0 };
      yearMap.set(key, { ...prev, applications: prev.applications + 1 });
    });

    return Array.from(yearMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [startDate, endDate, filteredApplicants]);

  const barData = useMemo(() => {
    const counts = {};
    filteredApplicants.forEach((a) => {
      counts[a.department] = (counts[a.department] || 0) + 1;
    });
    return Object.entries(counts).map(([department, applicants]) => ({
      department,
      applicants,
    }));
  }, [filteredApplicants]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500">
            Monitor hiring performance and applicant flow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-white text-gray-700">
            <span
              className={`h-2 w-2 rounded-full ${dataStatus.state === "ok"
                ? "bg-emerald-500"
                : dataStatus.state === "error"
                  ? "bg-red-500"
                  : "bg-amber-400 animate-pulse"
                }`}
            />
            <span className="font-medium">
              API
            </span>
            <span className="text-gray-500">
              {dataStatus.message}
            </span>
          </div>
          <div className="relative" ref={dateRef}>
            <button
              onClick={() => setIsDateOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <CalendarRange size={16} />
              {label}
            </button>
            {isDateOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg border bg-white shadow-lg p-4 z-20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Select range</p>
                    <p className="text-xs text-gray-500">Pick start and end dates</p>
                  </div>
                  <button
                    onClick={() => setIsDateOpen(false)}
                    className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
                    aria-label="Close date picker"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      const end = new Date().toISOString().slice(0, 10);
                      const start = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .slice(0, 10);
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Last 7 days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const end = new Date().toISOString().slice(0, 10);
                      const start = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .slice(0, 10);
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Last 30 days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(now.getFullYear(), now.getMonth(), 1)
                        .toISOString()
                        .slice(0, 10);
                      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                        .toISOString()
                        .slice(0, 10);
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    This month
                  </button>
                </div>
                <div className="space-y-3">
                  <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                    Start date
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                    End date
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                  </label>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDateOpen(false)}
                      className="px-3 py-2 text-sm rounded-md border text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDateOpen(false)}
                      className="px-3 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-gray-900 text-white px-3 py-2 text-sm font-semibold hover:bg-gray-800">
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {computedStats.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="space-y-3">
        {hasError && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {dataStatus.message}
          </div>
        )}
        {!hasError && !filteredApplicants.length && (
          <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-700 px-3 py-2 text-sm">
            No applicants yet. Add records via the HR dashboard or API.
          </div>
        )}
        <ChartsRow
          lineData={filteredLineData}
          barData={barData}
          onExport={() => { }}
        />
      </div>

      {/* Applicants table */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">
              Recent Applicants
            </CardTitle>
            <p className="text-sm text-gray-500">
              Latest profiles across departments.
            </p>
          </div>
          <button className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
            <MoreHorizontal size={16} />
            Actions
          </button>
        </CardHeader>
        <CardContent>
          <ApplicantsTable items={filteredApplicants} />
          {!filteredApplicants.length && (
            <p className="text-sm text-gray-500 mt-3">
              No applicants to display. Add data via the HR dashboard to populate this table.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
