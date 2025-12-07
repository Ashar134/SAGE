import type React from "react";
import type { Experience } from "../types";

type Props = {
  experience: Experience[];
  addExperience: () => void;
  updateExperience: (index: number, key: keyof Experience, value: string) => void;
  saveProfile: () => void;
  saving: "idle" | "saving" | "saved";
};

const ExperienceSection: React.FC<Props> = ({
  experience,
  addExperience,
  updateExperience,
  saveProfile,
  saving,
}) => (
  <div className="card">
    <div className="card-header">
      <div>
        <h2>Experience</h2>
        <p className="muted">Internships, jobs, and volunteer work.</p>
      </div>
      <div className="upload-actions">
        <button className="button ghost" onClick={addExperience}>
          + Add experience
        </button>
        <button className="button primary" onClick={saveProfile}>
          {saving === "saving" ? "Saving…" : "Save experiences"}
        </button>
      </div>
    </div>

    <div className="stack">
      {experience.map((exp, idx) => (
        <div key={idx} className="sub-row">
          <div className="field">
            <label>Title</label>
            <input
              value={exp.title}
              onChange={(e) => updateExperience(idx, "title", e.target.value)}
              placeholder="Software Engineer"
            />
          </div>
          <div className="two-col">
            <div className="field">
              <label>Organization</label>
              <input
                value={exp.organization}
                onChange={(e) => updateExperience(idx, "organization", e.target.value)}
                placeholder="Company name"
              />
            </div>
            <div className="field">
              <label>Period</label>
              <input
                value={exp.period}
                onChange={(e) => updateExperience(idx, "period", e.target.value)}
                placeholder="Jan 2024 – Present"
              />
            </div>
          </div>
          <div className="field">
            <label>Highlights</label>
            <textarea
              rows={3}
              value={exp.details}
              onChange={(e) => updateExperience(idx, "details", e.target.value)}
              placeholder="What you worked on and impact."
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ExperienceSection;
