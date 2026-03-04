import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Plus, EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  fetchApplicants,
  updateApplicantStatus,
} from "../lib/apiClient";

const visibleColumns = [
  { id: "applied", title: "Applied" },
  { id: "assessment", title: "Assessment" },
  { id: "interview", title: "Interview" },
  { id: "offer", title: "Offer" },
];

const hiddenBuckets = ["hired", "rejected"];

const statusToColumn = {
  Applied: "applied",
  "Interview Scheduled": "interview",
  Shortlisted: "assessment",
  Offer: "offer",
  Hired: "hired",
  Rejected: "rejected",
};

const rejectionReasons = [
  "Not a fit",
  "Failed assessment",
  "Failed interview",
  "Withdrew",
  "Other",
];

const columnThemes = {
  applied: { border: "border-blue-200", chip: "bg-blue-50 text-blue-700", ring: "focus:ring-blue-100" },
  assessment: { border: "border-amber-200", chip: "bg-amber-50 text-amber-700", ring: "focus:ring-amber-100" },
  interview: { border: "border-indigo-200", chip: "bg-indigo-50 text-indigo-700", ring: "focus:ring-indigo-100" },
  offer: { border: "border-emerald-200", chip: "bg-emerald-50 text-emerald-700", ring: "focus:ring-emerald-100" },
};

function KanbanCard({ item, onReject }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.id);
      }}
      className="rounded-xl border border-gray-200 bg-white/90 p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-gray-900">{item.name}</div>
          <div className="text-xs text-gray-500">{item.role}</div>
          <div className="mt-2 text-xs text-gray-500">{item.department}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full p-1 hover:bg-gray-100">
            <EllipsisVertical size={14} className="text-gray-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs">Update</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {rejectionReasons.map((reason) => (
              <DropdownMenuItem
                key={reason}
                onSelect={() => onReject?.(item.id, reason)}
                className="text-sm"
              >
                Move to Rejected · {reason}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Badge className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100">
          {item.status || "Applied"}
        </Badge>
      </div>
    </div>
  );
}

export default function Kanban() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const board = useMemo(() => {
    const byCol = [...visibleColumns, ...hiddenBuckets.map((id) => ({ id }))].reduce(
      (acc, col) => ({ ...acc, [col.id]: [] }),
      {}
    );
    applicants.forEach((app) => {
      const col = statusToColumn[app.status] || "applied";
      byCol[col].push(app);
    });
    return byCol;
  }, [applicants]);

  const remainingApplicants = useMemo(() => {
    // Applicants whose status is not mapped get offered to add into "applied"
    return applicants.filter((a) => !statusToColumn[a.status]);
  }, [applicants]);

  useEffect(() => {
    setLoading(true);
    fetchApplicants()
      .then((rows) => {
        setApplicants(rows);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Unable to load applicants");
      })
      .finally(() => setLoading(false));
  }, []);

  const moveCandidate = async (id, targetCol, extra = {}) => {
    const status = colIdToStatus(targetCol);
    const previous = applicants.find((a) => a.id === id);

    setApplicants((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, ...extra } : item
      )
    );
    try {
      await updateApplicantStatus(id, status, {
        rejectionReason: extra.rejectionReason || null,
      });
      setError("");
    } catch (err) {
      setError(err.message || "Failed to update status");
      if (previous) {
        setApplicants((prev) =>
          prev.map((item) => (item.id === id ? previous : item))
        );
      }
    }
  };

  const handleDrop = (colId, e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    moveCandidate(id, colId, { status: colIdToStatus(colId) });
  };

  const colIdToStatus = (colId) => {
    switch (colId) {
      case "assessment":
        return "Shortlisted";
      case "interview":
        return "Interview Scheduled";
      case "offer":
        return "Offer";
      case "hired":
        return "Hired";
      case "rejected":
        return "Rejected";
      default:
        return "Applied";
    }
  };

  const handleAdd = () => {
    const item = remainingApplicants.find((a) => a.id === selectedId);
    if (!item) return;
    moveCandidate(item.id, "applied", { status: "Applied" });
    setSelectedId("");
  };

  const handleDragOver = (e) => e.preventDefault();

  const hiredCount = board.hired?.length || 0;
  const rejectedCount = board.rejected?.length || 0;

  return (
      <div className="space-y-6 w-full max-w-[1600px] mx-auto">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Pipeline</p>
            <h1 className="text-2xl font-semibold text-gray-900">Candidate Kanban</h1>
            <p className="text-sm text-gray-500">Drag candidates across stages to update status.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-56 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Add applicant to board</option>
              {remainingApplicants.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name} — {app.role}
                </option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={!selectedId}
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 text-sm font-semibold disabled:opacity-50 shadow-sm"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleColumns.map((col) => (
              <Card
                key={col.id}
                className={`bg-gradient-to-b from-white to-gray-50 border ${columnThemes[col.id]?.border || "border-gray-200"} shadow-sm`}
              >
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <div>
                    <CardTitle className="text-sm font-semibold text-gray-900">
                      {col.title}
                    </CardTitle>
                    <p className="text-xs text-gray-500">Drag candidates here</p>
                  </div>
                  <Badge className="bg-white text-gray-700 border">
                    {board[col.id]?.length || 0}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(col.id, e)}
                    className="min-h-[180px] space-y-3 rounded-xl border border-dashed border-gray-200 bg-white/70 p-3"
                  >
                    {board[col.id]?.length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-8">
                        Drag here to add
                      </div>
                    )}
                    {board[col.id]?.map((item) => (
                      <KanbanCard
                        key={item.id}
                        item={item}
                        onReject={(id, reason) =>
                          moveCandidate(id, "rejected", {
                            status: "Rejected",
                            rejectionReason: reason,
                          })
                        }
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900">Hired</CardTitle>
                <p className="text-xs text-gray-500">Completed hires</p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100">
                {hiredCount}
              </Badge>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              {hiredCount === 0 ? "No hires yet." : `${hiredCount} candidate(s) hired.`}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900">Rejected</CardTitle>
                <p className="text-xs text-gray-500">Tracked separately</p>
              </div>
              <Badge className="bg-red-50 text-red-700 border border-red-100">{rejectedCount}</Badge>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              {rejectedCount === 0 ? (
                "No rejections yet."
              ) : (
                <ul className="list-disc pl-4 space-y-1">
                  {board.rejected?.map((item) => (
                    <li key={item.id}>
                      {item.name} · {item.rejectionReason || "Rejected"}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
