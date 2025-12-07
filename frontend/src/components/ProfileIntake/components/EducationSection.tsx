import type React from "react";
import type { Education } from "../types";

type Props = {
  education: Education[];
  addEducation: () => void;
  updateEducation: (index: number, key: keyof Education, value: string) => void;
};

const EducationSection: React.FC<Props> = ({
  education,
  addEducation,
  updateEducation,
}) => (
  <div className="card">
    <div className="card-header">
      <div>
        <h2>Education</h2>
        <p className="muted">Add your degrees or current studies.</p>
      </div>
      <button className="button ghost" onClick={addEducation}>
        + Add education
      </button>
    </div>

    <div className="stack">
      {education.map((edu, idx) => (
        <div key={idx} className="education-entry">
          <div className="two-col">
            <div className="field">
              <label>Degree</label>
              <input
                type="text"
                maxLength={80}
                value={edu.degree}
                onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                placeholder="BSc Software Engineering"
              />
            </div>
            <div className="field">
              <label>Institution</label>
              <input
                type="text"
                maxLength={80}
                value={edu.institution}
                onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                placeholder="FAST - NUCES"
              />
            </div>
          </div>
          <div className="two-col">
            <div className="field">
              <label>Year / period</label>
              <input
                type="text"
                maxLength={40}
                value={edu.year}
                onChange={(e) => updateEducation(idx, "year", e.target.value)}
                placeholder="2022 – Present"
              />
            </div>
            <div className="field">
              <label>Details (optional)</label>
              <input
                type="text"
                maxLength={160}
                value={edu.details}
                onChange={(e) => updateEducation(idx, "details", e.target.value)}
                placeholder="CGPA, thesis, or key coursework"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default EducationSection;
