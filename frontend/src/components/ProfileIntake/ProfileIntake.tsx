import type React from "react";
import { useMemo, useState } from "react";
import logo from "/sage-logo.png";
import "./ProfileIntake.css";
import Chooser from "./components/Chooser";
import Sidebar from "./components/Sidebar";
import ContactBar from "./components/ContactBar";
import BasicSection from "./components/BasicSection";
import EducationSection from "./components/EducationSection";
import SkillsSection from "./components/SkillsSection";
import ExperienceSection from "./components/ExperienceSection";
import ResearchSection from "./components/ResearchSection";
import SummarySection from "./components/SummarySection";
import type {
  Contact,
  Education,
  Experience,
  Profile,
  SectionId,
} from "./types";

const emptyProfile: Profile = {
  name: "",
  contact: { emails: [""], phones: [""], links: [""] },
  location: { city: "", country: "" },
  summary: "",
  skills: [],
  experience: [{ title: "", organization: "", period: "", details: "" }],
  education: [{ degree: "", institution: "", year: "", details: "" }],
  research: "",
};

const sections: { id: SectionId; label: string; icon: string }[] = [
  { id: "basic", label: "Basic information", icon: "👤" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "skills", label: "Skills & languages", icon: "🧠" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "research", label: "Research / projects", icon: "📄" },
  { id: "summary", label: "Profile summary", icon: "📝" },
];

const ProfileIntake: React.FC = () => {
  // TODO: gate with real Django auth state; assumed authenticated for now.
  const [isAuthenticated] = useState(true);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [activeSection, setActiveSection] = useState<SectionId>("basic");
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const [skillInput, setSkillInput] = useState("");
  const [intakeMode, setIntakeMode] = useState<"choose" | "form">("choose");
  const [isDragging, setIsDragging] = useState(false);

  const completion = useMemo(() => {
    const filled = {
      basic: Boolean(
        profile.name ||
          profile.location.city ||
          profile.location.country ||
          profile.contact.emails[0]
      ),
      education: profile.education.some(
        (edu) => edu.degree || edu.institution
      ),
      skills: profile.skills.length > 0,
      experience: profile.experience.some(
        (exp) => exp.title || exp.organization
      ),
      research: Boolean(profile.research),
      summary: Boolean(profile.summary),
    };
    const percent =
      (Object.values(filled).filter(Boolean).length / sections.length) * 100;
    return { filled, percent: Math.round(percent) };
  }, [profile]);

  const mergeParsedProfile = (parsed: Partial<Profile>) => {
    setProfile((prev) => ({
      ...prev,
      ...parsed,
      contact: { ...prev.contact, ...parsed.contact },
      location: { ...prev.location, ...parsed.location },
      experience: parsed.experience?.length
        ? parsed.experience
        : prev.experience,
      education: parsed.education?.length
        ? parsed.education
        : prev.education,
      skills: parsed.skills?.length ? parsed.skills : prev.skills,
      research: parsed.research ?? prev.research,
      summary: parsed.summary ?? prev.summary,
      name: parsed.name ?? prev.name,
    }));
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setMessage("Parsing CV...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/cv/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`CV parse failed (${response.status}): ${errText}`);
      }

      const parsed = await response.json();
      mergeParsedProfile(parsed);
      setMessage("CV parsed. Review the fields and save when ready.");
      setIntakeMode("form");
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "CV parsing failed. Ensure /api/cv/parse is connected.";
      setMessage(errMsg);
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(null), 5200);
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const onDropFile = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      handleFileUpload(file);
    } else {
      setMessage("Please drop a PDF file (ATS-friendly).");
    }
  };

  const saveProfile = async () => {
    setSaving("saving");
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        throw new Error("Save failed");
      }
      setSaving("saved");
      setMessage("Profile saved.");
    } catch {
      setSaving("idle");
      setMessage("Could not reach backend. Add /api/profile to persist data.");
    } finally {
      setTimeout(() => setMessage(null), 3600);
      setTimeout(() => setSaving("idle"), 1800);
    }
  };



  const updateContact = (key: keyof Contact, value: string, index = 0) => {
    setProfile((prev) => {
      const next = [...prev.contact[key]];
      next[index] = value;
      return { ...prev, contact: { ...prev.contact, [key]: next } };
    });
  };

  const addSkill = (skill: string) => {
    if (!skill.trim()) return;
    setProfile((prev) => ({
      ...prev,
      skills: Array.from(new Set([...prev.skills, skill.trim()])),
    }));
  };

  const removeSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const updateExperience = (
    index: number,
    key: keyof Experience,
    value: string
  ) => {
    setProfile((prev) => {
      const next = [...prev.experience];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, experience: next };
    });
  };

  const addExperience = () => {
    setProfile((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: "", organization: "", period: "", details: "" },
      ],
    }));
  };

  const updateEducation = (
    index: number,
    key: keyof Education,
    value: string
  ) => {
    setProfile((prev) => {
      const next = [...prev.education];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, education: next };
    });
  };

  const addEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: "", institution: "", year: "", details: "" },
      ],
    }));
  };

  /* ---- Sections ---- */

  const renderActiveSection = () => {
    switch (activeSection) {
      case "basic":
        return (
          <BasicSection
            profile={profile}
            setProfile={setProfile}
            onFileChange={onFileChange}
            saveProfile={saveProfile}
            saving={saving}
            uploading={uploading}
          />
        );
      case "education":
        return (
          <EducationSection
            education={profile.education}
            addEducation={addEducation}
            updateEducation={updateEducation}
          />
        );
      case "skills":
        return (
          <SkillsSection
            skills={profile.skills}
            skillInput={skillInput}
            setSkillInput={setSkillInput}
            addSkill={addSkill}
            removeSkill={removeSkill}
          />
        );
      case "experience":
        return (
          <ExperienceSection
            experience={profile.experience}
            addExperience={addExperience}
            updateExperience={updateExperience}
            saveProfile={saveProfile}
            saving={saving}
          />
        );
      case "research":
        return (
          <ResearchSection
            research={profile.research}
            setResearch={(value) => setProfile({ ...profile, research: value })}
          />
        );
      case "summary":
        return (
          <SummarySection
            profile={profile}
            saveProfile={saveProfile}
            saving={saving}
          />
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="unauth-card">
        <h2>Please sign in</h2>
        <p className="muted">
          You’ll be redirected to the authentication page.
        </p>
        <a className="button primary" href="/auth">
          Go to login
        </a>
      </div>
    );
  }

  return (
    <div className="intake-shell">
      {intakeMode === "choose" && (
        <Chooser
          onFileChange={onFileChange}
          onDropFile={onDropFile}
          setIsDragging={setIsDragging}
          isDragging={isDragging}
          onManual={() => setIntakeMode("form")}
        />
      )}
      {intakeMode === "form" && (
        <>
          <div className="topbar">
            <div className="brand">
              <img src={logo} alt="Sage logo" />
              <div>
                <strong>Sage</strong>
                <p>Your hiring partner</p>
              </div>
            </div>
            <div className="top-actions">
              <span className="pill ghost">Profile setup</span>
            </div>
          </div>

          <div className="intake-top">
            <div>
              <p className="eyebrow">Profile</p>
              <h1>Set up your hiring profile</h1>
              <p className="muted">Upload your CV or fill in the sections below.</p>
            </div>
            <div className="status-pill">
              Completion {completion.percent}%
            </div>
          </div>

          <div className="completion-track">
            <div
              className="completion-fill"
              style={{ width: `${completion.percent}%` }}
            />
          </div>

          <div className="intake-layout">
            <Sidebar
              sections={sections}
              activeSection={activeSection}
              completion={completion.filled}
              onSelect={setActiveSection}
              onSave={saveProfile}
              saving={saving}
              logo={logo}
            />

            <main className="content-area">
              <ContactBar profile={profile} updateContact={updateContact} />
              {renderActiveSection()}
            </main>
          </div>
        </>
      )}
      {message && <div className="toast">{message}</div>}
    </div>
  );
};

export default ProfileIntake;
