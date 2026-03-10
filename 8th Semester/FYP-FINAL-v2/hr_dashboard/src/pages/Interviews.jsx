import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Filter, MapPin, MessageSquare, Video, ArrowUpRight, Clock, UserRoundCheck, AlertTriangle, Play } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { fetchApplicants } from "../lib/apiClient";

const statusStyles = {
  Scheduled: "bg-indigo-50 text-indigo-700",
  "Feedback Pending": "bg-amber-50 text-amber-700",
  Completed: "bg-emerald-50 text-emerald-700",
  "No-Show": "bg-red-50 text-red-700",
  Cancelled: "bg-red-50 text-red-700",
};

const typeIcon = {
  Online: Video,
  "On-site": MapPin,
};

const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD";

export default function Interviews() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    fetchApplicants()
      .then((rows) => {
        setApplicants(rows || []);
        setError(null);
      })
      .catch((err) => {
        setApplicants([]);
        setError(err.message || "Unable to load interviews");
      })
      .finally(() => setLoading(false));
  }, []);

  const interviews = useMemo(() => {
    return (applicants || [])
      .map((a) => {
        const iso = a.interviewDate || a.interview_date || null;
        const dt = iso ? new Date(iso) : null;
        const rawStatus = a.status || "Pending";
        const baseStatus = rawStatus.toLowerCase().includes("feedback") ? "Feedback Pending" : rawStatus;
        const status = dt ? (dt > new Date() ? "Scheduled" : baseStatus === "Pending" ? "Completed" : baseStatus) : baseStatus;
        return {
          id: a.id,
          candidate: a.name || "Candidate",
          role: a.role || "Role",
          department: a.department || a.company_name || a.companyName || "",
          status,
          type: (a.interviewType || a.interview_type || "").toLowerCase().includes("site") ? "On-site" : "Online",
          interviewer: a.interviewer || "TBD",
          duration: a.duration || "45 min",
          date: iso,
          time: dt ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD",
          location: a.location || "Meeting link shared via email",
          decision: rawStatus || "Pending",
          feedback: a.notes || "",
          recording: a.videoUrl,
          score: a.interviewScore || a.interview_score || 0,
          stage: rawStatus || "Interview",
          panel: a.panel || [],
        };
      })
      .filter((i) => i.date || i.status.toLowerCase().includes("interview"));
  }, [applicants]);

  const roles = useMemo(() => {
    const set = new Set((applicants || []).map((a) => a.role || "Unspecified role"));
    return Array.from(set);
  }, [applicants]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (typeFilter !== "all" && i.type !== typeFilter) return false;
      if (roleFilter !== "all" && (i.role || "Unspecified role") !== roleFilter) return false;
      return true;
    });
  }, [interviews, statusFilter, typeFilter, roleFilter]);

  const upcoming = useMemo(() => {
    return interviews
      .filter((i) => i.status === "Scheduled")
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
      .slice(0, 4);
  }, [interviews]);

  const feedbackList = useMemo(
    () => interviews.filter((i) => i.status === "Completed" && i.feedback),
    [interviews]
  );

  const recordingsReady = useMemo(
    () => interviews.filter((i) => i.recording),
    [interviews]
  );

  const stats = useMemo(() => {
    const scheduled = interviews.filter((i) => i.status === "Scheduled").length;
    const completed = interviews.filter((i) => i.status === "Completed").length;
    const feedbackPending = interviews.filter((i) => i.status === "Feedback Pending").length;
    const noShow = interviews.filter((i) => i.status === "No-Show").length;
    const scored = interviews.filter((i) => i.score > 0);
    const avgScore =
      scored.length > 0
        ? Math.round(scored.reduce((sum, i) => sum + i.score, 0) / scored.length)
        : "—";

    return [
      { id: 1, title: "Scheduled", value: scheduled, subtitle: "Next 10 days", trend: "+1 vs last week", trendType: "up" },
      { id: 2, title: "Completed", value: completed, subtitle: "Past 14 days", trend: "+2 closed", trendType: "up" },
      { id: 3, title: "Average Score", value: typeof avgScore === "number" ? `${avgScore}%` : avgScore, subtitle: "All completed rounds", trend: noShow ? `${noShow} no-shows` : "Stable", trendType: noShow ? "down" : "up" },
      { id: 4, title: "Pending Feedback", value: feedbackPending, subtitle: "Need closure today", trend: feedbackPending ? "Remind panel" : "All clear", trendType: feedbackPending ? "down" : "up" },
    ];
  }, [interviews]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Interview Board</h1>
          <p className="text-sm text-gray-500">Schedule, recordings, and feedback for every candidate.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-gray-700">
            <Filter size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent outline-none">
              <option value="all">All statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Feedback Pending">Feedback Pending</option>
              <option value="Completed">Completed</option>
              <option value="No-Show">No-Show</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-gray-700">
            <Filter size={16} />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-transparent outline-none">
              <option value="all">All types</option>
              <option value="Online">Online</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-gray-700">
            <Filter size={16} />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-transparent outline-none">
              <option value="all">All roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      {loading && (
        <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-700 px-3 py-2 text-sm">
          Loading interviews...
        </div>
      )}
      {!loading && error && (
        <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-gray-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Upcoming interviews</CardTitle>
              <p className="text-sm text-gray-500">Auto-recording enabled for online sessions.</p>
            </div>
            <Badge className="bg-white text-gray-700 border">{upcoming.length} scheduled</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((item) => {
              const Icon = typeIcon[item.type] || CalendarClock;
              return (
                <div key={item.id} className="rounded-xl border border-indigo-50 bg-white p-3 shadow-xs flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{item.candidate}</div>
                      <div className="text-xs text-gray-500">
                        {item.role} · {item.department}
                      </div>
                    </div>
                    <Badge className={`text-[10px] px-2 py-1 ${statusStyles[item.status] || "bg-gray-100 text-gray-700"}`}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2 py-1">
                      <CalendarClock size={12} />
                      {formatDate(item.date)} · {item.time}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2 py-1">
                      <Icon size={12} />
                      {item.type}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2 py-1">
                      <UserRoundCheck size={12} />
                      {item.interviewer}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-1">
                      <Clock size={12} />
                      {item.duration}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <MessageSquare size={12} />
                    {item.location}
                  </div>
                </div>
              );
            })}
            {upcoming.length === 0 && (
              <div className="text-sm text-gray-500">No interviews scheduled. Add slots to see them here.</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Recent feedback</CardTitle>
              <p className="text-sm text-gray-500">Close the loop on completed rounds.</p>
            </div>
            <ArrowUpRight size={16} className="text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            {feedbackList.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-lg border border-emerald-50 bg-white p-3 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{item.candidate}</div>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2 py-1">
                    {item.decision}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {item.role} · {item.department} · Score {item.score || "—"}%
                </p>
                {item.feedback && <p className="mt-2 leading-relaxed">{item.feedback}</p>}
              </div>
            ))}
            {feedbackList.length === 0 && <div className="text-sm text-gray-500">No feedback captured yet.</div>}
          </CardContent>
        </Card>
      </div>

      {recordingsReady.length > 0 && (
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Recordings ready</CardTitle>
              <p className="text-sm text-gray-500">Recently completed online sessions you can review now.</p>
            </div>
            <Badge className="bg-gray-100 text-gray-700 border">{recordingsReady.length} files</Badge>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recordingsReady.map((item) => (
              <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{item.candidate}</div>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2 py-1">
                    {item.decision}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {item.role} · {item.department}
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700">
                  <Video size={12} />
                  {item.type}
                </div>
                <a
                  className="mt-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                  href={item.recording}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Play size={14} />
                  Play recording
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Interview schedule</CardTitle>
            <p className="text-sm text-gray-500">Panel, mode, and scoring in one place.</p>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-gray-600">
            <CalendarClock size={16} />
            {filteredInterviews.length} items
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60">
                <TableHead>Candidate</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Interviewer(s)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterviews.map((item) => {
                const Icon = typeIcon[item.type] || CalendarClock;
                return (
                  <TableRow key={item.id} className="hover:bg-gray-50/80">
                    <TableCell className="font-medium text-gray-900">
                      <div>{item.candidate}</div>
                      <div className="text-xs text-gray-400">
                        {item.role} · {item.department}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">{item.stage}</TableCell>
                    <TableCell className="text-gray-700">
                      <div>{formatDate(item.date)}</div>
                      <div className="text-xs text-gray-500">{item.time}</div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        <Icon size={12} />
                        {item.type}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {item.panel && item.panel.length ? item.panel.join(", ") : "TBD"}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] px-2 py-1 ${statusStyles[item.status] || "bg-gray-100 text-gray-700"}`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {item.score ? `${item.score}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.recording ? (
                        <a
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                          href={item.recording}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Play size={14} />
                          Play
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No recording</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredInterviews.length === 0 && (
            <p className="text-sm text-gray-500 mt-3">No interviews match the selected filters.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Follow-ups</CardTitle>
            <p className="text-sm text-gray-500">Resolve pending items before offers are sent.</p>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
          <div className="rounded-lg border border-gray-200 bg-white p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900">Feedback pending</div>
              <p className="text-xs text-gray-500">Close completed rounds within 24h.</p>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 flex items-start gap-2">
            <UserRoundCheck className="h-4 w-4 text-emerald-600 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900">Panel coverage</div>
              <p className="text-xs text-gray-500">Ensure subject expert on each technical round.</p>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 flex items-start gap-2">
            <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900">SLA</div>
              <p className="text-xs text-gray-500">Target: schedule within 48h of application.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
