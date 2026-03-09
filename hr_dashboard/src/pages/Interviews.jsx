import { useEffect, useState, useMemo } from "react";
import { fetchApplicants } from "../lib/apiClient";
import { CalendarClock, Filter, MapPin, MessageSquare, Play, Video, ArrowUpRight, Clock, UserRoundCheck, AlertTriangle } from "lucide-react";

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
  new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const parseDateTime = (dateStr, timeStr) => new Date(`${dateStr} ${timeStr}`);

export default function Interviews() {
  const [applicants, setApplicants] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const interviews = useMemo(() => {
    return applicants
      .filter((a) => ["Interview Scheduled", "Shortlisted", "Offer", "Hired", "Rejected"].includes(a.status))
      .map((a) => ({
        id: `INT-${a.id}`,
        candidate: a.name,
        role: a.role,
        department: a.department,
        date: a.appliedDate || new Date().toISOString().split("T")[0],
        time: "10:00 AM",
        duration: "45 min",
        type: "Online",
        stage: "Technical + Demo",
        status: a.status === "Interview Scheduled" ? "Scheduled" : (a.interviewScore > 0 ? "Completed" : "Feedback Pending"),
        interviewer: "TBD",
        panel: ["Hiring Manager"],
        score: a.interviewScore,
        decision: a.interviewScore > 0 ? (a.interviewScore >= 80 ? "Move to Offer" : "Shortlist") : "Pending",
        feedback: "",
        recording: a.interviewScore > 0 ? "#" : "",
        location: "Zoom",
      }));
  }, [applicants]);

  useEffect(() => {
    setLoading(true);
    fetchApplicants()
      .then((rows) => {
        setApplicants(rows);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Unable to fetch applicants");
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const scheduled = interviews.filter((i) => i.status === "Scheduled").length;
    const completed = interviews.filter((i) => i.status === "Completed").length;
    const feedbackPending = interviews.filter((i) => i.status === "Feedback Pending").length;
    const noShow = interviews.filter((i) => i.status === "No-Show").length;
    const scored = interviews.filter((i) => i.score > 0);
    const avgScore =
      scored.length > 0
        ? Math.round(
          scored.reduce((sum, i) => sum + i.score, 0) / scored.length
        )
        : "—";

    return [
      {
        id: 1,
        title: "Scheduled",
        value: scheduled,
        subtitle: "Next 10 days",
        trend: "+1 vs last week",
        trendType: "up",
      },
      {
        id: 2,
        title: "Completed",
        value: completed,
        subtitle: "Past 14 days",
        trend: "+2 closed",
        trendType: "up",
      },
      {
        id: 3,
        title: "Average Score",
        value: typeof avgScore === "number" ? `${avgScore}%` : avgScore,
        subtitle: "All completed rounds",
        trend: noShow ? `${noShow} no-shows` : "Stable",
        trendType: noShow ? "down" : "up",
      },
      {
        id: 4,
        title: "Pending Feedback",
        value: feedbackPending,
        subtitle: "Need closure today",
        trend: feedbackPending ? "Remind panel" : "All clear",
        trendType: feedbackPending ? "down" : "up",
      },
    ];
  }, []);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (typeFilter !== "all" && i.type !== typeFilter) return false;
      return true;
    });
  }, [statusFilter, typeFilter]);

  const upcoming = useMemo(() => {
    return interviews
      .filter((i) => ["Scheduled", "Feedback Pending"].includes(i.status))
      .sort(
        (a, b) => parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time)
      )
      .slice(0, 4);
  }, []);

  const feedbackList = useMemo(
    () => interviews.filter((i) => i.status === "Completed" && i.feedback),
    []
  );

  const recordingsReady = useMemo(
    () => interviews.filter((i) => i.recording),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Interviews</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Interview Board</h1>
            <p className="text-sm text-gray-500">
              Schedule, recordings, and feedback for every candidate.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-gray-700">
              <Filter size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent outline-none"
              >
                <option value="all">All statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Feedback Pending">Feedback Pending</option>
                <option value="Completed">Completed</option>
                <option value="No-Show">No-Show</option>
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-gray-700">
              <Filter size={16} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent outline-none"
              >
                <option value="all">All types</option>
                <option value="Online">Online</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
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
              <CardTitle className="text-base font-semibold text-gray-900">
                Upcoming interviews
              </CardTitle>
              <p className="text-sm text-gray-500">Auto-recording enabled for online sessions.</p>
            </div>
            <Badge className="bg-white text-gray-700 border">
              {upcoming.length} scheduled
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((item) => {
              const Icon = typeIcon[item.type] || CalendarClock;
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-indigo-50 bg-white p-3 shadow-xs flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {item.candidate}
                      </div>
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
              <div className="text-sm text-gray-500">
                No interviews scheduled. Add slots to see them here.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-50 shadow-sm bg-gradient-to-br from-white via-emerald-50/30 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Recent feedback</CardTitle>
              <p className="text-sm text-gray-500">Close the loop on completed rounds.</p>
            </div>
            <ArrowUpRight size={16} className="text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            {feedbackList.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-emerald-50 bg-white p-3 text-sm text-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{item.candidate}</div>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2 py-1">
                    {item.decision}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {item.role} · {item.department} · Score {item.score}%
                </p>
                <p className="mt-2 leading-relaxed">{item.feedback}</p>
              </div>
            ))}
            {feedbackList.length === 0 && (
              <div className="text-sm text-gray-500">No feedback captured yet.</div>
            )}
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
                  {item.type} · {item.stage}
                </div>
                <button className="mt-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                  <Play size={14} />
                  Play recording
                </button>
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
                        {item.role} · {item.department} · {item.id}
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
                      {item.panel?.join(", ")}
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
                      <div className="inline-flex gap-2">
                        {item.recording && (
                          <button className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                            <Play size={14} />
                            Recording
                          </button>
                        )}
                        <button className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">
                          <MessageSquare size={14} />
                          Notes
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredInterviews.length === 0 && (
            <p className="text-sm text-gray-500 mt-3">
              No interviews match the selected filters.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-amber-100 bg-gradient-to-br from-white via-amber-50/30 to-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Follow-ups & risks</CardTitle>
            <p className="text-sm text-gray-500">Resolve pending items before offers are sent.</p>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
          <div className="rounded-lg border border-amber-100 bg-white p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900">Feedback pending</div>
              <p className="text-xs text-gray-500">
                {stats[3].value} interview(s) need panel notes today.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-amber-100 bg-white p-3 flex items-start gap-2">
            <UserRoundCheck className="h-4 w-4 text-emerald-600 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900">Panel coverage</div>
              <p className="text-xs text-gray-500">
                Ensure subject expert in every technical round; add co-interviewer if missing.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-amber-100 bg-white p-3 flex items-start gap-2">
            <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900">SLA</div>
              <p className="text-xs text-gray-500">
                Turnaround within 24 hours for scoring and written feedback.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
