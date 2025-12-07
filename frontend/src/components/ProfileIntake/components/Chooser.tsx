import type React from "react";

type Props = {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDropFile: (e: React.DragEvent<HTMLLabelElement>) => void;
  setIsDragging: (drag: boolean) => void;
  isDragging: boolean;
  onManual: () => void;
};

const Chooser: React.FC<Props> = ({
  onFileChange,
  onDropFile,
  setIsDragging,
  isDragging,
  onManual,
}) => (
  <div className="chooser-shell">
    <div className="chooser-card">
      <div className="chooser-header">
        <div>
          <p className="eyebrow">Profile setup</p>
          <h1>How do you want to get started?</h1>
          <p className="muted">
            Upload an ATS-friendly PDF CV to auto-fill your profile, or start with an empty form and fill it manually.
          </p>
        </div>
      </div>
      <div className="chooser-grid">
        <label
          className={`dropzone ${isDragging ? "dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDropFile}
        >
          <input type="file" accept="application/pdf" onChange={onFileChange} />
          <p className="eyebrow">Option 1</p>
          <h3>Upload CV (PDF)</h3>
          <p className="muted">
            Drag & drop or click to upload. Please use an ATS-friendly PDF for best results.
          </p>
          <div className="pill ghost">Recommended</div>
        </label>
        <div className="manual-card">
          <p className="eyebrow">Option 2</p>
          <h3>Fill manually</h3>
          <p className="muted">
            Start with blank fields. You can upload a CV later to auto-fill.
          </p>
          <button className="button primary" onClick={onManual}>
            Start manual
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default Chooser;
