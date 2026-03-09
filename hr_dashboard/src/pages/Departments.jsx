import { useEffect, useState, useMemo } from "react";
import { fetchApplicants, fetchJobs } from "../lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";

export default function Departments() {
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchApplicants(), fetchJobs()])
      .then(([appRows, jobRows]) => {
        setApplicants(appRows);
        setJobs(jobRows);
      })
      .catch((err) => console.error("Error fetching data for departments", err))
      .finally(() => setLoading(false));
  }, []);

  const deptStats = useMemo(() => {
    const map = {};
    jobs.forEach((j) => {
      const dept = j.department || "Uncategorized";
      if (!map[dept]) map[dept] = { name: dept, totalJobs: 0, totalApps: 0, avgTest: 0, appsList: [] };
      map[dept].totalJobs += 1;
    });

    applicants.forEach((a) => {
      const dept = a.department || "Uncategorized";
      if (!map[dept]) map[dept] = { name: dept, totalJobs: 0, totalApps: 0, avgTest: 0, appsList: [] };
      map[dept].totalApps += 1;
      map[dept].appsList.push(a);
    });

    return Object.values(map).map(d => {
      const avg = d.appsList.length
        ? Math.round(d.appsList.reduce((s, a) => s + (a.testScore || 0), 0) / d.appsList.length)
        : 0;
      return { ...d, avgTest: avg };
    });
  }, [jobs, applicants]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
        <p className="text-sm text-gray-500">Monitor positions and hiring needs per department.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {deptStats.map((d) => (
          <Card key={d.name} className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm font-semibold text-gray-900">{d.name}</CardTitle>
              <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100">{d.totalApps} Applicants</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="space-y-1">
                  <p>Active Jobs</p>
                  <p className="text-lg font-semibold text-gray-900">{d.totalJobs}</p>
                </div>
                <div className="space-y-1">
                  <p>Avg Test Score</p>
                  <p className="text-lg font-semibold text-gray-900">{d.avgTest}%</p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, (d.totalApps / 10) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">Targeting {Math.max(5, d.totalApps + 2)} applicants per job.</p>
            </CardContent>
          </Card>
        ))}
        {deptStats.length === 0 && <p className="text-sm text-gray-500">Loading department data...</p>}
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Department Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50/60">
                <TableCell>Department</TableCell>
                <TableCell>Jobs</TableCell>
                <TableCell>Applicants</TableCell>
                <TableCell>Avg Assessment</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deptStats.map((d) => (
                <TableRow key={d.name}>
                  <TableCell className="font-medium text-gray-900">{d.name}</TableCell>
                  <TableCell>{d.totalJobs}</TableCell>
                  <TableCell>{d.totalApps}</TableCell>
                  <TableCell>{d.avgTest}%</TableCell>
                  <TableCell>
                    <Badge className={d.totalJobs > 0 ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-700"}>
                      {d.totalJobs > 0 ? "Hiring" : "Idle"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
