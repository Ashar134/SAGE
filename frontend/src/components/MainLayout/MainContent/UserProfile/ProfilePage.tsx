import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import Header from '../../../MainLayout/Header/Header';
import { ProfilePageSkeleton } from '../../../Skeletons/Skeletons';
import './ProfilePage.css';
import '../../../Onboarding/CvOnboarding.css';

interface Skill {
    id: string;
    skill_name: string;
    skill_type: string;
}

interface Education {
    id: string;
    degree: string;
    school: string;
    description: string;
}

interface Experience {
    id: string;
    job_title: string;
    company: string;
    description: string;
}

interface ProjectItem {
    id: string;
    title: string;
    organization: string;
    period: string;
    details: string;
}

interface CertificateItem {
    id: string;
    name: string;
    issuer: string;
    year: string;
}

interface ResearchItem {
    id: string;
    title: string;
    organization: string;
    period: string;
    details: string;
}

interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    bio: string;
    city_state: string;
    country: string;
    skills: Skill[];
    education: Education[];
    work_experience: Experience[];
    certificates: CertificateItem[];
    research: ResearchItem[];
    projects: ProjectItem[];
}

const extractPeriod = (description: string): { period: string; details: string } => {
    if (!description) return { period: '', details: '' };
    const periodMatch = description.match(/^Period: (.*?)\n([\s\S]*)/i) ||
        description.match(/^Dates: (.*?)\n([\s\S]*)/i);

    if (periodMatch) {
        return {
            period: periodMatch[1].trim(),
            details: periodMatch[2].trim()
        };
    }

    // Fallback if no newline but has Period:
    const simpleMatch = description.match(/^(Period|Dates): (.*)/i);
    if (simpleMatch) {
        return { period: simpleMatch[2].trim(), details: '' };
    }

    return { period: '', details: description };
};

const API_BASE_URL = "http://localhost:8000";

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, accessToken, isAuthenticated, loading: authLoading } = useAuth();
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'summary' | 'update'>('summary');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id || !accessToken || !isAuthenticated) {
                if (!authLoading) setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    setProfileData(data.user);
                } else {
                    setError(data.error || "Failed to fetch profile");
                }
            } catch (err) {
                setError("Network error. Please try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, accessToken, isAuthenticated, authLoading]);

    if (authLoading || loading || (!isAuthenticated && !authLoading)) {
        return (
            <div className="cv-onboarding-page-container profile-page-refined">
                <Header />
                <div className="cv-onboarding-content-wrapper">
                    <div className="cv-onboarding-header-section">
                        <div>
                            <h1 className="page-title">User Profile</h1>
                            <p className="page-subtitle">Your professional identity and career summary</p>
                        </div>
                    </div>
                    <ProfilePageSkeleton />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cv-onboarding-page-container">
                <Header />
                <div className="cv-onboarding-content-wrapper">
                    <div className="validation-message error" style={{ maxWidth: '600px', margin: '40px auto' }}>
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cv-onboarding-page-container profile-page-refined">
            <Header />

            <div className="cv-onboarding-content-wrapper">
                <div className="cv-onboarding-header-section">
                    <div>
                        <h1 className="page-title">User Profile</h1>
                        <p className="page-subtitle">Your professional identity and career summary</p>
                    </div>
                </div>

                <div className="tabs-container">
                    {/* Tabs Navigation */}
                    <div className="onboarding-tabs">
                        <button
                            className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
                            onClick={() => setActiveTab('summary')}
                        >
                            Summary
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'update' ? 'active' : ''}`}
                            onClick={() => setActiveTab('update')}
                        >
                            Update Profile
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === 'summary' ? (
                            <div className="review-tab-layout fade-in">
                                <div className="review-main-grid">
                                    {/* Left Column: Basics, Summary & Skills */}
                                    <div className="review-col review-col-left">
                                        <div className="summary-preview-section">
                                            <div className="summary-section-header">
                                                <h3 className="summary-section-title">Personal Details</h3>
                                                <button className="btn-edit-section" onClick={() => navigate('/onboarding')}>Edit</button>
                                            </div>
                                            <div className="summary-content">
                                                <div className="summary-details-grid">
                                                    <div className="detail-row"><strong>Name:</strong> {profileData ? `${profileData.first_name} ${profileData.last_name}` : "Not provided"}</div>
                                                    <div className="detail-row"><strong>Headline:</strong> Not provided</div>
                                                    <div className="detail-row"><strong>Email:</strong> {profileData?.email || "Not provided"}</div>
                                                    <div className="detail-row"><strong>Phone:</strong> {profileData?.phone || "Not provided"}</div>
                                                    <div className="detail-row"><strong>Location:</strong> {profileData ? `${profileData.city_state}, ${profileData.country}` : "Not provided"}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {profileData?.bio && (
                                            <div className="summary-preview-section">
                                                <div className="summary-section-header">
                                                    <h3 className="summary-section-title">Professional Summary</h3>
                                                    <button className="btn-edit-section" onClick={() => navigate('/onboarding')}>Edit</button>
                                                </div>
                                                <div className="summary-content">
                                                    <p style={{ margin: 0 }}>{profileData.bio}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="summary-preview-section">
                                            <div className="summary-section-header">
                                                <h3 className="summary-section-title">Technical Skills</h3>
                                                <button className="btn-edit-section" onClick={() => navigate('/onboarding')}>Edit</button>
                                            </div>
                                            <div className="summary-content">
                                                {profileData?.skills && profileData.skills.length > 0 ? (
                                                    <div className="summary-skills-list">
                                                        {profileData.skills.map((skill, idx) => (
                                                            <span key={idx} className="skill-tag">{skill.skill_name}</span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="summary-empty">No skills added</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Key Professional History */}
                                    <div className="review-col review-col-right">
                                        <div className="summary-preview-section">
                                            <div className="summary-section-header">
                                                <h3 className="summary-section-title">Work Experience</h3>
                                                <button className="btn-edit-section" onClick={() => navigate('/onboarding')}>Edit</button>
                                            </div>
                                            <div className="summary-content">
                                                {profileData?.work_experience && profileData.work_experience.length > 0 ? (
                                                    profileData.work_experience.map((exp, idx) => {
                                                        const { period, details } = extractPeriod(exp.description);
                                                        return (
                                                            <div key={idx} className="summary-item">
                                                                <div className="summary-item-title"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Role:</span> {exp.job_title || 'No title'}</div>
                                                                <div className="summary-item-subtitle"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Company:</span> {exp.company || 'No organization'}</div>
                                                                {period && <div className="summary-item-meta"><span style={{ fontWeight: 500, color: '#94a3b8' }}>Date:</span> {period}</div>}
                                                                {details && <div className="summary-item-details">{details}</div>}
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="summary-empty">No work experience added</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="summary-preview-section">
                                            <div className="summary-section-header">
                                                <h3 className="summary-section-title">Education</h3>
                                                <button className="btn-edit-section" onClick={() => navigate('/onboarding')}>Edit</button>
                                            </div>
                                            <div className="summary-content">
                                                {profileData?.education && profileData.education.length > 0 ? (
                                                    profileData.education.map((edu, idx) => {
                                                        const { period } = extractPeriod(edu.description);
                                                        return (
                                                            <div key={idx} className="summary-item">
                                                                <div className="summary-item-title"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Degree:</span> {edu.degree || 'No degree'}</div>
                                                                <div className="summary-item-subtitle"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Institute:</span> {edu.school || 'No institution'}</div>
                                                                {period && <div className="summary-item-meta"><span style={{ fontWeight: 500, color: '#94a3b8' }}>Date:</span> {period}</div>}
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="summary-empty">No education added</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="summary-preview-section">
                                            <div className="summary-section-header">
                                                <h3 className="summary-section-title">Technical Projects</h3>
                                                <button className="btn-edit-section" onClick={() => navigate('/onboarding')}>Edit</button>
                                            </div>
                                            <div className="summary-content">
                                                {profileData?.projects && profileData.projects.length > 0 ? (
                                                    profileData.projects.map((proj, idx) => (
                                                        <div key={idx} className="summary-item">
                                                            <div className="summary-item-title"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Project:</span> {proj.title}</div>
                                                            <div className="summary-item-subtitle"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Organization:</span> {proj.organization}</div>
                                                            <div className="summary-item-meta"><span style={{ fontWeight: 500, color: '#94a3b8' }}>Date:</span> {proj.period}</div>
                                                            {proj.details && <div className="summary-item-details">{proj.details}</div>}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="summary-empty">No projects listed</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="summary-preview-section">
                                            <div className="summary-section-header">
                                                <h3 className="summary-section-title">Research Work</h3>
                                                <button className="btn-edit-section" onClick={() => navigate('/onboarding')}>Edit</button>
                                            </div>
                                            <div className="summary-content">
                                                {profileData?.research && profileData.research.length > 0 ? (
                                                    profileData.research.map((res, idx) => (
                                                        <div key={idx} className="summary-item">
                                                            <div className="summary-item-title"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Research:</span> {res.title}</div>
                                                            <div className="summary-item-subtitle"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Organization:</span> {res.organization}</div>
                                                            <div className="summary-item-meta"><span style={{ fontWeight: 500, color: '#94a3b8' }}>Date:</span> {res.period}</div>
                                                            {res.details && <div className="summary-item-details">{res.details}</div>}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="summary-empty">No research listed</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="summary-preview-section">
                                            <div className="summary-section-header">
                                                <h3 className="summary-section-title">Certifications</h3>
                                                <button className="btn-edit-section" onClick={() => navigate('/onboarding')}>Edit</button>
                                            </div>
                                            <div className="summary-content">
                                                {profileData?.certificates && profileData.certificates.length > 0 ? (
                                                    profileData.certificates.map((cert, idx) => (
                                                        <div key={idx} className="summary-item">
                                                            <div className="summary-item-title"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Certificate:</span> {cert.name}</div>
                                                            <div className="summary-item-subtitle"><span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.9em' }}>Issuer:</span> {cert.issuer}</div>
                                                            <div className="summary-item-meta"><span style={{ fontWeight: 500, color: '#94a3b8' }}>Year:</span> {cert.year || 'Not provided'}</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="summary-empty">No certifications listed</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="update-tab-body fade-in">
                                <div className="update-simple-container">
                                    <h2 className="update-title">Update Profile</h2>
                                    <p className="update-description">Keep your professional information current by launching the profile updater.</p>
                                    <button
                                        className="primary-btn update-btn-decent"
                                        onClick={() => navigate('/onboarding')}
                                    >
                                        Update Profile
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
