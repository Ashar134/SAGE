const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function fetchJson(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || res.statusText || "Request failed");
  }
  return data;
}

const toCamelApplicant = (row) => ({
  id: row.id || row.candidate_code,
  candidateCode: row.candidate_code,
  name: row.name,
  department: row.department,
  role: row.role,
  email: row.email,
  status: row.status,
  appliedDate: row.applied_date,
  education: row.education,
  skills: row.skills || [],
  testScore: row.test_score,
  interviewScore: row.interview_score,
  matchScore: row.match_score,
  videoUrl: row.video_url,
  resumeUrl: row.resume_url,
  rejectionReason: row.rejection_reason,
  jobId: row.job_id,
});

const toCamelJob = (row) => ({
  id: row.id,
  title: row.title,
  department: row.department,
  type: row.type,
  location: row.location,
  deadline: row.deadline,
  salary: row.salary,
  description: row.description,
  requirements: row.requirements,
  createdAt: row.created_at,
});

export async function fetchApplicants({ startDate, endDate } = {}) {
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  const data = await fetchJson(`/api/hr/applicants/${params.toString() ? `?${params.toString()}` : ""}`);
  return (data.applicants || []).map(toCamelApplicant);
}

export async function fetchJobs() {
  const data = await fetchJson("/api/hr/jobs/");
  return (data.jobs || []).map(toCamelJob);
}

export async function createJob(payload) {
  const data = await fetchJson("/api/hr/jobs/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return toCamelJob(data.job);
}

export async function deleteJob(jobId) {
  await fetchJson(`/api/hr/jobs/${jobId}/`, { method: "DELETE" });
  return true;
}

export async function fetchJobApplicants(jobId) {
  if (!jobId) return [];
  const data = await fetchJson(`/api/hr/jobs/${jobId}/applicants/`);
  return (data.applicants || []).map(toCamelApplicant);
}

export async function updateApplicantStatus(id, status, { rejectionReason = null } = {}) {
  const data = await fetchJson(`/api/hr/applicants/${id}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejection_reason: rejectionReason }),
  });
  return toCamelApplicant(data.applicant);
}

export async function checkApiConnection() {
  // simple health check
  await fetchJson("/api/hr/jobs/");
  return { status: "ok" };
}
