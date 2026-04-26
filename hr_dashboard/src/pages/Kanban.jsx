import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Filter, ArrowRight, ArrowLeft, X, Check, MoreVertical } from "lucide-react";
import { fetchApplicants, updateApplicantStatus } from "../lib/apiClient";

const columns = [
  { id: "applied", title: "Applied" },
  { id: "test", title: "Assessment" },
  { id: "interview", title: "Interview" },
  { id: "reviewing", title: "Under Review" },
  { id: "offer", title: "Offer" },
  { id: "rejected", title: "Rejected" },
];

const nextStatus = {
  applied: "test",
  test: "interview",
  interview: "reviewing",
  reviewing: "offer",
};

const prevStatus = {
  test: "applied",
  interview: "test",
  reviewing: "interview",
  offer: "reviewing",
  rejected: "reviewing",
};

const ADVANCE_LABEL = {
  applied: "Move to Assessment",
  test: "Move to Interview",
  interview: "Move to Under Review",
  reviewing: "Move to Offer",
};

const BACK_LABEL = {
  test: "Back to Applied",
  interview: "Back to Assessment",
  reviewing: "Back to Interview",
  offer: "Back to Under Review",
  rejected: "Back to Under Review",
};

/** Universal 3-dot dropdown menu for every card */
function CardMenu({ item, colId, onAdvance, onBack, onReject, onAccept }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded-md hover:bg-gray-200/70 text-gray-400 hover:text-gray-700 transition-colors"
        title="Actions"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-50 w-52 rounded-lg border border-gray-200 bg-white shadow-lg py-1 text-sm">
          {/* → Advance */}
          {nextStatus[colId] && (
            <button
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-[#e0f0ff] text-gray-700 hover:text-[#272727] transition-colors"
              onClick={() => { onAdvance(item.id, colId); close(); }}
            >
              <ArrowRight size={14} className="text-[#272727]" />
              {ADVANCE_LABEL[colId]}
            </button>
          )}

          {/* ← Back */}
          {prevStatus[colId] && (
            <button
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
              onClick={() => { onBack(item.id, colId); close(); }}
            >
              <ArrowLeft size={14} className="text-gray-400" />
              {BACK_LABEL[colId]}
            </button>
          )}

          {/* ✓ Accept (Offer only) */}
          {colId === "offer" && item.status !== "accepted" && (
            <button
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 transition-colors"
              onClick={() => { onAccept(item.id); close(); }}
            >
              <Check size={14} />
              Mark as Accepted
            </button>
          )}

          {/* ✕ Reject */}
          {colId !== "rejected" && (
            <>
              <div className="my-1 border-t border-gray-100" />
              <button
                className="flex w-full items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                onClick={() => { onReject(item.id); close(); }}
              >
                <X size={14} />
                Reject candidate
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Kanban() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    fetchApplicants()
      .then((rows) => {
        // Filter out junk / incomplete records
        const clean = (rows || []).filter(
          (a) => a.role && a.role.toLowerCase() !== "resume upload"
        );
        setApplicants(clean);
        setError("");
      })
      .catch((err) => setError(err.message || "Unable to load applicants"))
      .finally(() => setLoading(false));
  }, []);

  const byColumn = useMemo(() => {
    const base = columns.reduce((acc, c) => ({ ...acc, [c.id]: [] }), {});
    applicants.forEach((a) => {
      if (roleFilter !== "all" && (a.role || "") !== roleFilter) return;

      // Normalise accepted → offer for column placement
      const colId = a.status === "accepted" ? "offer" : a.status;
      const col = columns.find((c) => c.id === colId);

      // Place candidate only in their CURRENT column (no duplication)
      if (col) base[col.id].push(a);
    });
    return base;
  }, [applicants, roleFilter]);

  const roles = useMemo(
    () => Array.from(new Set(applicants.map((a) => a.role || "Unspecified"))),
    [applicants]
  );

  const moveTo = async (id, target) => {
    const snapshot = [...applicants];
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: target } : a))
    );
    try {
      await updateApplicantStatus(id, target);
    } catch (e) {
      setApplicants(snapshot);
      setError(e.message || "Failed to update status");
    }
  };

  const handleAdvance = (id, col) => { const t = nextStatus[col]; if (t) moveTo(id, t); };
  const handleBack = (id, col) => { const t = prevStatus[col]; if (t) moveTo(id, t); };
  const handleReject = (id) => moveTo(id, "rejected");
  const handleAccept = (id) => moveTo(id, "accepted");

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Candidate Board</h1>
          <p className="text-sm text-gray-500">
            Move candidates forward with explicit actions.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-gray-700">
          <Filter size={16} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent outline-none"
          >
            <option value="all">All roles</option>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}
      {loading && <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-700 px-3 py-2 text-sm">Loading board...</div>}

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {columns.map((col) => (
          <Card key={col.id} className="border-gray-200 shadow-sm bg-gradient-to-b from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900">{col.title}</CardTitle>
                <p className="text-xs text-gray-500">Stage candidates</p>
              </div>
              <Badge className="bg-white text-gray-700 border hover:bg-white cursor-default">{byColumn[col.id]?.length || 0}</Badge>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {byColumn[col.id]?.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-6">No candidates here</div>
                )}

                {byColumn[col.id]?.map((item) => (
                  <div
                    key={`${col.id}-${item.id}`}
                    className={`rounded-xl border p-3 shadow-sm ${col.id === "applied"
                      ? "border-gray-100 bg-gray-50/80"
                      : "border-gray-200 bg-white/90"
                      }`}
                  >
                    {/* Top row: name + 3-dot menu */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-900 leading-tight truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">
                          {item.role}
                        </div>
                      </div>

                      <CardMenu
                        item={item}
                        colId={col.id}
                        onAdvance={handleAdvance}
                        onBack={handleBack}
                        onReject={handleReject}
                        onAccept={handleAccept}
                      />
                    </div>

                    {/* Score badge */}
                    <div className="mt-2">
                      {col.id === "applied" && item.skillScore != null && (
                        <div className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold border border-blue-100"
                          style={{ backgroundColor: "#e0f0ff", color: "#1e40af" }}>
                          Skill Matched: {item.skillScore}%
                        </div>
                      )}
                      {col.id === "test" && item.testScore != null && (
                        <div className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold border border-blue-100"
                          style={{ backgroundColor: "#e0f0ff", color: "#1e40af" }}>
                          Assessment: {Math.round(item.testScore)}%
                        </div>
                      )}
                      {col.id === "interview" && item.interviewScore != null && (
                        <div className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold border border-blue-100"
                          style={{ backgroundColor: "#e0f0ff", color: "#1e40af" }}>
                          Interview: {Math.round(item.interviewScore)}%
                        </div>
                      )}
                      {col.id === "offer" && item.matchScore != null && (
                        <div className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold border border-blue-100"
                          style={{ backgroundColor: "#e0f0ff", color: "#1e40af" }}>
                          Overall Match: {item.matchScore}%
                        </div>
                      )}
                      {["reviewing", "rejected"].includes(col.id) && item.matchScore != null && (
                        <div className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold border border-blue-100"
                          style={{ backgroundColor: "#e0f0ff", color: "#1e40af" }}>
                          Match Score: {item.matchScore}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
