import { useRef, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../MainLayout/Header/Header";
import {
  INPUT_LIMITS,
  validateTextInput,
  validateEmail,
  validatePhone,
  validateURL,
  removeDangerousPatterns,
  sanitizeProfileData
} from "../../utils/inputSecurity";
import "./CvOnboarding.css";

interface ParsedCvResponse {
  name?: string;
  contact?: { emails?: string[]; phones?: string[] };
  location?: { city?: string | null; country?: string | null };
  summary?: string;
  skills?: string[];
  experience?: { title?: string; organization?: string; period?: string; details?: string }[];
  education?: { degree?: string; institution?: string; year?: string; details?: string }[];
  certificates?: { name?: string; issuer?: string; year?: string }[];
  research?: { title?: string; organization?: string; period?: string; details?: string }[];
  projects?: { title?: string; organization?: string; period?: string; details?: string }[];
}

interface ExperienceItem {
  title: string;
  organization: string;
  period: string;
  details: string;
}

interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  details: string;
}

interface CertificateItem {
  name: string;
  issuer: string;
  year: string;
  link?: string;
}

interface ResearchItem {
  title: string;
  organization: string;
  period: string;
  details: string;
}

interface ProjectItem {
  title: string;
  organization: string;
  period: string;
  details: string;
}

export type ProfileDraft = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  domain?: string;
  summary?: string;
  skillsText?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  certificates: CertificateItem[];
  research: ResearchItem[];
  projects: ProjectItem[];
  experienceText?: string;
  educationText?: string;
};

const API_BASE_URL = "http://localhost:8000";

const CvOnboarding = () => {
  const navigate = useNavigate();
  const { accessToken, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft | null>(() => {
    const saved = localStorage.getItem("onboardingDraft");
    return saved ? JSON.parse(saved) : null;
  });
  const hasDraft = !!profileDraft;

  // Persist draft to localStorage
  useEffect(() => {
    if (profileDraft) {
      localStorage.setItem("onboardingDraft", JSON.stringify(profileDraft));
    }
  }, [profileDraft]);

  const [activeTab, setActiveTab] = useState<'basics' | 'experience' | 'education' | 'skills' | 'certificates' | 'research' | 'projects' | 'review'>('basics');

  const tabs = [
    { id: 'basics', label: 'Basics' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'research', label: 'Research' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'review', label: 'Review & Submit' },
  ] as const;

  const goNext = () => {
    const idx = tabs.findIndex(t => t.id === activeTab);
    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
  };

  const goBack = () => {
    const idx = tabs.findIndex(t => t.id === activeTab);
    if (idx > 0) setActiveTab(tabs[idx - 1].id);
  };

  // ============================================================================
  // Secure Input Handling
  // ============================================================================

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Securely updates a text field with validation and sanitization
   */
  const handleSecureTextInput = (
    fieldName: string,
    value: string,
    limitKey: keyof typeof INPUT_LIMITS,
    options: { required?: boolean } = {}
  ) => {
    if (!profileDraft) return;

    // Validate and sanitize
    const result = validateTextInput(value, limitKey, options);

    // Update validation errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (!result.isValid && result.error) {
        newErrors[fieldName] = result.error;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });

    // Update profile with sanitized value (allow typing, but truncate at max)
    const sanitizedValue = removeDangerousPatterns(value).substring(0, INPUT_LIMITS[limitKey].max);
    setProfileDraft({ ...profileDraft, [fieldName]: sanitizedValue });
  };

  /**
   * Securely updates email field
   */
  const handleSecureEmailInput = (value: string) => {
    if (!profileDraft) return;

    const result = validateEmail(value);

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (!result.isValid && result.error && value.length > 0) {
        newErrors.email = result.error;
      } else {
        delete newErrors.email;
      }
      return newErrors;
    });

    const sanitizedValue = removeDangerousPatterns(value).substring(0, INPUT_LIMITS.email.max);
    setProfileDraft({ ...profileDraft, email: sanitizedValue });
  };

  /**
   * Securely updates phone field
   */
  const handleSecurePhoneInput = (value: string) => {
    if (!profileDraft) return;

    const result = validatePhone(value);

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (!result.isValid && result.error) {
        newErrors.phone = result.error;
      } else {
        delete newErrors.phone;
      }
      return newErrors;
    });

    setProfileDraft({ ...profileDraft, phone: result.sanitizedValue });
  };

  /**
   * Securely updates URL field (Available for future LinkedIn/Portfolio fields)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSecureURLInput = (
    fieldName: 'linkedIn' | 'portfolio',
    value: string
  ) => {
    if (!profileDraft) return;

    const result = validateURL(value, fieldName);

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (!result.isValid && result.error && value.length > 0) {
        newErrors[fieldName] = result.error;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });

    const sanitizedValue = removeDangerousPatterns(value).substring(0, INPUT_LIMITS[fieldName].max);
    setProfileDraft({ ...profileDraft, [fieldName]: sanitizedValue });
  };

  /**
   * Validates entire profile before submission (Available for form validation)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validateProfileBeforeSubmit = (): boolean => {
    if (!profileDraft) return false;

    const result = sanitizeProfileData(profileDraft as Record<string, unknown>);

    if (!result.isValid) {
      setValidationErrors(result.errors);
      return false;
    }

    return true;
  };


  const handleFile = (incoming: File | null) => {
    if (!incoming) return;
    if (incoming.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setError(null);
    setFile(incoming);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CV.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    if (!profileDraft) {
      setError("Please parse your CV first.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/onboarding/complete/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(profileDraft)
      });

      const data = await response.json();

      if (data.success) {
        // Update local user state with the new user object (which has is_onboarded=true)
        if (accessToken) {
          login(data.user, accessToken);
        }

        localStorage.setItem("profileData", JSON.stringify(profileDraft));
        localStorage.removeItem("onboardingDraft"); // Clear draft
        sessionStorage.setItem("cvSessionCompleted", "true");
        navigate("/"); // Redirect to Homepage
      } else {
        setError(data.error || "Failed to save profile.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const headerSubtitle = useMemo(() => {
    if (profileDraft) return "Please verify your details to ensure the best possible job matches for you";
    if (loading) return "Parsing your CV...";
    return "Upload your resume to autofill your profile";
  }, [loading, profileDraft]);

  const onSkip = async () => {
    setLoading(true);
    try {
      // Send empty profile just to mark is_onboarded = True
      const response = await fetch(`${API_BASE_URL}/api/users/onboarding/complete/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (data.success) {
        if (accessToken) {
          login(data.user, accessToken);
        }
        sessionStorage.setItem("cvSessionCompleted", "true");
        navigate("/");
      } else {
        setError("Failed to skip. Please try again.");
      }
    } catch (e) {
      console.error("Skip error:", e);
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  // Secure update for Experience items
  const updateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    if (!profileDraft) return;

    // Get appropriate limit based on field
    const limitMap: Record<keyof ExperienceItem, keyof typeof INPUT_LIMITS> = {
      title: 'jobTitle',
      organization: 'company',
      period: 'location', // Reuse location limit for period
      details: 'description'
    };

    // Sanitize and limit input
    const sanitized = removeDangerousPatterns(value).substring(0, INPUT_LIMITS[limitMap[field]].max);

    const newExp = [...profileDraft.experience];
    newExp[index] = { ...newExp[index], [field]: sanitized };
    setProfileDraft({ ...profileDraft, experience: newExp });
  };

  const addExperience = () => {
    if (!profileDraft) return;
    setProfileDraft({
      ...profileDraft,
      experience: [...profileDraft.experience, { title: "", organization: "", period: "", details: "" }]
    });
  };

  const removeExperience = (index: number) => {
    if (!profileDraft) return;
    const newExp = profileDraft.experience.filter((_, i) => i !== index);
    setProfileDraft({ ...profileDraft, experience: newExp });
  };

  // Secure update for Education items
  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    if (!profileDraft) return;

    // Get appropriate limit based on field
    const limitMap: Record<keyof EducationItem, keyof typeof INPUT_LIMITS> = {
      degree: 'degree',
      institution: 'institution',
      year: 'location', // Reuse location limit for year
      details: 'description'
    };

    // Sanitize and limit input
    const sanitized = removeDangerousPatterns(value).substring(0, INPUT_LIMITS[limitMap[field]].max);

    const newEdu = [...profileDraft.education];
    newEdu[index] = { ...newEdu[index], [field]: sanitized };
    setProfileDraft({ ...profileDraft, education: newEdu });
  };

  const addEducation = () => {
    if (!profileDraft) return;
    setProfileDraft({
      ...profileDraft,
      education: [...profileDraft.education, { degree: "", institution: "", year: "", details: "" }]
    });
  };

  const removeEducation = (index: number) => {
    if (!profileDraft) return;
    const newEdu = profileDraft.education.filter((_, i) => i !== index);
    setProfileDraft({ ...profileDraft, education: newEdu });
  };

  // Secure update for Certificate items
  const updateCertificate = (index: number, field: keyof CertificateItem, value: string) => {
    if (!profileDraft) return;

    // Get appropriate limit based on field
    const limitMap: Record<keyof CertificateItem, keyof typeof INPUT_LIMITS> = {
      name: 'certificateName',
      issuer: 'issuer',
      year: 'location',
      link: 'projectUrl'
    };

    // Sanitize and limit input
    const sanitized = removeDangerousPatterns(value).substring(0, INPUT_LIMITS[limitMap[field]].max);

    const newCert = [...profileDraft.certificates];
    newCert[index] = { ...newCert[index], [field]: sanitized };
    setProfileDraft({ ...profileDraft, certificates: newCert });
  };

  const addCertificate = () => {
    if (!profileDraft) return;
    setProfileDraft({
      ...profileDraft,
      certificates: [...profileDraft.certificates, { name: "", issuer: "", year: "" }]
    });
  };

  const removeCertificate = (index: number) => {
    if (!profileDraft) return;
    const newCert = profileDraft.certificates.filter((_, i) => i !== index);
    setProfileDraft({ ...profileDraft, certificates: newCert });
  };

  // Secure update for Research items
  const updateResearch = (index: number, field: keyof ResearchItem, value: string) => {
    if (!profileDraft) return;

    // Get appropriate limit based on field
    const limitMap: Record<keyof ResearchItem, keyof typeof INPUT_LIMITS> = {
      title: 'researchTitle',
      organization: 'company',
      period: 'location',
      details: 'researchDescription'
    };

    // Sanitize and limit input
    const sanitized = removeDangerousPatterns(value).substring(0, INPUT_LIMITS[limitMap[field]].max);

    const newRes = [...profileDraft.research];
    newRes[index] = { ...newRes[index], [field]: sanitized };
    setProfileDraft({ ...profileDraft, research: newRes });
  };

  const addResearch = () => {
    if (!profileDraft) return;
    setProfileDraft({
      ...profileDraft,
      research: [...profileDraft.research, { title: "", organization: "", period: "", details: "" }]
    });
  };

  const removeResearch = (index: number) => {
    if (!profileDraft) return;
    const newRes = profileDraft.research.filter((_, i) => i !== index);
    setProfileDraft({ ...profileDraft, research: newRes });
  };

  // Secure update for Project items
  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    if (!profileDraft) return;

    // Get appropriate limit based on field
    const limitMap: Record<keyof ProjectItem, keyof typeof INPUT_LIMITS> = {
      title: 'projectName',
      organization: 'company',
      period: 'location',
      details: 'projectDescription'
    };

    // Sanitize and limit input
    const sanitized = removeDangerousPatterns(value).substring(0, INPUT_LIMITS[limitMap[field]].max);

    const newProj = [...profileDraft.projects];
    newProj[index] = { ...newProj[index], [field]: sanitized };
    setProfileDraft({ ...profileDraft, projects: newProj });
  };

  const addProject = () => {
    if (!profileDraft) return;
    setProfileDraft({
      ...profileDraft,
      projects: [...profileDraft.projects, { title: "", organization: "", period: "", details: "" }]
    });
  };

  const removeProject = (index: number) => {
    if (!profileDraft) return;
    const newProj = profileDraft.projects.filter((_, i) => i !== index);
    setProfileDraft({ ...profileDraft, projects: newProj });
  };


  // Skills state - using tags instead of free text
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearchInput, setSkillSearchInput] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Fetch available skills from API on mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/skills/available/`);
        const data = await response.json();
        if (data.success) {
          setAvailableSkills(data.skills);
        }
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      }
    };
    fetchSkills();
  }, []);

  // Initialize selected skills from profileDraft
  useEffect(() => {
    if (activeTab === 'skills' && profileDraft?.skillsText) {
      const skills = profileDraft.skillsText
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== "");
      setSelectedSkills(skills);
    }
  }, [activeTab, profileDraft?.skillsText]);

  // Handle skill search input change and filter suggestions
  const handleSkillSearchChange = (value: string) => {
    setSkillSearchInput(value);

    if (value.trim().length > 0) {
      const filtered = availableSkills
        .filter(skill =>
          skill.toLowerCase().includes(value.toLowerCase()) &&
          !selectedSkills.includes(skill)
        )
        .slice(0, 10);

      setSkillSuggestions(filtered);
      setShowSkillSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSkillSuggestions(false);
    }
  };

  // Add skill from suggestions
  const addSkill = (skill: string) => {
    if (!profileDraft || selectedSkills.includes(skill)) return;

    const newSkills = [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    setProfileDraft({
      ...profileDraft,
      skillsText: newSkills.join(', ')
    });

    setSkillSearchInput("");
    setShowSkillSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  // Remove skill
  const removeSkill = (skillToRemove: string) => {
    if (!profileDraft) return;

    const newSkills = selectedSkills.filter(s => s !== skillToRemove);
    setSelectedSkills(newSkills);
    setProfileDraft({
      ...profileDraft,
      skillsText: newSkills.join(', ')
    });
  };

  // Handle keyboard navigation in skill suggestions
  const handleSkillSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSkillSuggestions || skillSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < skillSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      addSkill(skillSuggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSkillSuggestions(false);
    }
  };



  return (
    <div className="cv-onboarding-page-container">
      {/* 1. Sage Header */}
      <Header />

      <div className="cv-onboarding-content-wrapper">
        <div className="cv-onboarding-header-section">
          <div>
            <h1 className="page-title">Complete Your Profile</h1>
            <p className="page-subtitle">{headerSubtitle}</p>
          </div>
          {/* Global Actions */}
          <div className="header-actions">
            <button className="ghost-btn" onClick={onSkip} disabled={loading}>Skip Setup</button>
          </div>
        </div>

        {!hasDraft ? (
          <div className="upload-section-container">
            <div
              className={`dropzone ${dragActive ? "drag-active" : ""}`}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDrop={onDrop}
            >
              <div className="dropzone-inner">
                <div className="icon-circle">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <p className="drop-title">Upload your CV to auto-fill</p>
                <p className="drop-subtitle">Drag & drop or click to browse (PDF)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFile(e.target.files?.[0] || null)}
                  className="hidden-input"
                />

                <div className="drop-actions">
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    Browse Files
                  </button>
                  <button className="primary-btn" onClick={onUpload} disabled={loading || !file}>
                    {loading ? "Analyzing..." : "Auto-Fill Profile"}
                  </button>
                </div>
                {file && <p className="file-name">Selected: {file.name}</p>}
              </div>
            </div>
            {loading && (
              <div className="validation-message info">
                <div className="spinner small" />
                <span>Extracting info from your resume...</span>
              </div>
            )}
            {error && <div className="validation-message error">{error}</div>}
          </div>
        ) : (
          <div className="tabs-container">
            {/* Tabs Navigation */}
            <div className="onboarding-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'basics' && (
                <div className="form-section fade-in">
                  <h2 className="section-heading">Personal Details</h2>
                  <div className="form-grid">
                    <label>
                      <span className="input-label">Full Name</span>
                      <input className={`input-field ${validationErrors.fullName ? 'input-error' : ''}`}
                        type="text"
                        value={profileDraft?.fullName || ""}
                        onChange={(e) => handleSecureTextInput('fullName', e.target.value, 'firstName')}
                        placeholder="e.g. John Doe"
                        maxLength={INPUT_LIMITS.firstName.max}
                      />
                      {validationErrors.fullName && (
                        <span className="error-text">{validationErrors.fullName}</span>
                      )}
                    </label>
                    <label>
                      <span className="input-label">Email</span>
                      <input className={`input-field ${validationErrors.email ? 'input-error' : ''}`}
                        type="email"
                        value={profileDraft?.email || ""}
                        onChange={(e) => handleSecureEmailInput(e.target.value)}
                        maxLength={INPUT_LIMITS.email.max}
                      />
                      {validationErrors.email && (
                        <span className="error-text">{validationErrors.email}</span>
                      )}
                    </label>
                    <label>
                      <span className="input-label">Phone</span>
                      <input className={`input-field ${validationErrors.phone ? 'input-error' : ''}`}
                        type="text"
                        value={profileDraft?.phone || ""}
                        onChange={(e) => handleSecurePhoneInput(e.target.value)}
                        maxLength={INPUT_LIMITS.phone.max}
                      />
                      {validationErrors.phone && (
                        <span className="error-text">{validationErrors.phone}</span>
                      )}
                    </label>
                    <label>
                      <span className="input-label">Location</span>
                      <input className={`input-field ${validationErrors.location ? 'input-error' : ''}`}
                        type="text"
                        value={profileDraft?.location || ""}
                        onChange={(e) => handleSecureTextInput('location', e.target.value, 'location')}
                        maxLength={INPUT_LIMITS.location.max}
                      />
                      {validationErrors.location && (
                        <span className="error-text">{validationErrors.location}</span>
                      )}
                    </label>
                    <label className="full-row">
                      <span className="input-label">Headline / Title</span>
                      <input className={`input-field ${validationErrors.domain ? 'input-error' : ''}`}
                        type="text"
                        value={profileDraft?.domain || ""}
                        onChange={(e) => handleSecureTextInput('domain', e.target.value, 'jobTitle')}
                        placeholder="e.g. Senior Software Engineer"
                        maxLength={INPUT_LIMITS.jobTitle.max}
                      />
                      {validationErrors.domain && (
                        <span className="error-text">{validationErrors.domain}</span>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="form-section fade-in">
                  <div className="section-header-row">
                    <h2 className="section-heading">Work Experience</h2>
                    <button className="btn-add-small" onClick={addExperience}>+ Add Position</button>
                  </div>
                  <div className="items-list">
                    {profileDraft?.experience.map((exp, idx) => (
                      <div key={idx} className="item-card">
                        <div className="card-header">
                          <input className="card-input input-title" placeholder="Job Title"
                            value={exp.title}
                            onChange={e => updateExperience(idx, 'title', e.target.value)}
                            maxLength={INPUT_LIMITS.jobTitle.max}
                          />
                          <button className="btn-remove" onClick={() => removeExperience(idx)} title="Remove">×</button>
                        </div>
                        <input className="card-input input-subtitle" placeholder="Company Name"
                          value={exp.organization}
                          onChange={e => updateExperience(idx, 'organization', e.target.value)}
                          maxLength={INPUT_LIMITS.company.max}
                        />
                        <input className="card-input input-meta" placeholder="Period (e.g. Jan 2020 - Present)"
                          value={exp.period}
                          onChange={e => updateExperience(idx, 'period', e.target.value)}
                          maxLength={INPUT_LIMITS.location.max}
                        />
                        <textarea className="card-input input-details" placeholder="Describe your responsibilities and achievements..."
                          value={exp.details}
                          onChange={e => updateExperience(idx, 'details', e.target.value)}
                          maxLength={INPUT_LIMITS.description.max}
                        />
                      </div>
                    ))}
                    {profileDraft?.experience.length === 0 && (
                      <p className="empty-text">No experience listed. Add your past roles.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'education' && (
                <div className="form-section fade-in">
                  <div className="section-header-row">
                    <h2 className="section-heading">Education</h2>
                    <button className="btn-add-small" onClick={addEducation}>+ Add Education</button>
                  </div>
                  <div className="items-list">
                    {profileDraft?.education.map((edu, idx) => (
                      <div key={idx} className="item-card">
                        <div className="card-header">
                          <input className="card-input input-title" placeholder="Degree / Major"
                            value={edu.degree}
                            onChange={e => updateEducation(idx, 'degree', e.target.value)}
                            maxLength={INPUT_LIMITS.degree.max}
                          />
                          <button className="btn-remove" onClick={() => removeEducation(idx)} title="Remove">×</button>
                        </div>
                        <input className="card-input input-subtitle" placeholder="Institution / School"
                          value={edu.institution}
                          onChange={e => updateEducation(idx, 'institution', e.target.value)}
                          maxLength={INPUT_LIMITS.institution.max}
                        />
                        <input className="card-input input-meta" placeholder="Year (e.g. 2018 - 2022)"
                          value={edu.year}
                          onChange={e => updateEducation(idx, 'year', e.target.value)}
                          maxLength={INPUT_LIMITS.location.max}
                        />
                      </div>
                    ))}
                    {profileDraft?.education.length === 0 && (
                      <p className="empty-text">No education listed.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="form-section fade-in">
                  <h2 className="section-heading">Skills & Summary</h2>
                  <div style={{ marginBottom: '24px' }}>
                    <label>
                      {/* Search Input */}
                      <div style={{ position: 'relative', marginBottom: selectedSkills.length > 0 ? '16px' : '0' }}>
                        <input
                          type="text"
                          className="input-field"
                          value={skillSearchInput}
                          onChange={(e) => handleSkillSearchChange(e.target.value)}
                          onKeyDown={handleSkillSearchKeyDown}
                          onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
                          onFocus={() => {
                            if (skillSearchInput.trim().length > 0) {
                              handleSkillSearchChange(skillSearchInput);
                            }
                          }}
                          placeholder="Search for skills (e.g., Python, React, JavaScript)..."
                        />

                        {/* Autocomplete Suggestions Dropdown */}
                        {showSkillSuggestions && skillSuggestions.length > 0 && (
                          <div className="skill-suggestions-dropdown">
                            {skillSuggestions.map((skill, idx) => (
                              <div
                                key={skill}
                                className={`suggestion-item ${idx === selectedSuggestionIndex ? 'selected' : ''}`}
                                onClick={() => addSkill(skill)}
                                onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                                  <path d="M6 8l1.5 1.5L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{skill}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected Skills Tags */}
                      {selectedSkills.length > 0 && (
                        <div className="selected-skills-wrapper">
                          <div className="selected-skills-header">
                            <span className="skills-count">{selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected</span>
                            <button
                              type="button"
                              className="clear-all-skills"
                              onClick={() => {
                                setSelectedSkills([]);
                                if (profileDraft) {
                                  setProfileDraft({ ...profileDraft, skillsText: '' });
                                }
                              }}
                            >
                              Clear all
                            </button>
                          </div>
                          <div className="selected-skills-container">
                            {selectedSkills.map((skill) => (
                              <div key={skill} className="skill-tag-selected">
                                <span>{skill}</span>
                                <button
                                  type="button"
                                  className="skill-tag-remove"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeSkill(skill);
                                  }}
                                  title="Remove skill"
                                  aria-label={`Remove ${skill}`}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  <div>
                    <label>
                      <span className="input-label">Professional Summary</span>
                      <p className="helper-text" style={{ margin: '0 0 8px 0' }}>A brief overview of your career and goals.</p>
                      <textarea className="input-field large-area"
                        value={profileDraft?.summary || ""}
                        onChange={(e) => handleSecureTextInput('summary', e.target.value, 'summary')}
                        placeholder="I am a passionate software engineer with 5 years of experience..."
                        maxLength={INPUT_LIMITS.summary.max}
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'certificates' && (
                <div className="form-section fade-in">
                  <div className="section-header-row">
                    <h2 className="section-heading">Certificates & Awards</h2>
                    <button className="btn-add-small" onClick={addCertificate}>+ Add Certificate</button>
                  </div>
                  <div className="items-list">
                    {profileDraft?.certificates.map((cert, idx) => (
                      <div key={idx} className="item-card">
                        <div className="card-header">
                          <input className="card-input input-title" placeholder="Certificate Name (e.g. AWS Certified Solutions Architect)"
                            value={cert.name}
                            onChange={e => updateCertificate(idx, 'name', e.target.value)}
                            maxLength={INPUT_LIMITS.certificateName.max}
                          />
                          <button className="btn-remove" onClick={() => removeCertificate(idx)} title="Remove">×</button>
                        </div>
                        <input className="card-input input-subtitle" placeholder="Issuing Organization"
                          value={cert.issuer}
                          onChange={e => updateCertificate(idx, 'issuer', e.target.value)}
                          maxLength={INPUT_LIMITS.issuer.max}
                        />
                        <input className="card-input input-meta" placeholder="Year / Month"
                          value={cert.year}
                          onChange={e => updateCertificate(idx, 'year', e.target.value)}
                          maxLength={INPUT_LIMITS.location.max}
                        />
                      </div>
                    ))}
                    {profileDraft?.certificates.length === 0 && (
                      <p className="empty-text">No certificates listed. Add your achievements.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="form-section fade-in">
                  <div className="section-header-row">
                    <h2 className="section-heading">Technical & Academic Projects</h2>
                    <button className="btn-add-small" onClick={addProject}>+ Add Project</button>
                  </div>
                  <div className="items-list">
                    {profileDraft?.projects.map((proj, idx) => (
                      <div key={idx} className="item-card">
                        <div className="card-header">
                          <input className="card-input input-title" placeholder="Project Title"
                            value={proj.title}
                            onChange={e => updateProject(idx, 'title', e.target.value)}
                            maxLength={INPUT_LIMITS.projectName.max}
                          />
                          <button className="btn-remove" onClick={() => removeProject(idx)} title="Remove">×</button>
                        </div>
                        <input className="card-input input-subtitle" placeholder="Organization (Optional)"
                          value={proj.organization}
                          onChange={e => updateProject(idx, 'organization', e.target.value)}
                          maxLength={INPUT_LIMITS.company.max}
                        />
                        <input className="card-input input-meta" placeholder="Period / Date"
                          value={proj.period}
                          onChange={e => updateProject(idx, 'period', e.target.value)}
                          maxLength={INPUT_LIMITS.location.max}
                        />
                        <textarea className="card-input input-details" placeholder="Briefly describe your project, technologies used, and your role..."
                          value={proj.details}
                          onChange={e => updateProject(idx, 'details', e.target.value)}
                          maxLength={INPUT_LIMITS.projectDescription.max}
                        />
                      </div>
                    ))}
                    {profileDraft?.projects.length === 0 && (
                      <p className="empty-text">No projects listed.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'research' && (
                <div className="form-section fade-in">
                  <div className="section-header-row">
                    <h2 className="section-heading">Research Work</h2>
                    <button className="btn-add-small" onClick={addResearch}>+ Add Research</button>
                  </div>
                  <div className="items-list">
                    {profileDraft?.research.map((res, idx) => (
                      <div key={idx} className="item-card">
                        <div className="card-header">
                          <input className="card-input input-title" placeholder="Project / Publication Title"
                            value={res.title}
                            onChange={e => updateResearch(idx, 'title', e.target.value)}
                            maxLength={INPUT_LIMITS.researchTitle.max}
                          />
                          <button className="btn-remove" onClick={() => removeResearch(idx)} title="Remove">×</button>
                        </div>
                        <input className="card-input input-subtitle" placeholder="Institution / Publisher"
                          value={res.organization}
                          onChange={e => updateResearch(idx, 'organization', e.target.value)}
                          maxLength={INPUT_LIMITS.company.max}
                        />
                        <input className="card-input input-meta" placeholder="Period / Date"
                          value={res.period}
                          onChange={e => updateResearch(idx, 'period', e.target.value)}
                          maxLength={INPUT_LIMITS.location.max}
                        />
                        <textarea className="card-input input-details" placeholder="Briefly describe your research findings or contributions..."
                          value={res.details}
                          onChange={e => updateResearch(idx, 'details', e.target.value)}
                          maxLength={INPUT_LIMITS.researchDescription.max}
                        />
                      </div>
                    ))}
                    {profileDraft?.research.length === 0 && (
                      <p className="empty-text">No research work listed.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'review' && (
                <div className="review-tab-layout fade-in">
                  <div className="review-main-grid">
                    {/* Left Column: Basics, Summary & Skills */}
                    <div className="review-col review-col-left">
                      {/* Personal Details as a standard card */}
                      <div className="summary-preview-section">
                        <div className="summary-section-header">
                          <h3 className="summary-section-title">Personal Details</h3>
                          <button className="btn-edit-section" onClick={() => setActiveTab('basics')}>Edit</button>
                        </div>
                        <div className="summary-content">
                          <div className="summary-details-grid">
                            <div className="detail-row"><strong>Name:</strong> {profileDraft?.fullName || "Not provided"}</div>
                            <div className="detail-row"><strong>Headline:</strong> {profileDraft?.domain || "Not provided"}</div>
                            <div className="detail-row"><strong>Email:</strong> {profileDraft?.email || "Not provided"}</div>
                            <div className="detail-row"><strong>Phone:</strong> {profileDraft?.phone || "Not provided"}</div>
                            <div className="detail-row"><strong>Location:</strong> {profileDraft?.location || "Not provided"}</div>
                          </div>
                        </div>
                      </div>

                      {profileDraft?.summary && (
                        <div className="summary-preview-section">
                          <div className="summary-section-header">
                            <h3 className="summary-section-title">Professional Summary</h3>
                            <button className="btn-edit-section" onClick={() => setActiveTab('skills')}>Edit</button>
                          </div>
                          <div className="summary-content">
                            <p style={{ margin: 0 }}>{profileDraft.summary}</p>
                          </div>
                        </div>
                      )}

                      <div className="summary-preview-section">
                        <div className="summary-section-header">
                          <h3 className="summary-section-title">Technical Skills</h3>
                          <button className="btn-edit-section" onClick={() => setActiveTab('skills')}>Edit</button>
                        </div>
                        <div className="summary-content">
                          {profileDraft?.skillsText && profileDraft.skillsText.trim() ? (
                            <div className="summary-skills-list">
                              {profileDraft.skillsText.split(',')
                                .map(s => s.trim())
                                .filter(s => s !== "")
                                .map((skill, idx) => (
                                  <span key={idx} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                          ) : (
                            <p className="summary-empty">No skills added</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Key Professional History */}
                    <div className="review-col review-col-right">
                      <div className="summary-preview-section">
                        <div className="summary-section-header">
                          <h3 className="summary-section-title">Work Experience</h3>
                          <button className="btn-edit-section" onClick={() => setActiveTab('experience')}>Edit</button>
                        </div>
                        <div className="summary-content">
                          {profileDraft?.experience && profileDraft.experience.length > 0 ? (
                            profileDraft.experience.map((exp, idx) => (
                              <div key={idx} className="summary-item">
                                <div className="summary-item-title"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Role:</span> {exp.title || 'No title'}</div>
                                <div className="summary-item-subtitle"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Company:</span> {exp.organization || 'No organization'}</div>
                                {exp.period && <div className="summary-item-meta"><span style={{ fontWeight: 500, color: '#94a3b8' }}>Date:</span> {exp.period}</div>}
                                {exp.details && <div className="summary-item-details">{exp.details}</div>}
                              </div>
                            ))
                          ) : (
                            <p className="summary-empty">No work experience added</p>
                          )}
                        </div>
                      </div>

                      <div className="summary-preview-section">
                        <div className="summary-section-header">
                          <h3 className="summary-section-title">Education</h3>
                          <button className="btn-edit-section" onClick={() => setActiveTab('education')}>Edit</button>
                        </div>
                        <div className="summary-content">
                          {profileDraft?.education && profileDraft.education.length > 0 ? (
                            profileDraft.education.map((edu, idx) => (
                              <div key={idx} className="summary-item">
                                <div className="summary-item-title">{edu.degree || 'No degree'}</div>
                                <div className="summary-item-subtitle">{edu.institution || 'No institution'}</div>
                                {edu.year && <div className="summary-item-meta">{edu.year}</div>}
                              </div>
                            ))
                          ) : (
                            <p className="summary-empty">No education added</p>
                          )}
                        </div>
                      </div>

                      <div className="summary-preview-section">
                        <div className="summary-section-header">
                          <h3 className="summary-section-title">Technical Projects</h3>
                          <button className="btn-edit-section" onClick={() => setActiveTab('projects')}>Edit</button>
                        </div>
                        <div className="summary-content">
                          {profileDraft?.projects && profileDraft.projects.length > 0 ? (
                            profileDraft.projects.map((proj, idx) => (
                              <div key={idx} className="summary-item">
                                <div className="summary-item-title"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Project:</span> {proj.title || 'No title'}</div>
                                <div className="summary-item-subtitle"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Organization:</span> {proj.organization || 'No organization'}</div>
                                {proj.period && <div className="summary-item-meta"><span style={{ fontWeight: 500, color: '#94a3b8' }}>Date:</span> {proj.period}</div>}
                                {proj.details && <div className="summary-item-details">{proj.details}</div>}
                              </div>
                            ))
                          ) : (
                            <p className="summary-empty">No projects listed</p>
                          )}
                        </div>
                      </div>


                      <div className="summary-preview-section">
                        <div className="summary-section-header">
                          <h3 className="summary-section-title">Research Work</h3>
                          <button className="btn-edit-section" onClick={() => setActiveTab('research')}>Edit</button>
                        </div>
                        <div className="summary-content">
                          {profileDraft?.research && profileDraft.research.length > 0 ? (
                            profileDraft.research.map((res, idx) => (
                              <div key={idx} className="summary-item">
                                <div className="summary-item-title"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Title:</span> {res.title || 'No title'}</div>
                                <div className="summary-item-subtitle"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Organization:</span> {res.organization || 'No organization'}</div>
                                {res.period && <div className="summary-item-meta"><span style={{ fontWeight: 500, color: '#94a3b8' }}>Date:</span> {res.period}</div>}
                                {res.details && <div className="summary-item-details">{res.details}</div>}
                              </div>
                            ))
                          ) : (
                            <p className="summary-empty">No research listed</p>
                          )}
                        </div>
                      </div>

                      <div className="summary-preview-section">
                        <div className="summary-section-header">
                          <h3 className="summary-section-title">Certifications</h3>
                          <button className="btn-edit-section" onClick={() => setActiveTab('certificates')}>Edit</button>
                        </div>
                        <div className="summary-content">
                          {profileDraft?.certificates && profileDraft.certificates.length > 0 ? (
                            profileDraft.certificates.map((cert, idx) => (
                              <div key={idx} className="summary-item">
                                <div className="summary-item-title">{cert.name}</div>
                                <div className="summary-item-subtitle">{cert.issuer}</div>
                                <div className="summary-item-meta">{cert.year || 'Not provided'}</div>
                              </div>
                            ))
                          ) : (
                            <p className="summary-empty">No certifications listed</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="onboarding-footer">
              {activeTab !== 'basics' && (
                <button className="secondary-btn" onClick={goBack}>Back</button>
              )}
              {activeTab !== 'review' ? (
                <button className="primary-btn" onClick={goNext}>
                  Next

                </button>
              ) : (
                <button className="primary-btn complete-btn" onClick={onSubmit} disabled={loading}>
                  {loading ? "Saving..." : "Complete Profile"}
                </button>
              )}
            </div>
          </div>
        )}
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

  // Map structured data
  const experience: ExperienceItem[] = (parsed.experience || []).map(exp => ({
    title: exp.title || "",
    organization: exp.organization || "",
    period: exp.period || "",
    details: exp.details || ""
  }));

  const education: EducationItem[] = (parsed.education || []).map(edu => ({
    degree: edu.degree || "",
    institution: edu.institution || "",
    year: edu.year || "",
    details: edu.details || ""
  }));

  const certificates: CertificateItem[] = (parsed.certificates || []).map(cert => ({
    name: cert.name || "",
    issuer: cert.issuer || "",
    year: cert.year || ""
  }));

  const research: ResearchItem[] = (parsed.research || []).map(res => ({
    title: res.title || "",
    organization: res.organization || "",
    period: res.period || "",
    details: res.details || ""
  }));

  const projects: ProjectItem[] = (parsed.projects || []).map(proj => ({
    title: proj.title || "",
    organization: proj.organization || "",
    period: proj.period || "",
    details: proj.details || ""
  }));

  const experienceLines = experience.map((exp) =>
    [exp.title, exp.organization, exp.period].filter(Boolean).join(" · ")
  );

  const educationLines = education.map((edu) =>
    [edu.degree, edu.institution, edu.year].filter(Boolean).join(" · ")
  );

  return {
    fullName: parsed.name || "",
    email,
    phone,
    location,
    domain: "",
    summary: parsed.summary || "",
    skillsText: skills.join(", "),
    experience,
    education,
    certificates,
    research,
    projects,
    experienceText: experienceLines.join("\n"),
    educationText: educationLines.join("\n"),
  };
}

export default CvOnboarding;
