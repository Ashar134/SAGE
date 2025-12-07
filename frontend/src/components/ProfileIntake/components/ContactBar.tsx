import type React from "react";
import type { Profile } from "../types";

type Props = {
  profile: Profile;
  updateContact: (key: keyof Profile["contact"], value: string, index?: number) => void;
};

const ContactBar: React.FC<Props> = ({ profile, updateContact }) => (
  <div className="card contact-card">
    <div className="two-col">
      <div className="field">
        <label>Email</label>
        <input
          type="email"
          inputMode="email"
          value={profile.contact.emails[0] || ""}
          onChange={(e) => updateContact("emails", e.target.value)}
          placeholder="email@example.com"
          maxLength={80}
        />
      </div>
      <div className="field">
        <label>Phone</label>
        <input
          type="tel"
          inputMode="tel"
          pattern="^[0-9+\\s-]{5,20}$"
          maxLength={20}
          value={profile.contact.phones[0] || ""}
          onChange={(e) => updateContact("phones", e.target.value)}
          placeholder="+92 …"
        />
      </div>
    </div>
    <div className="field">
      <label>Portfolio / LinkedIn</label>
      <input
        type="url"
        inputMode="url"
        value={profile.contact.links[0] || ""}
        onChange={(e) => updateContact("links", e.target.value)}
        placeholder="https://linkedin.com/in/you"
        maxLength={120}
      />
    </div>
  </div>
);

export default ContactBar;
