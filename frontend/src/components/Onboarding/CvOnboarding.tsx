import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CvOnboarding.css";

interface ParsedCvResponse {
  name?: string;
  contact?: { emails?: string[]; phones?: string[] };
  location?: { city?: string | null; country?: string | null };
  summary?: string;
  skills?: string[];
  experience?: { title?: string; organization?: string; period?: string; details?: string }[];
  education?: { degree?: string; institution?: string; year?: string; details?: string }[];
}

export type ProfileDraft = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  domain?: string;
  summary?: string;
  skillsText?: string;
  experienceText?: string;
  educationText?: string;
};

const API_BASE_URL = "http://localhost:8000";

const CvOnboarding = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft | null>(null);
  const hasDraft = !!profileDraft;

  const handleFile = (incoming: File | null) => {
    if (!incoming) return;
    if (incoming.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setError(null);
    setFile(incoming);
    setSuccessMessage(null);
    setProfileDraft(null);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const incoming = e.dataTransfer.files?.[0];
    handleFile(incoming || null);
  };

  const onUpload = async () => {
    if (!file) {
      setError("Select a PDF resume first.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/parse-cv/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to parse CV");
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to parse CV");
      }

      const parsed: ParsedCvResponse = result.data || {};
      const draft = mapParsedToProfile(parsed);
      setProfileDraft(draft);
      setSuccessMessage("CV parsed! Review and confirm your details below.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CV.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = () => {
    if (!profileDraft) {
      setError("Please parse your CV first.");
      return;
    }
    localStorage.setItem("profileData", JSON.stringify(profileDraft));
    sessionStorage.setItem("cvSessionCompleted", "true");
    navigate("/app/profile");
  };

  const headerSubtitle = useMemo(() => {
    if (profileDraft) return "Edit any field before saving";
    if (loading) return "Parsing your CV...";
    return "Upload your resume to autofill your profile";
  }, [loading, profileDraft]);

  return (
    <div className="cv-onboarding-page">
      <div className="cv-onboarding-card">
        <div className="cv-onboarding-header">
          <div>
            <p className="eyebrow">Step 1 · Profile Setup</p>
            <h1>Upload your CV</h1>
            <p className="subtitle">{headerSubtitle}</p>
          </div>
          <button className="ghost-btn" onClick={() => navigate("/app")}>Skip for now</button>
        </div>

        <div className={`cv-grid ${hasDraft ? "" : "single"}`}>
          <div
            className={`dropzone ${dragActive ? "drag-active" : ""}`}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDrop={onDrop}
          >
            <div className="dropzone-inner">
              <div className="icon-circle">📄</div>
              <p className="drop-title">Drag & drop your PDF here</p>
              <p className="drop-subtitle">or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
                className="hidden-input"
              />
              {file && <p className="file-name">Selected: {file.name}</p>}
              <div className="drop-actions">
                <button
                  className="secondary-btn"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  Browse PDF
                </button>
                <button className="primary-btn" onClick={onUpload} disabled={loading || !file}>
                  {loading ? "Parsing..." : "Submit"}
                </button>
                <button
                  className="ghost-btn"
                  onClick={() => {
                    handleFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    setSuccessMessage(null);
                    setError(null);
                  }}
                  disabled={loading}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="parse-output loader">
              <div className="spinner" />
              <div>
                <h3>Extracting your CV…</h3>
                <p>Hang tight while we read and structure your resume.</p>
              </div>
            </div>
          )}

          {hasDraft && !loading && (
            <div className="parse-output">
              <div className="panel-header">
                <h3>Preview & Edit</h3>
                <p>We prefill from your CV; adjust anything before saving.</p>
              </div>

              {error && <div className="alert error">{error}</div>}
              {successMessage && <div className="alert success">{successMessage}</div>}

              <div className="form-grid">
                <label>
                  <span>Full Name</span>
                  <input
                    type="text"
                    value={profileDraft?.fullName || ""}
                    onChange={(e) => profileDraft && setProfileDraft({ ...profileDraft, fullName: e.target.value })}
                    placeholder="Your name"
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={profileDraft?.email || ""}
                    onChange={(e) => profileDraft && setProfileDraft({ ...profileDraft, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </label>
                <label>
                  <span>Phone</span>
                  <input
                    type="text"
                    value={profileDraft?.phone || ""}
                    onChange={(e) => profileDraft && setProfileDraft({ ...profileDraft, phone: e.target.value })}
                    placeholder="Contact number"
                  />
                </label>
                <label>
                  <span>Location</span>
                  <input
                    type="text"
                    value={profileDraft?.location || ""}
                    onChange={(e) => profileDraft && setProfileDraft({ ...profileDraft, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </label>
                <label>
                  <span>Domain / Headline</span>
                  <input
                    type="text"
                    value={profileDraft?.domain || ""}
                    onChange={(e) => profileDraft && setProfileDraft({ ...profileDraft, domain: e.target.value })}
                    placeholder="e.g., Software Engineer"
                  />
                </label>
                <label className="full-row">
                  <span>Summary</span>
                  <textarea
                    rows={3}
                    value={profileDraft?.summary || ""}
                    onChange={(e) => profileDraft && setProfileDraft({ ...profileDraft, summary: e.target.value })}
                    placeholder="Short professional summary"
                  />
                </label>
                <label className="full-row">
                  <span>Experience</span>
                  <textarea
                    rows={3}
                    value={profileDraft?.experienceText || ""}
                    onChange={(e) => profileDraft && setProfileDraft({ ...profileDraft, experienceText: e.target.value })}
                    placeholder="Title · Organization · Period"
                  />
                </label>
                <label className="full-row">
                  <span>Skills (comma separated)</span>
                  <textarea
                    rows={2}
                    value={profileDraft?.skillsText || ""}
                    onChange={(e) => profileDraft && setProfileDraft({ ...profileDraft, skillsText: e.target.value })}
                    placeholder="react, python, sql"
                  />
                </label>
                <label className="full-row">
                  <span>Education</span>
                  <textarea
                    rows={3}
                    value={profileDraft?.educationText || ""}
                    onChange={(e) => profileDraft && setProfileDraft({ ...profileDraft, educationText: e.target.value })}
                    placeholder="Degree, institution, years"
                  />
                </label>
              </div>

              <div className="actions-row">
                <button className="primary-btn" onClick={onSubmit} disabled={!profileDraft || loading}>
                  Submit
                </button>
                <button className="ghost-btn" onClick={() => navigate("/app")}>Skip</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function mapParsedToProfile(parsed: ParsedCvResponse): ProfileDraft {
  const email = parsed.contact?.emails?.[0] || "";
  const phone = parsed.contact?.phones?.[0] || "";
  const city = parsed.location?.city || "";
  const country = parsed.location?.country || "";
  const location = [city, country].filter(Boolean).join(", ");
  const skills = parsed.skills || [];
  const educationLines = (parsed.education || []).map((edu) =>
    [edu.degree, edu.institution, edu.year, edu.details].filter(Boolean).join(" · ")
  );
  const experienceLines = (parsed.experience || []).map((exp) =>
    [exp.title, exp.organization, exp.period, exp.details].filter(Boolean).join(" · ")
  );

  return {
    fullName: parsed.name || "",
    email,
    phone,
    location,
    domain: "",
    summary: parsed.summary || "",
    skillsText: skills.join(", "),
    experienceText: experienceLines.join("\n"),
    educationText: educationLines.join("\n"),
  };
}

export default CvOnboarding;
