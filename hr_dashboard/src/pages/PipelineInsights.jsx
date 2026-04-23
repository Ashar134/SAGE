import { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Filter } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { fetchApplicants } from "../lib/apiClient";

const stageOrder = ["applied", "reviewing", "interview", "test", "offer", "accepted"];

const normalizeStatus = (s = "") => s.toLowerCase();

export default function PipelineInsights() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setError(err.message || "Unable to load applicants");
      })
      .finally(() => setLoading(false));
  }, []);

  const groupedByRole = useMemo(() => {
    const map = new Map();
    applicants.forEach((a) => {
      const key = a.role || "Unspecified role";
      const list = map.get(key) || [];
      map.set(key, [...list, a]);
    });
    return map;
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    if (roleFilter === "all") return applicants;
    return applicants.filter((a) => (a.role || "Unspecified role") === roleFilter);
  }, [applicants, roleFilter]);

  const funnel = useMemo(() => {
    const counts = {
      applied: 0,
      reviewing: 0,
      interview: 0,
      test: 0,
      offer: 0,
      accepted: 0,
      rejected: 0,
    };
    filteredApplicants.forEach((a) => {
      const s = normalizeStatus(a.status);
      if (counts[s] !== undefined) counts[s] += 1;
    });
    return counts;
  }, [filteredApplicants]);

  const conversion = useMemo(() => {
    const safeRate = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);
    const applied = funnel.applied || filteredApplicants.length;
    return {
      toInterview: safeRate(funnel.interview, applied),
      toOffer: safeRate(funnel.offer, applied),
      toAccept: safeRate(funnel.accepted, applied),
    };
  }, [funnel, filteredApplicants.length]);

  const roleRows = useMemo(() => {
    return Array.from(groupedByRole.entries()).map(([role, list]) => {
      const counts = { applied: 0, interview: 0, offer: 0, accepted: 0 };
      list.forEach((a) => {
        const s = normalizeStatus(a.status);
        if (counts[s] !== undefined) counts[s] += 1;
      });
      return {
        role,
        total: list.length,
        interview: counts.interview,
        offer: counts.offer,
        accepted: counts.accepted,
      };
    });
  }, [groupedByRole]);

  const stats = [
    {
      id: 1,
      title: "Total candidates",
      value: filteredApplicants.length,
      subtitle: "Across current pipeline",
      trend: `${funnel.rejected} rejected`,
      trendType: "down",
    },
    {
      id: 2,
      title: "Interview rate",
      value: `${conversion.toInterview}%`,
      subtitle: "Applied → Interview",
      trend: `${funnel.interview} in interview`,
      trendType: "up",
    },
    {
      id: 3,
      title: "Offer rate",
      value: `${conversion.toOffer}%`,
      subtitle: "Applied → Offer",
      trend: `${funnel.offer} offers out`,
      trendType: "up",
    },
    {
      id: 4,
      title: "Accept rate",
      value: `${conversion.toAccept}%`,
      subtitle: "Applied → Accepted",
      trend: `${funnel.accepted} accepted`,
      trendType: "up",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pipeline Insights</h1>
          <p className="text-sm text-gray-500">
            Conversion through each stage across all roles.
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
            {Array.from(groupedByRole.keys()).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      {loading && (
        <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-700 px-3 py-2 text-sm">
          Loading applicants...
        </div>
      )}
      {!loading && error && (
        <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Stage distribution</CardTitle>
              <p className="text-sm text-gray-500">Counts per pipeline stage.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {stageOrder.map((stage) => (
                <div key={stage} className="rounded-lg border px-3 py-3 bg-white">
                  <div className="text-xs uppercase text-gray-500">{stage}</div>
                  <div className="text-xl font-semibold text-gray-900">{funnel[stage] || 0}</div>
                </div>
              ))}
              <div className="rounded-lg border px-3 py-3 bg-white">
                <div className="text-xs uppercase text-gray-500">Rejected</div>
                <div className="text-xl font-semibold text-gray-900">{funnel.rejected || 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Roles overview</CardTitle>
              <p className="text-sm text-gray-500">Progress by role.</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/60">
                    <TableHead>Role</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Interview</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Accepted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roleRows.map((row) => (
                    <TableRow key={row.role}>
                      <TableCell className="font-medium text-gray-900">{row.role}</TableCell>
                      <TableCell>{row.total}</TableCell>
                      <TableCell>{row.interview}</TableCell>
                      <TableCell>{row.offer}</TableCell>
                      <TableCell>{row.accepted}</TableCell>
                    </TableRow>
                  ))}
                  {!roleRows.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-gray-500 py-4">
                        No applicants yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
