import { createContext, useContext, useMemo, useState } from "react";
import { statsCards } from "../../data/stats";
import {
  applicationsOverTime,
  applicationsWeekly,
  departmentDistribution,
  departmentDistributionWeek,
} from "../../data/charts";
import { applicants } from "../../data/applicants";

const defaultValue = {
  timeframe: "week",
  setTimeframe: () => {},
  stats: statsCards,
  lineData: applicationsWeekly,
  barData: departmentDistributionWeek,
  downloadReport: () => {},
  exportApplicants: () => {},
  exportChartData: () => {},
  timeframeLabels: {
    week: "This week",
    month: "This month",
    quarter: "This quarter",
  },
};

const DashboardContext = createContext(defaultValue);

const multipliers = {
  week: 0.25,
  month: 1,
  quarter: 3,
};

const timeframeLabels = {
  week: "This week",
  month: "This month",
  quarter: "This quarter",
};

function toCsv(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const keys = Object.keys(rows[0]);
  const header = keys.join(",");
  const body = rows
    .map((row) => keys.map((k) => JSON.stringify(row[k] ?? "")).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

function downloadFile(content, filename, mime) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (typeof Blob === "undefined" || typeof URL === "undefined") return;

  try {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed", error);
  }
}

export function DashboardProvider({ children }) {
  const [timeframe, setTimeframe] = useState("week");

  const stats = useMemo(() => {
    const multiplier = multipliers[timeframe] ?? 1;
    return statsCards.map((card) => ({
      ...card,
      value: Math.max(1, Math.round(card.value * multiplier)),
      subtitle:
        timeframe === "week"
          ? "In the last 7 days"
          : timeframe === "quarter"
          ? "Last 90 days"
          : card.subtitle,
    }));
  }, [timeframe]);

  const lineData = useMemo(() => {
    if (timeframe === "week") return applicationsWeekly;
    if (timeframe === "quarter")
      return applicationsOverTime.map((d) => ({
        ...d,
        applications: Math.round(d.applications * 3),
      }));
    return applicationsOverTime;
  }, [timeframe]);

  const barData = useMemo(() => {
    if (timeframe === "week") return departmentDistributionWeek;
    if (timeframe === "quarter")
      return departmentDistribution.map((d) => ({
        ...d,
        applicants: Math.round(d.applicants * 3),
      }));
    return departmentDistribution;
  }, [timeframe]);

  const downloadReport = () => {
    const summary = stats.map((s) => ({
      title: s.title,
      value: s.value,
      trend: s.trend,
      timeframe: timeframeLabels[timeframe] ?? timeframe,
    }));
    const csv = toCsv(summary);
    downloadFile(csv, `hr-dashboard-${timeframe}.csv`, "text/csv");
  };

  const exportApplicants = () => {
    const csv = toCsv(applicants);
    downloadFile(csv, `applicants-${timeframe}.csv`, "text/csv");
  };

  const exportChartData = () => {
    const csv = toCsv(
      lineData.map((d) => ({ period: d.month || d.label, applications: d.applications }))
    );
    downloadFile(csv, `applications-${timeframe}.csv`, "text/csv");
  };

  return (
    <DashboardContext.Provider
      value={{
        timeframe,
        setTimeframe,
        stats,
        lineData,
        barData,
        downloadReport,
        exportApplicants,
        exportChartData,
        timeframeLabels,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext) || defaultValue;
