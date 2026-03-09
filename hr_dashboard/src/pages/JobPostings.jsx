import { useEffect, useMemo, useState, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { CalendarRange, ClipboardList, Sparkles } from "lucide-react";
import {
  fetchJobs,
  createJob,
  deleteJob,
  fetchJobApplicants,
} from "../lib/apiClient";

const defaultForm = {
  title: "",
  department: "",
  type: "Full-time",
  location: "",
  deadline: "",
  description: "",
  requirements: "",
  test_no_of_questions: "100",
  test_time_allowed: "60",
  test_deadline_days: "3",
};

const jobTypes = ["Full-time", "Part-time", "Contract", "Visiting"];

export default function JobPostings() {
  const [form, setForm] = useState(defaultForm);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicantsByJob, setApplicantsByJob] = useState({});

  const isValid = useMemo(() => {
    return (
      form.title.trim() &&
      form.department.trim() &&
      form.location.trim() &&
      form.deadline.trim() &&
      form.description.trim()
    );
  }, [form]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  useEffect(() => {
    fetchJobs()
      .then((rows) => {
        setJobs(rows);
        setError("");
        if (!rows.length) {
          setInfo("No jobs yet. Publish a role to see it here.");
        }
      })
      .catch((err) => {
        setError(err.message || "Unable to load jobs from the API.");
        setInfo("API unavailable. Jobs will not be stored until the backend is reachable.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setError("Please fill all required fields.");
      return;
    }
    setError("");
    setInfo("");
    setSaving(true);
    try {
      const created = await createJob(form);
      setJobs((prev) => [created, ...prev]);
      setForm(defaultForm);
      setInfo("Job published to the backend.");
    } catch (err) {
      setError(err.message || "Failed to publish job.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setInfo("");
    setError("");
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((job) => job.id !== id));
      setInfo("Job deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete job.");
    }
  };

  const loadApplicantsForJob = async (jobId) => {
    setApplicantsByJob((prev) => ({
      ...prev,
      [jobId]: { ...(prev[jobId] || {}), loading: true, error: "" },
    }));
    try {
      const rows = await fetchJobApplicants(jobId);
      setApplicantsByJob((prev) => ({
        ...prev,
        [jobId]: { loading: false, error: "", items: rows },
      }));
    } catch (err) {
      setApplicantsByJob((prev) => ({
        ...prev,
        [jobId]: {
          loading: false,
          error: err.message || "Unable to load applicants for this job.",
          items: [],
        },
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Jobs</p>
          <h1 className="text-2xl font-semibold text-gray-900">Post a new role</h1>
          <p className="text-sm text-gray-500">Collect required info for HR, faculty heads, and candidates.</p>
        </div>
        <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100">
          {jobs.length || 0} posting{jobs.length === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Job details</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 text-blue-700 px-3 py-2 text-sm">
                {info}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Title *</label>
                  <Input
                    value={form.title}
                    onChange={handleChange("title")}
                    placeholder="Assistant Professor - Computer Science"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Department *</label>
                  <Input
                    value={form.department}
                    onChange={handleChange("department")}
                    placeholder="Computer Science"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Employment type</label>
                  <select
                    value={form.type}
                    onChange={handleChange("type")}
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    {jobTypes.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Location *</label>
                  <Input
                    value={form.location}
                    onChange={handleChange("location")}
                    placeholder="Lahore Campus · Hybrid"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Application deadline *</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={form.deadline}
                      onChange={handleChange("deadline")}
                    />
                    <CalendarRange className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Role summary *</label>
                <textarea
                  value={form.description}
                  onChange={handleChange("description")}
                  rows={3}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="What teaching, research, and service responsibilities are expected?"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Key requirements (comma-separated)</label>
                <textarea
                  value={form.requirements}
                  onChange={handleChange("requirements")}
                  rows={2}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="PhD in subject, 2+ published papers, teaching demo required"
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Test Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">No. of Questions *</label>
                    <Input
                      type="number"
                      min="1"
                      value={form.test_no_of_questions}
                      onChange={handleChange("test_no_of_questions")}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Time Allowed (mins) *</label>
                    <Input
                      type="number"
                      min="1"
                      value={form.test_time_allowed}
                      onChange={handleChange("test_time_allowed")}
                      placeholder="60"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Deadline (Days) *</label>
                    <Input
                      type="number"
                      min="1"
                      value={form.test_deadline_days}
                      onChange={handleChange("test_deadline_days")}
                      placeholder="3"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setForm(defaultForm)}>
                  Reset
                </Button>
                <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60">
                  {saving ? "Publishing..." : "Publish job"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-indigo-50 bg-gradient-to-b from-white to-indigo-50/40">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Posting tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 mt-0.5" />
              <div>
                <div className="font-semibold text-gray-900">Be explicit</div>
                <p className="text-xs text-gray-500">List teaching load, research expectations, and tenure/contract terms.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ClipboardList className="h-4 w-4 text-indigo-600 mt-0.5" />
              <div>
                <div className="font-semibold text-gray-900">Must-have vs nice-to-have</div>
                <p className="text-xs text-gray-500">Separate critical requirements from preferences to widen the funnel.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CalendarRange className="h-4 w-4 text-indigo-600 mt-0.5" />
              <div>
                <div className="font-semibold text-gray-900">SLA for responses</div>
                <p className="text-xs text-gray-500">Commit to an application review timeline and publish it.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div >

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Recent postings</CardTitle>
            <p className="text-sm text-gray-500">Stored in the Django/MySQL backend. View applicants per job.</p>
          </div>
          <Badge className="bg-white text-gray-700 border">{jobs.length || 0} saved</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60">
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => {
                const applicantsState = applicantsByJob[job.id] || {};
                const hasApplicants = Array.isArray(applicantsState.items);
                return (
                  <Fragment key={job.id}>
                    <TableRow key={job.id} className="hover:bg-gray-50/80">
                      <TableCell className="font-medium text-gray-900">
                        <div>{job.title}</div>
                        <div className="text-xs text-gray-400">
                          Posted {job.createdAt || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">{job.department}</TableCell>
                      <TableCell className="text-gray-700">{job.type}</TableCell>
                      <TableCell className="text-gray-700">{job.location}</TableCell>
                      <TableCell className="text-gray-700">
                        {job.deadline || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-gray-700"
                            onClick={() => loadApplicantsForJob(job.id)}
                          >
                            View applicants
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(job.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {hasApplicants && (
                      <TableRow key={`${job.id}-applicants`}>
                        <TableCell colSpan={7} className="bg-gray-50">
                          {applicantsState.loading && (
                            <p className="text-sm text-gray-500">Loading applicants...</p>
                          )}
                          {applicantsState.error && (
                            <p className="text-sm text-red-600">{applicantsState.error}</p>
                          )}
                          {!applicantsState.loading && applicantsState.items?.length === 0 && (
                            <p className="text-sm text-gray-500">No applicants yet for this job.</p>
                          )}
                          {applicantsState.items?.length > 0 && (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-700">
                              {applicantsState.items.map((app) => (
                                <div key={app.id} className="rounded-md border border-gray-200 bg-white p-3">
                                  <div className="font-semibold text-gray-900">{app.name}</div>
                                  <p className="text-xs text-gray-500">{app.email}</p>
                                  <p className="text-xs text-gray-500">
                                    {app.role} · {app.department}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Status: {app.status || "Applied"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
          {loading && (
            <p className="text-sm text-gray-500 mt-3">Loading jobs...</p>
          )}
          {!loading && jobs.length === 0 && (
            <p className="text-sm text-gray-500 mt-3">
              No postings yet. Publish a role to see it here.
            </p>
          )}
        </CardContent>
      </Card>
    </div >
  );
}
