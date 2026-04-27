import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Filter, MapPin, MessageSquare, Video, ArrowUpRight, Clock, UserRoundCheck, AlertTriangle, Play, ChevronDown, ChevronUp } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { fetchApplicants } from "../lib/apiClient";

const statusStyles = {
  Scheduled: "bg-[#e0f0ff] text-[#272727]",
  "Feedback Pending": "bg-amber-50 text-amber-700",
  Completed: "bg-emerald-50 text-emerald-700",
  "No-Show": "bg-red-50 text-red-700",
  Cancelled: "bg-red-50 text-red-700",
  reviewing: "bg-[#e0f0ff] text-[#272727]",
  Reviewing: "bg-[#e0f0ff] text-[#272727]",
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
  const [expandedRow, setExpandedRow] = useState(null);
  const [videoModal, setVideoModal] = useState(null);

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
        const iso = a.interviewDate || a.interview_date || a.interviewCompletedAt || null;
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
          interviewer: a.interviewer || "SAGE AI",
          duration: a.duration || "AI Interview",
          date: iso,
          time: dt ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD",
          location: a.location || "AI-conducted interview",
          decision: rawStatus || "Pending",
          feedback: a.notes || "",
          recording: a.interviewRecordingUrl || a.videoUrl || null,
          score: a.interviewScore || 0,
          confidenceScore: a.confidenceScore || null,
          transcript: a.interviewTranscript || [],
          stage: rawStatus || "Interview",
          panel: a.panel || [],
        };
      })
      .filter((i) => i.score > 0 || i.recording || i.transcript.length > 0 || i.status === "reviewing");
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
      { id: 1, title: "Scheduled", value: scheduled, subtitle: "Next 10 days" },
      { id: 2, title: "Completed", value: completed, subtitle: "Past 14 days" },
      { id: 3, title: "Average Score", value: typeof avgScore === "number" ? `${avgScore}%` : avgScore, subtitle: "All completed rounds", trend: noShow ? `${noShow} no-shows` : null, trendType: "down" },
      { id: 4, title: "Pending Feedback", value: feedbackPending, subtitle: "Need closure today", trend: feedbackPending ? "Remind panel" : null, trendType: "down" },
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
                <div key={item.id} className="rounded-xl border border-[#e0f0ff] bg-white p-3 shadow-xs flex flex-col gap-2">
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#e0f0ff] text-[#272727] px-2 py-1">
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
                  <Badge className="text-[10px] px-2 py-1 font-medium border border-[#e0f0ff]"
                    style={{ backgroundColor: '#e0f0ff', color: '#272727' }}>
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
                  <Badge className="text-[10px] px-2 py-1 font-medium border border-[#e0f0ff]"
                    style={{ backgroundColor: 'rgb(243 244 246 / var(--tw-bg-opacity, 1))', color: '#272727' }}>
                    {item.decision}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {item.role} · {item.department}
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

      {/* Video Modal */}
      {videoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setVideoModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl p-4 max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Interview Recording — {videoModal.candidate}</h3>
              <button onClick={() => setVideoModal(null)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
            </div>
            <video
              src={videoModal.recording}
              controls
              autoPlay
              crossOrigin="anonymous"
              className="w-full rounded-lg bg-black"
              style={{ maxHeight: "60vh" }}
            />
            <p className="text-xs text-gray-500 mt-2">{videoModal.role} · {videoModal.department} · Score: {videoModal.score ? `${videoModal.score}%` : "—"}</p>
          </div>
        </div>
      )}

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Interview Results</CardTitle>
            <p className="text-sm text-gray-500">AI-scored interviews with full transcript and recording.</p>
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
                <TableHead>Role</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Overall Score</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterviews.map((item) => (
                <>
                  <TableRow key={item.id} className="hover:bg-gray-50/80 cursor-pointer" onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}>
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {expandedRow === item.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                        {item.candidate}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      <div>{item.role}</div>
                      <div className="text-xs text-gray-400">{item.department}</div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      <div>{formatDate(item.date)}</div>
                      <div className="text-xs text-gray-500">{item.time}</div>
                    </TableCell>
                    <TableCell>
                      {item.score > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-[#272727]" style={{ width: `${Math.min(item.score, 100)}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{item.score.toFixed(1)}%</span>
                        </div>
                      ) : <span className="text-gray-400 text-sm">—</span>}
                    </TableCell>
                    <TableCell>
                      {item.confidenceScore != null ? (
                        <span className="text-sm text-gray-700">{(item.confidenceScore * 10).toFixed(1)}%</span>
                      ) : <span className="text-gray-400 text-sm">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] px-2 py-1 ${statusStyles[item.status] || "bg-gray-100 text-gray-700"}`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {item.recording ? (
                          <button
                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-[#272727] border-[#e0f0ff] hover:bg-[#e0f0ff]"
                            onClick={() => setVideoModal(item)}
                          >
                            <Play size={12} />
                            Watch
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">No recording</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded row — transcript + score breakdown */}
                  {expandedRow === item.id && (
                    <TableRow key={`${item.id}-expanded`}>
                      <TableCell colSpan={7} className="bg-gray-50 p-0">
                        <div className="p-4 space-y-4">

                          {/* Score breakdown per answer */}
                          {item.transcript && item.transcript.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-800 mb-3">Interview Transcript & Scores</h4>
                              <div className="space-y-3">
                                {item.transcript.map((entry, idx) => {
                                  const s = entry.scores || {};
                                  return (
                                    <div key={idx} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                                      <div className="font-medium text-gray-800 mb-1">Q{idx + 1}: {entry.question}</div>
                                      <div className="text-gray-600 mb-2 text-xs leading-relaxed bg-gray-50 rounded p-2">
                                        {entry.answer || <em className="text-gray-400">No answer recorded</em>}
                                      </div>
                                      {s.total != null && (
                                        <div className="flex flex-wrap gap-2 text-xs">
                                          {[
                                            { label: "Communication", val: s.communication },
                                            { label: "Relevance", val: s.relevance },
                                            { label: "Technical", val: s.technical },
                                            { label: "Reasoning", val: s.reasoning },
                                            { label: "Total", val: s.total },
                                          ].map(({ label, val }) => val != null && (
                                            <span key={label} className={`rounded-full px-2 py-0.5 border border-blue-100 ${label === 'Total' ? 'font-bold' : ''}`}
                                              style={{ backgroundColor: 'rgb(224, 240, 255)', color: '#111827' }}>
                                              {label}: {typeof val === "number" ? val.toFixed(1) : val}/10
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Confidence breakdown */}
                          {item.confidenceScore != null && (
                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                              <h4 className="text-sm font-semibold text-gray-800 mb-2">Visual Confidence Score</h4>
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-2 rounded-full bg-gray-100 overflow-hidden">
                                  <div className="h-full rounded-full bg-[#272727]" style={{ width: `${Math.min(item.confidenceScore * 10, 100)}%` }} />
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{(item.confidenceScore * 10).toFixed(1)}%</span>
                                <span className="text-xs text-gray-500">(eye contact, facial expression, posture, dressing)</span>
                              </div>
                            </div>
                          )}

                          {item.transcript.length === 0 && item.confidenceScore == null && (
                            <p className="text-sm text-gray-500">No detailed data available for this interview.</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
          {filteredInterviews.length === 0 && (
            <p className="text-sm text-gray-500 mt-3">No completed interviews found. Interviews appear here after candidates submit them.</p>
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
