import type React from "react";
import type { SectionId } from "../types";

type Props = {
  sections: { id: SectionId; label: string; icon: string }[];
  activeSection: SectionId;
  completion: Record<string, boolean>;
  onSelect: (id: SectionId) => void;
  onSave: () => void;
  saving: "idle" | "saving" | "saved";
  logo: string;
};

const Sidebar: React.FC<Props> = ({
  sections,
  activeSection,
  completion,
  onSelect,
  onSave,
  saving,
  logo,
}) => (
  <aside className="nav-card">
    <div className="nav-header">
      <div className="logo-mark">
        <img src={logo} alt="Sage" />
      </div>
      <div>
        <p className="eyebrow">Profile setup</p>
        <strong>Candidate</strong>
      </div>
    </div>
    <div className="nav-list">
      {sections.map((section) => (
        <button
          key={section.id}
          className={`nav-item ${activeSection === section.id ? "active" : ""}`}
          onClick={() => onSelect(section.id)}
        >
          <span className="nav-icon">{section.icon}</span>
          <span>{section.label}</span>
          {completion[section.id] && <span className="nav-status">✓</span>}
        </button>
      ))}
    </div>
    <div className="nav-footer">
      <p className="muted">
        Save changes anytime. You can revisit sections later.
      </p>
      <button className="button primary full" onClick={onSave}>
        {saving === "saving" ? "Saving…" : "Save progress"}
      </button>
    </div>
  </aside>
);

export default Sidebar;
