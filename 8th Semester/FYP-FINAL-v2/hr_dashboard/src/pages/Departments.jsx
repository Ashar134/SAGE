import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Building2, Users, Briefcase, Filter, ArrowRight } from "lucide-react";
import { fetchApplicants, fetchJobs } from "../lib/apiClient";

const statusOrder = ["Applied", "Shortlisted", "Interview Scheduled", "Offer", "Accepted", "Rejected"];

export default function Departments() {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchJobs(), fetchApplicants()])
      .then(([jobRows, appRows]) => {
        setJobs(jobRows || []);
        setApplicants(appRows || []);
        setError("");
      })
      .catch((err) => setError(err.message || "Unable to load departments"))
      .finally(() => setLoading(false));
  }, []);

  const deptStats = useMemo(() => {
    const stats = {};
    jobs.forEach((j) => {
      const key = j.department || "Unassigned";
      stats[key] = stats[key] || { openRoles: 0, jobs: [], applicants: [] };
      stats[key].openRoles += 1;
      stats[key].jobs.push(j);
    });
    applicants.forEach((a) => {
      const key = a.department || "Unassigned";
      stats[key] = stats[key] || { openRoles: 0, jobs: [], applicants: [] };
      stats[key].applicants.push(a);
    });
    return stats;
  }, [jobs, applicants]);

  const departmentList = useMemo(() => Object.keys(deptStats).sort(), [deptStats]);

  const currentDept = selectedDept === "all" ? null : selectedDept;
  const currentStats = currentDept ? deptStats[currentDept] : null;

  const stageCounts = useMemo(() => {
    const counts = { Applied: 0, Shortlisted: 0, "Interview Scheduled": 0, Offer: 0, Accepted: 0, Rejected: 0 };
    (currentStats?.applicants || []).forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return counts;
  }, [currentStats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
          <p className="text-sm text-gray-500">Headcount, open roles, and applicant flow by department.</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-gray-700">
          <Filter size={16} />
          <select
            value={currentDept || "all"}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-transparent outline-none"
          >
            <option value="all">All departments</option>
            {departmentList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {loading && (
        <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-700 px-3 py-2 text-sm">
          Loading departments...
        </div>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Departments",
            value: departmentList.length,
            subtitle: "Active in system",
            icon: <Building2 size={22} className="text-indigo-500" />,
          },
          {
            title: "Open roles",
            value: jobs.length,
            subtitle: "Across all departments",
            icon: <Briefcase size={22} className="text-indigo-500" />,
          },
          {
            title: "Applicants",
            value: applicants.length,
            subtitle: "Total candidates",
            icon: <Users size={22} className="text-indigo-500" />,
          },
          {
            title: "Selected dept",
            value: currentDept || "All departments",
            subtitle: currentDept
              ? `${currentStats?.openRoles || 0} open · ${(currentStats?.applicants || []).length} applicants`
              : `${jobs.length} open · ${applicants.length} applicants`,
            icon: <ArrowRight size={22} className="text-indigo-500" />,
          },
        ].map((card) => (
          <Card key={card.title} className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-900">{card.title}</CardTitle>
                <div className="rounded-full bg-gray-100 p-2 text-indigo-600">{card.icon}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-3xl font-semibold text-gray-900 leading-tight">{card.value}</p>
              <p className="text-sm text-gray-500">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">Department Overview</CardTitle>
          <p className="text-sm text-gray-500">Headcount, open roles, and pipeline status.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60">
                <TableHead>Department</TableHead>
                <TableHead>Open roles</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Shortlisted</TableHead>
                <TableHead>Interviews</TableHead>
                <TableHead>Offers</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentList.map((dept) => {
                const stats = deptStats[dept] || { jobs: [], applicants: [] };
                const shortlist = stats.applicants.filter((a) => a.status === "Shortlisted").length;
                const interviews = stats.applicants.filter((a) => a.status === "Interview Scheduled").length;
                const offers = stats.applicants.filter((a) => a.status === "Offer" || a.status === "Accepted").length;
                return (
                  <TableRow key={dept} className="hover:bg-gray-50/70">
                    <TableCell className="font-semibold text-gray-900">{dept}</TableCell>
                    <TableCell>{stats.openRoles || 0}</TableCell>
                    <TableCell>{stats.applicants.length}</TableCell>
                    <TableCell>{shortlist}</TableCell>
                    <TableCell>{interviews}</TableCell>
                    <TableCell>{offers}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDept(dept)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!departmentList.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-6">
                    No departments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail panel */}
      {currentDept && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border-gray-200 shadow-sm">
            <CardHeader className="flex items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">{currentDept} roles</CardTitle>
                <p className="text-sm text-gray-500">Open positions and deadlines.</p>
              </div>
              <Badge variant="outline" className="text-gray-700">
                {currentStats?.openRoles || 0} open
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {(currentStats?.jobs || []).map((job) => (
                <div key={job.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{job.title}</div>
                      <div className="text-xs text-gray-500">{job.type} · {job.location}</div>
                      {job.deadline && (
                        <div className="text-xs text-gray-400 mt-1">
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100">Job</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/applicants?q=${encodeURIComponent(job.title)}`;
                      }}
                    >
                      View applicants
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/jobs`;
                      }}
                    >
                      Open job post
                    </Button>
                  </div>
                </div>
              ))}
              {(currentStats?.jobs || []).length === 0 && (
                <div className="text-sm text-gray-500">No roles for this department.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Pipeline</CardTitle>
              <p className="text-sm text-gray-500">Candidates by stage.</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {statusOrder.map((stage) => (
                <div key={stage} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                  <span className="text-sm text-gray-700">{stage}</span>
                  <Badge variant="secondary" className="bg-white border text-gray-800">
                    {stageCounts[stage] || 0}
                  </Badge>
                </div>
              ))}
              {(currentStats?.applicants || []).length === 0 && (
                <div className="text-sm text-gray-500">No applicants yet.</div>
              )}
              <div className="pt-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    window.location.href = `/applicants?q=${encodeURIComponent(currentDept)}`;
                  }}
                >
                  View applicants for {currentDept}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
