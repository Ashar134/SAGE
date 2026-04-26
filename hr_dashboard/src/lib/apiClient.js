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
  // ── Interview fields ──────────────────────────────────────────────────
  interviewScore: row.interview_score,
  confidenceScore: row.confidence_score,
  interviewCompletedAt: row.interview_completed_at,
  interviewTranscript: row.interview_transcript || [],
  interviewRecordingUrl: row.interview_recording_url,
  // ── Score breakdown ───────────────────────────────────────────────────
  skillScore: row.skill_score,      // 10% — skill vs JD overlap (0-100)
  matchScore: row.match_score,      // weighted final score (0-100)
  // ─────────────────────────────────────────────────────────────────────
  videoUrl: row.interview_recording_url || row.video_url,
  resumeUrl: row.resume_url,
  rejectionReason: row.rejection_reason,
  jobId: row.job_id,
  companyLogo: row.company_logo || "/loop.png",
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
  companyLogo: row.company?.logo_url || "/loop.png",
});

export async function fetchApplicants({ startDate, endDate, jobTitle } = {}) {
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  if (jobTitle) params.append("job_title", jobTitle);
  const data = await fetchJson(`/api/hr/applicants/${params.toString() ? `?${params.toString()}` : ""}`);
  // Always returns the array for backward-compatibility with all pages
  return (data.applicants || []).map(toCamelApplicant);
}

export async function fetchApplicantsWithMeta({ startDate, endDate, jobTitle } = {}) {
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  if (jobTitle) params.append("job_title", jobTitle);
  const data = await fetchJson(`/api/hr/applicants/${params.toString() ? `?${params.toString()}` : ""}`);
  return {
    applicants: (data.applicants || []).map(toCamelApplicant),
    jobTitles: data.job_titles || [],
  };
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

export async function getCompanyInfo() {
  return await fetchJson("/api/hr/company/");
}

export async function updateCompanyLogo(logo) {
  if (logo instanceof File) {
    const formData = new FormData();
    formData.append("logo", logo);
    return await fetchJson("/api/hr/company/logo/", {
      method: "POST",
      body: formData,
      // Note: Don't set Content-Type header when using FormData; 
      // the browser will set it to multipart/form-data with a boundary.
      headers: {}, 
    });
  }
  return await fetchJson("/api/hr/company/logo/", {
    method: "POST",
    body: JSON.stringify({ logo_url: logo }),
  });
}

export async function checkApiConnection() {
  // simple health check
  await fetchJson("/api/hr/jobs/");
  return { status: "ok" };
}
