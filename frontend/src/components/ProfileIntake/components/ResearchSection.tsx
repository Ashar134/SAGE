import type React from "react";

type Props = {
  research?: string;
  setResearch: (value: string) => void;
};

const ResearchSection: React.FC<Props> = ({ research = "", setResearch }) => (
  <div className="card">
    <div className="card-header">
      <div>
        <h2>Research / projects</h2>
        <p className="muted">Final-year project, papers, or notable work.</p>
      </div>
    </div>
    <div className="field">
      <label>Details</label>
      <textarea
        rows={6}
        value={research}
        onChange={(e) => setResearch(e.target.value)}
        placeholder="Summarize key projects or research work."
      />
    </div>
  </div>
);

export default ResearchSection;
