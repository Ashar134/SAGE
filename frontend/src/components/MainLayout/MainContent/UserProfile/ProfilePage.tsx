import { useState } from 'react';
import './ProfilePage.css';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  domain?: string; // Field of expertise (e.g., Computer Science, Software Engineering)
  linkedin?: string;
  github?: string;
}

// Dummy data - will be replaced with actual CV extraction data later
const dummyProfile: UserProfile = {
  fullName: "Dilawar Khan",
  email: "dilawar@gmail.com",
  phone: "+92 300 1234567",
  location: "Peshawar, Pakistan",
  domain: "Computer Science",
  linkedin: "linkedin.com/in/dilawar123456",
  github: "github.com/dilawarkhan"
};

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(dummyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image file
      if (file.type.startsWith('image/')) {
        setProfilePicture(file);
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePicturePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select an image file (JPG, PNG, etc.)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setCvFile(file);
        setUploadStatus('File selected. Ready to upload.');
        // TODO: Integrate with CV extraction backend when ready
      } else {
        setUploadStatus('Please upload a PDF file.');
        setCvFile(null);
      }
    }
  };

  const handleUpload = () => {
    if (!cvFile) {
      setUploadStatus('Please select a file first.');
      return;
    }
    
    // TODO: Implement actual upload and CV extraction integration
    setUploadStatus('Uploading... (Backend integration pending)');
    
    // Simulate upload
    setTimeout(() => {
      setUploadStatus('CV uploaded successfully! Extraction will be processed soon.');
    }, 1500);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Reset CV upload state when saving/exiting edit mode
    setCvFile(null);
    setUploadStatus('');
    // TODO: Save changes to backend including profile picture
    // TODO: Upload profilePicture to server if it exists
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt={profile.fullName}
                    className="avatar-image"
                  />
                ) : (
                  profile.fullName.charAt(0).toUpperCase()
                )}
              </div>
              {isEditing && (
                <div className="avatar-upload-overlay">
                  <label htmlFor="profile-picture-upload" className="avatar-upload-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <span>Change Photo</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="file-input"
                    id="profile-picture-upload"
                  />
                </div>
              )}
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">{profile.fullName}</h1>
              {profile.domain && (
                <p className="profile-title">{profile.domain}</p>
              )}
              <div className="profile-location">
                <svg className="location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {profile.location}
              </div>
            </div>
          </div>
          <button 
            className="edit-button"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? 'Save' : 'Edit Profile'}
          </button>
        </div>

        {/* CV Upload Section - Only visible when editing */}
        {isEditing && (
          <div className="profile-section cv-upload-section">
            <h2 className="section-title">Upload CV</h2>
            <div className="cv-upload-box">
              <div className="upload-area">
                <svg className="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p className="upload-text">
                  {cvFile ? cvFile.name : 'Click to upload or drag and drop'}
                </p>
                <p className="upload-hint">PDF only (Max 5MB)</p>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="file-input"
                  id="cv-upload"
                />
                <label htmlFor="cv-upload" className="upload-button">
                  Choose File
                </label>
              </div>
              {cvFile && (
                <button className="upload-submit-button" onClick={handleUpload}>
                  Upload & Extract Information
                </button>
              )}
              {uploadStatus && (
                <p className={`upload-status ${uploadStatus.includes('success') ? 'success' : uploadStatus.includes('error') ? 'error' : ''}`}>
                  {uploadStatus}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Personal Information Section */}
        <div className="profile-section">
          <h2 className="section-title">Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label className="info-label">Full Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="info-input"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                />
              ) : (
                <p className="info-value">{profile.fullName}</p>
              )}
            </div>
            <div className="info-item">
              <label className="info-label">Email</label>
              {isEditing ? (
                <input 
                  type="email" 
                  className="info-input"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              ) : (
                <p className="info-value">{profile.email}</p>
              )}
            </div>
            <div className="info-item">
              <label className="info-label">Contact</label>
              {isEditing ? (
                <input 
                  type="tel" 
                  className="info-input"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              ) : (
                <p className="info-value">{profile.phone}</p>
              )}
            </div>
            <div className="info-item">
              <label className="info-label">Location</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="info-input"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              ) : (
                <p className="info-value">{profile.location}</p>
              )}
            </div>
            <div className="info-item">
              <label className="info-label">Domain</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="info-input"
                  value={profile.domain || ''}
                  onChange={(e) => setProfile({ ...profile, domain: e.target.value })}
                  placeholder="e.g., Computer Science, Software Engineering"
                />
              ) : (
                <p className="info-value">{profile.domain || 'Not specified'}</p>
              )}
            </div>
            {profile.linkedin && (
              <div className="info-item">
                <label className="info-label">LinkedIn</label>
                {isEditing ? (
                  <input 
                    type="url" 
                    className="info-input"
                    value={profile.linkedin}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  />
                ) : (
                  <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="info-link">
                    {profile.linkedin}
                  </a>
                )}
              </div>
            )}
            {profile.github && (
              <div className="info-item">
                <label className="info-label">GitHub</label>
                {isEditing ? (
                  <input 
                    type="url" 
                    className="info-input"
                    value={profile.github}
                    onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                  />
                ) : (
                  <a href={`https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="info-link">
                    {profile.github}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
