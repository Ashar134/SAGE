import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchApplicantsWithMeta } from "../lib/apiClient";
import StatCard from "../components/dashboard/StatCard";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  Play,
  Video,
  Filter,
  ListFilter,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  FileText,
  GraduationCap,
  BadgeCheck,
  TrendingUp,
  Award,
} from "lucide-react";

const statusPalette = {
  applied: "bg-blue-50 text-blue-700",
  test: "bg-amber-50 text-amber-700",
  interview: "bg-[#e0f0ff] text-[#272727]",
  rejected: "bg-red-50 text-red-700",
  offer: "bg-emerald-50 text-emerald-700",
  accepted: "bg-emerald-50 text-emerald-700",
  reviewing: "bg-[#e0f0ff] text-[#272727]",
  Reviewing: "bg-[#e0f0ff] text-[#272727]",
};

const stageOrder = ["reviewing", "Reviewing", "applied", "test", "interview", "offer", "rejected", "accepted"];

const formatStatus = (status) => {
  if (!status) return "Status";
  const str = status.toString();
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function Applicants() {
  const [applicants, setApplicants] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stageFilter, setStageFilter] = useState("all");
  const [tableJobFilter, setTableJobFilter] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = (searchParams.get("q") || "").toLowerCase().trim();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchApplicantsWithMeta()
      .then(({ applicants: rows, jobTitles: titles }) => {
        setApplicants(rows || []);
        setJobTitles(titles || []);
        setError(null);
      })
      .catch((err) => {
        setApplicants([]);
        setError(err.message || "Unable to load applicants");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStageChange = (value) => {
    setStageFilter(value);
    // When returning to "all", also clear search to avoid empty results
    if (value === "all") {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.delete("q");
        return p;
      });
    }
  };

  const stats = useMemo(() => {
    const total = applicants.length;
    const shortlisted = applicants.filter((a) => (a.status || "").toLowerCase() === "test").length;
    const interview = applicants.filter((a) => (a.status || "").toLowerCase() === "interview").length;
    const offers = applicants.filter((a) => ["offer", "accepted"].includes((a.status || "").toLowerCase())).length;
    const rejected = applicants.filter((a) => (a.status || "").toLowerCase() === "rejected").length;
    const avgMatch =
      applicants.length > 0
        ? Math.round(
          applicants.reduce((sum, a) => sum + (Number.isFinite(a.matchScore) ? a.matchScore : 0), 0) /
          applicants.length
        )
        : 0;
    return [
      { id: 1, title: "Total Applicants", value: total, subtitle: "Across all departments" },
      { id: 2, title: "Shortlisted", value: shortlisted, subtitle: "Assessment / Screening" },
      { id: 3, title: "Interviews", value: interview, subtitle: "Scheduled or in progress" },
      { id: 4, title: "Onboarding", value: offers, subtitle: "Accepted or Pending" },
      { id: 5, title: "Rejected", value: rejected, subtitle: "Closed applications" },
      { id: 6, title: "Avg Match", value: `${avgMatch}%`, subtitle: "Overall fit score" },
    ];
  }, [applicants]);

  const statusCounts = useMemo(() => {
    const counts = {};
    applicants.forEach((a) => {
      const s = (a.status || "").toLowerCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [applicants]);

  const topRoles = useMemo(() => {
    const counts = {};
    applicants.forEach((a) => {
      const role = a.role || "Unspecified";
      counts[role] = (counts[role] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [applicants]);

  const onboardingCandidates = useMemo(() => {
    return applicants
      .filter((a) => (a.status || "").toLowerCase() === "accepted")
      .sort((a, b) => new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0));
  }, [applicants]);

  const filtered = useMemo(() => {
    const stageFiltered =
      stageFilter === "all" ? applicants : applicants.filter((a) => a.status === stageFilter);

    if (!searchTerm) return stageFiltered;

    return stageFiltered.filter((a) => {
      const hay = [
        a.name,
        a.role,
        a.department,
        a.status,
        a.education,
        a.email,
        a.candidateCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(searchTerm);
    });
  }, [applicants, stageFilter, searchTerm]);

  const sorted = useMemo(() => {
    // Only show candidates who are Under Review AND have given test or interview
    const shortlisted = filtered.filter((a) =>
      (a.status === "reviewing" || a.status === "Reviewing") &&
      (Number.isFinite(a.testScore) || Number.isFinite(a.interviewScore))
    );

    // Apply table-level job title filter
    const jobFiltered =
      tableJobFilter === "all"
        ? shortlisted
        : shortlisted.filter((a) => a.role === tableJobFilter);

    // Sort by match score descending (highest first)
    return [...jobFiltered].sort((a, b) => {
      const matchA = Number.isFinite(a.matchScore) ? a.matchScore : -1;
      const matchB = Number.isFinite(b.matchScore) ? b.matchScore : -1;
      return matchB - matchA;
    });
  }, [filtered, tableJobFilter]);

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d)) return value;
    return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Auto-Match Candidates</h1>
            <p className="text-sm text-gray-500">
              AI-generated tests, interview scores, and stable matching insights for academic roles.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {searchTerm && (
              <div className="rounded-full bg-[#e0f0ff] text-[#272727] px-3 py-1 text-xs font-semibold flex items-center gap-2">
                Searching for “{searchTerm}”
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() =>
                    setSearchParams((prev) => {
                      const p = new URLSearchParams(prev);
                      p.delete("q");
                      return p;
                    })
                  }
                >
                  clear
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-gray-700">
              <Filter size={16} />
              <select
                value={stageFilter}
                onChange={(e) => handleStageChange(e.target.value)}
                className="bg-transparent outline-none"
              >
                <option value="all">All stages</option>
                <option value="applied">Applied</option>
                <option value="test">Assessment</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 rounded-md bg-[#272727] text-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-black">
              <ListFilter size={16} />
              Smart filters
            </button>
          </div>
        </div>
      </div>

      {/* KPIs: 3 columns on wide screens to avoid lone card gaps */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
        {stats.slice(0, 4).map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
        {stats.slice(4, 6).map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-emerald-50 shadow-sm bg-gradient-to-br from-white via-emerald-50/30 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Onboarding Pipeline</CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">Candidates who accepted the offer — ready to onboard.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-xs font-semibold">
              <BadgeCheck size={13} />
              {onboardingCandidates.length} Accepted
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {onboardingCandidates.map((a, idx) => (
              <div
                key={a.id}
                className="rounded-xl border border-emerald-50 bg-white p-3 shadow-xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">

                    <div>
                      <div className="text-sm font-semibold text-gray-900">{a.name}</div>
                      <div className="text-xs text-gray-500">{a.role}</div>
                    </div>
                  </div>
                  <Badge className="text-xs px-2.5 py-1 font-medium bg-emerald-50 text-emerald-700">
                    Offer Accepted
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Applied {a.appliedDate ? new Date(a.appliedDate).toLocaleDateString() : "—"}</span>
                  <button
                    className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 font-medium"
                    onClick={() => setSelected(a)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
            {!onboardingCandidates.length && (
              <div className="text-sm text-gray-500 py-6 text-center">
                No candidates have accepted an offer yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Top Roles</CardTitle>
            <p className="text-sm text-gray-500">Where applicants are concentrating.</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            {topRoles.map((role) => (
              <div key={role.role} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                <span className="font-semibold text-gray-900">{role.role}</span>
                <span className="inline-flex items-center gap-1 text-[#272727] font-semibold">
                  <TrendingUp size={14} /> {role.count}
                </span>
              </div>
            ))}
            {!topRoles.length && <div className="text-gray-500">No roles yet.</div>}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900"> Top Candidates by Match</CardTitle>
            <p className="text-sm text-gray-500">Candidates recommended by Sage for each role.</p>
          </div>
          {/* Job title filter for this table */}
          <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-gray-700 shadow-xs">
            <ListFilter size={15} className="text-[#272727]" />
            <select
              id="table-job-title-filter"
              value={tableJobFilter}
              onChange={(e) => setTableJobFilter(e.target.value)}
              className="bg-transparent outline-none text-sm max-w-[180px]"
            >
              <option value="all">All Jobs</option>
              {jobTitles.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-700 px-3 py-2 text-sm mb-3">
              Loading applicants...
            </div>
          )}
          {!loading && error && (
            <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm mb-3">
              {error}
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60">
                <TableHead>Applicant</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Dept</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Interview</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((a) => (
                <TableRow key={a.id} className="hover:bg-gray-50/80">
                  <TableCell className="font-medium text-gray-900">{a.name}</TableCell>
                  <TableCell className="text-gray-700 text-sm">
                    {a.appliedDate ? new Date(a.appliedDate).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-gray-700">{a.role}</TableCell>
                  <TableCell className="text-gray-700">{a.department}</TableCell>
                  <TableCell>
                    {a.skillScore != null ? (
                      <span className="text-xs font-semibold text-gray-900">
                        {a.skillScore}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {Number.isFinite(a.testScore) ? (
                      <span className="text-xs font-semibold text-gray-900">
                        {Math.round(a.testScore)}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {Number.isFinite(a.interviewScore) ? (
                      <span className="text-xs font-semibold text-gray-900">
                        {Math.round(a.interviewScore)}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Pending</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {Number.isFinite(a.matchScore) ? (
                      <span className="text-xs font-semibold text-gray-900">
                        {a.matchScore}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {a.resumeUrl ? (
                      <a
                        href={a.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-600 hover:underline text-xs"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">No CV</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className="text-xs px-3 py-1.5 font-medium"
                      style={{ backgroundColor: '#e0f0ff', color: '#272727' }}>
                      {formatStatus(a.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <button
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                        onClick={() => setSelected(a)}
                      >
                        <Eye size={14} />
                        View
                      </button>
                      {a.videoUrl && (
                        <a
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                          href={a.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Video size={14} />
                          Recording
                        </a>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!sorted.length && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-sm text-gray-500 py-6">
                    No candidates are currently under review or have an offer
                    {tableJobFilter !== "all" ? ` for "${tableJobFilter}"` : ""}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-3">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-[fadeIn_0.2s_ease]">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,#e0f0ff,transparent_35%),radial-gradient(circle_at_80%_0,#e0f0ff,transparent_40%)]" />

            <div className="flex items-start justify-between px-6 py-5 border-b relative">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-gray-900 leading-snug">{selected.name}</h2>
                <p className="text-sm text-gray-500">{selected.role} · {selected.department}</p>
              </div>
              <button
                className="rounded-full p-2 hover:bg-gray-100 text-gray-600"
                onClick={() => setSelected(null)}
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap gap-3">


                  {Number.isFinite(selected.skillScore) && (
                    <span className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold"
                      style={{ backgroundColor: 'rgb(224, 240, 255)', color: '#272727' }}>
                      Skill {selected.skillScore}%
                    </span>
                  )}
                  {Number.isFinite(selected.testScore) && (
                    <span className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold"
                      style={{ backgroundColor: 'rgb(224, 240, 255)', color: '#272727' }}>
                      Test {selected.testScore}%
                    </span>
                  )}
                  {selected.interviewScore && (
                    <span className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold"
                      style={{ backgroundColor: 'rgb(224, 240, 255)', color: '#272727' }}>
                      Interview {selected.interviewScore}%
                    </span>
                  )}
                  {Number.isFinite(selected.matchScore) && (
                    <span className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold"
                      style={{ backgroundColor: 'rgb(224, 240, 255)', color: '#272727' }}>
                      Match {selected.matchScore}%
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1.5 text-sm font-medium">
                    Applied {formatDateTime(selected.appliedDate)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="rounded-xl border border-[#f9fafb] bg-[#f9fafb] px-3 py-2">
                    <p className="text-xs uppercase text-gray-400">Current stage</p>
                    <p className="font-semibold text-[#272727]">{formatStatus(selected.status || "Unknown")}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                    <p className="text-xs uppercase text-gray-400">Role / Dept</p>
                    <p className="font-semibold text-gray-900">{selected.role || "—"}</p>
                    <p className="text-xs text-gray-500">{selected.department || "—"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase text-gray-400">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {(selected.skills && selected.skills.length ? selected.skills : ["Not provided"]).map((s, idx) => (
                      <span key={idx} className="rounded-full bg-gray-100 text-gray-700 px-2 py-1 text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase text-gray-400">Notes / Rejection reason</p>
                  <div className="rounded-xl border border-gray-100 bg-white px-3 py-3 text-sm text-gray-700 min-h-[64px]">
                    {selected.rejectionReason || selected.notes || "None"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 space-y-2 text-sm text-gray-700">
                  <p className="text-xs uppercase text-gray-400">Contact</p>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-500" />
                    <span>{selected.email || "No email"}</span>
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-500" />
                      <span>{selected.phone}</span>
                    </div>
                  )}
                  {selected.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-500" />
                      <span>{selected.location}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-white px-3 py-3 space-y-2 text-sm text-gray-700">
                  <p className="text-xs uppercase text-gray-400">Education</p>
                  <div className="flex items-start gap-2">
                    <GraduationCap size={14} className="text-gray-500 mt-0.5" />
                    <span>{selected.education || "Not provided"}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white px-3 py-3 space-y-2 text-sm text-gray-700">
                  <p className="text-xs uppercase text-gray-400">Resume / CV</p>
                  {selected.resumeUrl ? (
                    <a
                      href={selected.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2"
                      style={{ color: 'black' }}
                    >
                      <FileText size={14} />
                      View Resume
                    </a>
                  ) : (
                    <span className="text-gray-500">No resume uploaded</span>
                  )}
                </div>

                {selected.videoUrl && (
                  <div className="rounded-xl border border-[#e0f0ff] bg-[#e0f0ff]/30 px-4 py-4 space-y-2">
                    <p className="text-xs uppercase text-gray-400">Interview Session</p>
                    <a
                      href={selected.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3  text-base bg-white w-fit px-4 py-2 rounded-lg border border-[#e0f0ff] shadow-sm transition-all hover:shadow-md"
                      style={{ color: 'black' }}
                    >
                      <Video size={20} />
                      View Interview Recording
                    </a>
                  </div>
                )}

                {selected.status === "Accepted" && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-emerald-700 flex items-center gap-2 text-sm">
                    <BadgeCheck size={16} />
                    Candidate accepted the offer.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
