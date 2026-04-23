import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Filter, ArrowRight, ArrowLeft, X, Check } from "lucide-react";
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
const statusChip = {
  applied: "bg-blue-50 text-blue-700 border-blue-100",
  test: "bg-amber-50 text-amber-700 border-amber-100",
  interview: "bg-indigo-50 text-indigo-700 border-indigo-100",
  reviewing: "bg-sky-50 text-sky-700 border-sky-100",
  offer: "bg-emerald-50 text-emerald-700 border-emerald-100",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-100",
};

export default function Kanban() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    fetchApplicants()
      .then((rows) => {
        setApplicants(rows || []);
        setError("");
      })
      .catch((err) => setError(err.message || "Unable to load applicants"))
      .finally(() => setLoading(false));
  }, []);

  const byColumn = useMemo(() => {
    const base = columns.reduce((acc, c) => ({ ...acc, [c.id]: [] }), {});
    applicants.forEach((a) => {
      if (roleFilter !== "all" && (a.role || "") !== roleFilter) return;
      let statusKey = a.status;
      if (statusKey === "accepted") statusKey = "offer";
      const key = columns.find((c) => c.id === statusKey)?.id;

      // Always add to 'applied' as a permanent record
      base["applied"].push(a);

      // Also add to their current status column (if different from applied)
      if (key && key !== "applied") {
        base[key].push(a);
      }
    });
    return base;
  }, [applicants, roleFilter]);

  const roles = useMemo(() => {
    const set = new Set(applicants.map((a) => a.role || "Unspecified"));
    return Array.from(set);
  }, [applicants]);

  const moveTo = async (id, target) => {
    const snapshot = applicants;
    setApplicants((prevList) => prevList.map((a) => (a.id === id ? { ...a, status: target } : a)));
    try {
      await updateApplicantStatus(id, target);
    } catch (e) {
      setApplicants(snapshot);
      setError(e.message || "Failed to update status");
    }
  };

  const handleAdvance = (id, current) => {
    const target = nextStatus[current];
    if (target) moveTo(id, target);
  };

  const handleBack = (id, current) => {
    const target = prevStatus[current];
    if (target) moveTo(id, target);
  };

  const handleReject = async (id) => {
    moveTo(id, "rejected");
  };

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Candidate Board</h1>
          <p className="text-sm text-gray-500">Move candidates forward with explicit actions — no drag and drop.</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-gray-700">
          <Filter size={16} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent outline-none"
          >
            <option value="all">All roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
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
          Loading board...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {columns.map((col) => (
          <Card key={col.id} className="border-gray-200 shadow-sm bg-gradient-to-b from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900">{col.title}</CardTitle>
                <p className="text-xs text-gray-500">Stage candidates</p>
              </div>
              <Badge className="bg-white text-gray-700 border">{byColumn[col.id]?.length || 0}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {byColumn[col.id]?.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-6">No candidates here</div>
                )}
                {byColumn[col.id]?.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3 shadow-sm ${
                      col.id === "applied"
                        ? "border-gray-100 bg-gray-50/80"
                        : "border-gray-200 bg-white/90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.role}</div>
                        <div className="mt-1 text-xs text-gray-400">{item.department}</div>
                        {/* Scores only shown outside the applied column */}
                        {col.id !== "applied" && item.testScore !== null && item.testScore !== undefined && (
                          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-100">
                            Test: {Math.round(item.testScore)}%
                          </div>
                        )}
                        {col.id !== "applied" && item.interviewScore !== null && item.interviewScore !== undefined && item.interviewScore > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 border border-indigo-100">
                            Interview: {Math.round(item.interviewScore)}%
                          </div>
                        )}
                        {/* In applied column show current status as a badge */}
                        {col.id === "applied" && item.status && item.status !== "applied" && (
                          <div className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${statusChip[item.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                            {item.status}
                          </div>
                        )}
                      </div>
                      <Badge className={`text-[10px] px-2 py-1 border ${statusChip[col.id] || "bg-gray-100 text-gray-700"}`}>
                        {col.id}
                      </Badge>
                    </div>
                    {/* Action buttons only shown outside the applied column */}
                    {col.id !== "applied" && (
                      <div className="mt-3 flex items-center gap-1 flex-wrap">
                        {prevStatus[col.id] && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-700"
                            onClick={() => handleBack(item.id, col.id)}
                            title={`Back to ${prevStatus[col.id]}`}
                          >
                            <ArrowLeft size={16} />
                          </Button>
                        )}
                        {nextStatus[col.id] && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-gray-700"
                            onClick={() => handleAdvance(item.id, col.id)}
                            title={`Move to ${nextStatus[col.id]}`}
                          >
                            <ArrowRight size={16} />
                          </Button>
                        )}
                        {col.id !== "rejected" && col.id !== "accepted" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => handleReject(item.id)}
                            title="Reject"
                          >
                            <X size={16} />
                          </Button>
                        )}
                        {col.id === "offer" && item.status !== "accepted" && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-emerald-700 border-emerald-200"
                            onClick={() => moveTo(item.id, "accepted")}
                            title="Mark Accepted"
                          >
                            <Check size={16} />
                          </Button>
                        )}
                      </div>
                    )}
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
