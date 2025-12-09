import { createClient } from "@supabase/supabase-js";

// Support both Vite and CRA-style prefixes, prefer Vite.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.REACT_APP_SUPABASE_ANON_KEY;

// Create a client only if env vars are present; otherwise surface a helpful error later.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export async function checkSupabaseConnection() {
  if (!supabase) {
    throw new Error("Supabase env vars are missing");
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  return {
    status: "ok",
    session: data.session ? "session found" : "no session",
  };
}

const baseApplicantColumns = [
  "id",
  "candidate_code",
  "name",
  "department",
  "role",
  "email",
  "status",
  "applied_date",
  "education",
  "skills",
  "test_score",
  "interview_score",
  "match_score",
  "video_url",
  "rejection_reason",
  "job_id",
];

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
  rejectionReason: row.rejection_reason,
  jobId: row.job_id,
});

export async function fetchApplicants({ startDate, endDate } = {}) {
  if (!supabase) {
    throw new Error("Supabase env vars are missing");
  }

  let query = supabase
    .from("applicants")
    .select(baseApplicantColumns.join(","))
    .order("applied_date", { ascending: false });

  if (startDate) {
    query = query.gte("applied_date", startDate);
  }
  if (endDate) {
    query = query.lte("applied_date", endDate);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(toCamelApplicant);
}

const baseJobColumns = [
  "id",
  "title",
  "department",
  "type",
  "location",
  "deadline",
  "salary",
  "description",
  "requirements",
  "created_at",
];

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

export async function fetchJobs() {
  if (!supabase) {
    throw new Error("Supabase env vars are missing");
  }
  const { data, error } = await supabase
    .from("jobs")
    .select(baseJobColumns.join(","))
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(toCamelJob);
}

export async function createJob(payload) {
  if (!supabase) {
    throw new Error("Supabase env vars are missing");
  }
  const insertPayload = {
    title: payload.title,
    department: payload.department,
    type: payload.type,
    location: payload.location,
    deadline: payload.deadline || null,
    salary: payload.salary || null,
    description: payload.description,
    requirements: payload.requirements || "",
  };
  const { data, error } = await supabase
    .from("jobs")
    .insert([insertPayload])
    .select(baseJobColumns.join(","))
    .single();
  if (error) throw new Error(error.message);
  return toCamelJob(data);
}

export async function deleteJob(jobId) {
  if (!supabase) {
    throw new Error("Supabase env vars are missing");
  }
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) throw new Error(error.message);
  return true;
}

export async function fetchJobApplicants(jobId) {
  if (!supabase) {
    throw new Error("Supabase env vars are missing");
  }
  if (!jobId) return [];
  const { data, error } = await supabase
    .from("applicants")
    .select(baseApplicantColumns.join(","))
    .eq("job_id", jobId)
    .order("applied_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(toCamelApplicant);
}

export async function updateApplicantStatus(id, status, { rejectionReason = null } = {}) {
  if (!supabase) {
    throw new Error("Supabase env vars are missing");
  }

  const payload = {
    status,
    rejection_reason: rejectionReason,
  };

  // Try to update by UUID id first; if no row returned, try candidate_code.
  const selectCols = baseApplicantColumns.join(",");
  const attemptUpdate = async (column) => {
    const { data, error } = await supabase
      .from("applicants")
      .update(payload)
      .eq(column, id)
      .select(selectCols)
      .maybeSingle();
    if (error) throw error;
    return data;
  };

  let data = await attemptUpdate("id");
  if (!data) {
    data = await attemptUpdate("candidate_code");
  }

  if (!data) {
    throw new Error("No applicant found to update (check RLS/policies and IDs)");
  }

  return toCamelApplicant(data);
}
