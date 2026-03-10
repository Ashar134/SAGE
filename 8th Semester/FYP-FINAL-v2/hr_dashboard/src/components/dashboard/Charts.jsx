import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowUpRight } from "lucide-react";

export function ChartsRow({ lineData = [], barData = [], onExport }) {
  const lineKey =
    lineData?.[0]?.month || lineData?.[0]?.label
      ? lineData?.[0]?.month
        ? "month"
        : "label"
      : "label";
  const safeBarData = barData || [];
  const maxBar = safeBarData.reduce((m, d) => Math.max(m, d.applicants || 0), 0);

  const formatDateLabel = (value = "") => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d)) return value;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDept = (name = "") => {
    if (!name) return "";
    if (name.length <= 10) return name;
    const words = name.split(" ");
    if (words.length > 1) return words.map((w) => w[0].toUpperCase()).join("");
    return `${name.slice(0, 8)}…`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Line chart */}
      <Card className="shadow-sm border-gray-200 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">
              Applications Over Time
            </CardTitle>
            <p className="text-sm text-gray-500">
              Weekly trend vs previous period.
            </p>
          </div>
          {/* Export button removed per request */}
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" />
              <XAxis
                dataKey={lineKey}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDateLabel}
              />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip labelFormatter={formatDateLabel} />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#2563eb"
                strokeWidth={2.6}
                dot={{ r: 4, fill: "#2563eb" }}
                activeDot={{ r: 7, fill: "#1d4ed8" }}
                fill="url(#lineGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar chart */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">
            Applicants by Department
          </CardTitle>
            <p className="text-sm text-gray-500">
              Distribution across active openings.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-900"
            aria-label="View details"
          >
            <ArrowUpRight size={16} />
          </Button>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={safeBarData}
              barCategoryGap="28%"
              barGap={4}
              barSize={46}
              margin={{ top: 12, right: 16, left: 16, bottom: 32 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="department"
                tickFormatter={formatDept}
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{ fontSize: 12, fill: "#4B5563" }}
                tickMargin={14}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, Math.max(10, Math.ceil(maxBar * 1.25))]}
              />
              <Tooltip />
              <Bar
                dataKey="applicants"
                fill="url(#barGradient)"
                radius={[10, 6, 4, 4]}
                maxBarSize={56}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.95} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
