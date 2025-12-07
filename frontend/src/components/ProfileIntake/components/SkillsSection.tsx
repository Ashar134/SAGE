import type React from "react";

type Props = {
  skills: string[];
  skillInput: string;
  setSkillInput: (v: string) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
};

const SkillsSection: React.FC<Props> = ({
  skills,
  skillInput,
  setSkillInput,
  addSkill,
  removeSkill,
}) => (
  <div className="card">
    <div className="card-header">
      <div>
        <h2>Skills & languages</h2>
        <p className="muted">Add what you’re comfortable working with.</p>
      </div>
      <div className="skill-input">
        <input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          placeholder="Add a skill (press Enter)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill(skillInput);
              setSkillInput("");
            }
          }}
        />
        <button
          className="button primary"
          onClick={() => {
            addSkill(skillInput);
            setSkillInput("");
          }}
        >
          Add
        </button>
      </div>
    </div>

    <div className="chips">
      {skills.length === 0 && <span className="chip muted">No skills added yet.</span>}
      {skills.map((skill) => (
        <span key={skill} className="chip">
          {skill}
          <button onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
            ×
          </button>
        </span>
      ))}
    </div>
  </div>
);

export default SkillsSection;
