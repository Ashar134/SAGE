import type React from "react";
import type { Profile } from "../types";

type Props = {
  profile: Profile;
  saveProfile: () => void;
  saving: "idle" | "saving" | "saved";
};

const SummarySection: React.FC<Props> = ({ profile, saveProfile, saving }) => (
  <div className="card">
    <div className="card-header">
      <div>
        <h2>Profile summary</h2>
        <p className="muted">Quick snapshot of your profile.</p>
      </div>
      <button className="button primary" onClick={saveProfile}>
        {saving === "saving" ? "Saving…" : "Save & continue"}
      </button>
    </div>

    <div className="snapshot-grid">
      <div className="snapshot-card">
        <h4>Contact</h4>
        <p>{profile.name || "Name pending"}</p>
        <p>
          {profile.location.city && profile.location.country
            ? `${profile.location.city}, ${profile.location.country}`
            : "Location pending"}
        </p>
        <p>{profile.contact.emails[0] || "Email pending"}</p>
        <p>{profile.contact.phones[0] || "Phone pending"}</p>
      </div>
      <div className="snapshot-card">
        <h4>Skills</h4>
        <div className="chips">
          {profile.skills.slice(0, 8).map((skill) => (
            <span key={skill} className="chip">
              {skill}
            </span>
          ))}
          {profile.skills.length === 0 && (
            <span className="chip muted">Add skills to improve matching.</span>
          )}
        </div>
      </div>
      <div className="snapshot-card">
        <h4>Latest experience</h4>
        {profile.experience[0] && profile.experience[0].title ? (
          <>
            <p className="strong">{profile.experience[0].title}</p>
            <p>{profile.experience[0].organization}</p>
            <p className="muted">{profile.experience[0].period}</p>
          </>
        ) : (
          <p className="muted">Add an experience to show your work.</p>
        )}
      </div>
    </div>
  </div>
);

export default SummarySection;
