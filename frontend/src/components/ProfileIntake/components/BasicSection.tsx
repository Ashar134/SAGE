import type React from "react";
import type { Profile } from "../types";

type Props = {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveProfile: () => void;
  saving: "idle" | "saving" | "saved";
  uploading: boolean;
};

const BasicSection: React.FC<Props> = ({
  profile,
  setProfile,
  onFileChange,
  saveProfile,
  saving,
  uploading,
}) => (
  <div className="card">
    <div className="card-header">
      <div>
        <h2>Basic information</h2>
        <p className="muted">Start with your name, location, and a short summary.</p>
      </div>
      <div className="upload-actions">
        <label className="button ghost">
          <input type="file" accept=".pdf" onChange={onFileChange} />
          {uploading ? "Uploading…" : "Upload CV (PDF)"}
        </label>
        <button className="button primary" onClick={saveProfile}>
          {saving === "saving" ? "Saving…" : saving === "saved" ? "Saved" : "Save profile"}
        </button>
      </div>
    </div>

    <div className="two-col">
      <div className="field">
        <label>Full name</label>
        <input
          type="text"
          maxLength={80}
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          placeholder="Your full name"
        />
      </div>
      <div />
      <div className="field">
        <label>Country</label>
        <input
          type="text"
          maxLength={56}
          value={profile.location.country}
          onChange={(e) =>
            setProfile({ ...profile, location: { ...profile.location, country: e.target.value } })
          }
          placeholder="Pakistan"
        />
      </div>
      <div className="field">
        <label>City</label>
        <input
          type="text"
          maxLength={56}
          value={profile.location.city}
          onChange={(e) =>
            setProfile({ ...profile, location: { ...profile.location, city: e.target.value } })
          }
          placeholder="Islamabad"
        />
      </div>
    </div>

    <div className="field">
      <label>Short summary</label>
      <textarea
        rows={4}
        maxLength={600}
        value={profile.summary}
        onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
        placeholder="One or two sentences about your background and focus."
      />
    </div>
  </div>
);

export default BasicSection;
