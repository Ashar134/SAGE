import { useEffect, useState, useMemo } from "react";
import { fetchApplicants, fetchJobs } from "../lib/apiClient";
import StatCard from "../components/dashboard/StatCard";
import { ChartsRow } from "../components/dashboard/Charts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function Analytics() {
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchApplicants(), fetchJobs()])
      .then(([appRows, jobRows]) => {
        setApplicants(appRows);
        setJobs(jobRows);
      })
      .catch((err) => console.error("Error fetching analytics data", err))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = applicants.length;
    const avgTest = total
      ? Math.round(applicants.reduce((s, a) => s + (a.testScore || 0), 0) / total)
      : 0;
    const avgInterview = total
      ? Math.round(applicants.reduce((s, a) => s + (a.interviewScore || 0), 0) / total)
      : 0;
    const highestMatch = total
      ? Math.max(...applicants.map((a) => a.matchScore || 0))
      : 0;

    return [
      { id: 1, title: "Total Funnel", value: total, subtitle: "Across all pipelines", trend: "+8% vs last week" },
      { id: 2, title: "Avg Assessment", value: `${avgTest}%`, subtitle: "Qualified pool score", trend: "+2%" },
      { id: 3, title: "Avg Interview", value: `${avgInterview}%`, subtitle: "Candidate quality", trend: "+12%" },
      { id: 4, title: "Max Match", value: `${highestMatch}%`, subtitle: "Top recommendation", trend: "Target: 95%" },
    ];
  }, [applicants]);

  const barData = useMemo(() => {
    const counts = {};
    applicants.forEach((a) => {
      counts[a.department] = (counts[a.department] || 0) + 1;
    });
    return Object.entries(counts).map(([department, applicants]) => ({
      department,
      applicants,
    }));
  }, [applicants]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      <ChartsRow barData={barData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Dept Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {barData.map((d) => (
                <div key={d.department} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{d.department}</span>
                    <span className="font-semibold text-gray-900">{d.applicants} applicants</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (d.applicants / (applicants.length || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {!barData.length && <p className="text-sm text-gray-500">No data available for active departments.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="text-sm text-emerald-800 font-medium">Auto-Matching Engine</span>
              <Badge className="bg-emerald-500">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="text-sm text-emerald-800 font-medium">CV Parser (v2.4)</span>
              <Badge className="bg-emerald-500">Stable</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
              <span className="text-sm text-blue-800 font-medium">Interviews Sync</span>
              <Badge className="bg-blue-500">Online</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
