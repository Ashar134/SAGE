import { useMemo, useState } from "react";
import { applicants } from "../data/applicants";
import StatCard from "../components/dashboard/StatCard";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Play, Video, Filter, ListFilter } from "lucide-react";

const statusPalette = {
  Applied: "bg-blue-50 text-blue-700",
  Shortlisted: "bg-amber-50 text-amber-700",
  "Interview Scheduled": "bg-indigo-50 text-indigo-700",
  Rejected: "bg-red-50 text-red-700",
  Offer: "bg-emerald-50 text-emerald-700",
};

const stageOrder = ["Applied", "Shortlisted", "Interview Scheduled", "Offer", "Rejected"];

export default function Applicants() {
  const [stageFilter, setStageFilter] = useState("all");

  const stats = useMemo(() => {
    const total = applicants.length;
    const shortlisted = applicants.filter((a) => a.status === "Shortlisted").length;
    const interview = applicants.filter((a) => a.status === "Interview Scheduled").length;
    const offers = applicants.filter((a) => a.status === "Offer").length;
    return [
      { id: 1, title: "Total Applicants", value: total, subtitle: "Across all departments", trend: "+12% vs last month" },
      { id: 2, title: "Shortlisted", value: shortlisted, subtitle: "Ready for interviews", trend: "+5%" },
      { id: 3, title: "Interviews", value: interview, subtitle: "Scheduled this week", trend: "+3%" },
      { id: 4, title: "Offers", value: offers, subtitle: "Pending acceptance", trend: "+1" },
    ];
  }, []);

  const filtered = useMemo(() => {
    if (stageFilter === "all") return applicants;
    return applicants.filter((a) => a.status === stageFilter);
  }, [stageFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aIdx = stageOrder.indexOf(a.status);
      const bIdx = stageOrder.indexOf(b.status);
      return aIdx - bIdx || b.matchScore - a.matchScore;
    });
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Applicants</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Auto-Match Candidates</h1>
            <p className="text-sm text-gray-500">
              AI-generated tests, interview scores, and stable matching insights for academic roles.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-gray-700">
              <Filter size={16} />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-transparent outline-none"
              >
                <option value="all">All stages</option>
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Assessment</option>
                <option value="Interview Scheduled">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500">
              <ListFilter size={16} />
              Smart filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-indigo-50 shadow-sm bg-gradient-to-br from-white via-indigo-50/40 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Top Matches</CardTitle>
              <p className="text-sm text-gray-500">Stable matching recommendations.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sorted.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-indigo-50 bg-white p-3 shadow-xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{a.name}</div>
                    <div className="text-xs text-gray-500">
                      {a.role} · {a.department}
                    </div>
                  </div>
                  <Badge className={`text-[10px] px-2 py-1 ${statusPalette[a.status] || "bg-gray-100 text-gray-700"}`}>
                    {a.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                  <span className="rounded-full bg-indigo-50 text-indigo-700 px-2 py-1">
                    Match {a.matchScore}%
                  </span>
                  <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-1">
                    Test {a.testScore}%
                  </span>
                  <span className="rounded-full bg-amber-50 text-amber-700 px-2 py-1">
                    Interview {a.interviewScore || "Pending"}
                  </span>
                  <span className="rounded-full bg-gray-100 text-gray-700 px-2 py-1">
                    {a.education}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-amber-50 shadow-sm bg-gradient-to-br from-white via-amber-50/40 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Next Interview</CardTitle>
            <p className="text-sm text-gray-500">AI-recorded sessions ready for review.</p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="rounded-lg border border-dashed border-amber-100 p-3 bg-white/80 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Prof. Ali Raza</p>
                <p className="text-xs text-gray-500">Mathematics · Interview Scheduled</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white px-3 py-2 text-xs font-semibold shadow-sm hover:bg-indigo-500">
                <Play size={14} />
                Play recording
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Identity verified, cheat detection enabled, metrics captured for communication, confidence, and professionalism.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Applicant Details</CardTitle>
            <p className="text-sm text-gray-500">Assessments, interviews, and AI recommendations.</p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60">
                <TableHead>Applicant</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Dept</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Interview</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((a) => (
                <TableRow key={a.id} className="hover:bg-gray-50/80">
                  <TableCell className="font-medium">
                    <div className="text-gray-900">{a.name}</div>
                    <div className="text-xs text-gray-400">{a.education}</div>
                  </TableCell>
                  <TableCell className="text-gray-700">{a.role}</TableCell>
                  <TableCell className="text-gray-700">{a.department}</TableCell>
                  <TableCell className="text-gray-700">{a.testScore}%</TableCell>
                  <TableCell className="text-gray-700">{a.interviewScore || "Pending"}</TableCell>
                  <TableCell className="text-gray-700">{a.matchScore}%</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] px-2 py-1 ${statusPalette[a.status] || "bg-gray-100 text-gray-700"}`}>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                      <Video size={14} />
                      View
                    </button>
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
