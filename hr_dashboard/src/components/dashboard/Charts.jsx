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
import { Download, ArrowUpRight } from "lucide-react";

export function ChartsRow({ lineData = [], barData = [], onExport }) {
  const lineKey =
    lineData?.[0]?.month || lineData?.[0]?.label
      ? lineData?.[0]?.month
        ? "month"
        : "label"
      : "label";
  const safeBarData = barData || [];
  const maxBar = safeBarData.reduce((m, d) => Math.max(m, d.applicants || 0), 0);

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
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={onExport}
          >
            <Download size={14} className="mr-2" />
            Export
          </Button>
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
              <XAxis dataKey={lineKey} tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
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
              <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" />
              <XAxis
                dataKey="department"
                tickFormatter={formatDept}
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{ fontSize: 12 }}
                tickMargin={10}
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
                maxBarSize={64}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0.9} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
