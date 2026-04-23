import React from 'react';
import './Skeleton.css';

// ============================================================================
// BASE SKELETON COMPONENTS
// ============================================================================

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
    style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width,
    height,
    borderRadius,
    className = '',
    style = {}
}) => (
    <div
        className={`skeleton ${className}`}
        style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
            ...style
        }}
    />
);

// ============================================================================
// LOGIN REQUIRED BANNER
// ============================================================================

interface LoginRequiredBannerProps {
    message?: string;
}

export const LoginRequiredBanner: React.FC<LoginRequiredBannerProps> = ({
    message = "Please log in to access your personalized content"
}) => (
    <div className="premium-login-alert">
        <div className="alert-content">
            <div className="alert-message">
                {message}
            </div>
        </div>
    </div>
);

// ============================================================================
// HOME PAGE SKELETON
// ============================================================================

export const HomePageSkeleton: React.FC = () => (
    <div className="home-skeleton">
        {/* Hero Skeleton */}
        <div className="skeleton-hero">
            <div className="skeleton-hero-content">
                <div className="skeleton skeleton-hero-tag" />
                <div className="skeleton skeleton-hero-title" />
                <div className="skeleton skeleton-hero-subtitle" />
            </div>
            <div className="skeleton-hero-graphics">
                <div className="skeleton skeleton-shape skeleton-shape-1" />
                <div className="skeleton skeleton-shape skeleton-shape-2" />
                <div className="skeleton skeleton-shape skeleton-shape-3" />
            </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="skeleton-search-container">
            <div className="skeleton-search-bar">
                <div className="skeleton skeleton-search-input" />
                <div className="skeleton skeleton-search-input" />
                <div className="skeleton skeleton-search-btn" />
            </div>
        </div>

        {/* Main Layout Skeleton */}
        <div className="skeleton-main-layout">
            {/* Sidebar Skeleton */}
            <div className="skeleton-sidebar">
                <div className="skeleton-filter-header">
                    <div className="skeleton skeleton-filter-title" />
                    <div className="skeleton skeleton-filter-clear" />
                </div>

                {/* Date Posted Filter */}
                <div className="skeleton-filter-group">
                    <div className="skeleton skeleton-filter-group-title" />
                    <div className="skeleton skeleton-select" />
                </div>

                {/* Job Type Filter */}
                <div className="skeleton-filter-group">
                    <div className="skeleton skeleton-filter-group-title" />
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton-checkbox-item">
                            <div className="skeleton skeleton-checkbox" />
                            <div className="skeleton skeleton-checkbox-text" />
                        </div>
                    ))}
                </div>

                {/* Work Location Filter */}
                <div className="skeleton-filter-group">
                    <div className="skeleton skeleton-filter-group-title" />
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton-checkbox-item">
                            <div className="skeleton skeleton-checkbox" />
                            <div className="skeleton skeleton-checkbox-text" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Job List Section Skeleton */}
            <div className="skeleton-job-section">
                <div className="skeleton-results-header">
                    <div className="skeleton skeleton-results-count" />
                </div>

                <div className="skeleton-job-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <JobCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// ============================================================================
// JOB CARD SKELETON
// ============================================================================

export const JobCardSkeleton: React.FC = () => (
    <div className="skeleton-job-card">
        <div className="skeleton-job-card-top">
            <div className="skeleton skeleton-company-logo" />
            <div className="skeleton skeleton-bookmark-btn" />
        </div>
        <div className="skeleton-job-meta">
            <div className="skeleton skeleton-company-name" />
            <div className="skeleton skeleton-posted-time" />
        </div>
        <div className="skeleton skeleton-job-title" />
        <div className="skeleton-job-tags">
            <div className="skeleton skeleton-job-tag" />
            <div className="skeleton skeleton-job-tag" />
        </div>
        <div className="skeleton-job-spacer" />
        <div className="skeleton skeleton-job-location" />
    </div>
);

// ============================================================================
// JOB PAGE SKELETON
// ============================================================================

export const JobPageSkeleton: React.FC = () => (
    <div className="job-page-skeleton">
        {/* Header */}
        <div className="skeleton-job-header">
            <div className="skeleton skeleton-job-page-title" />
            <div className="skeleton skeleton-job-page-subtitle" />
        </div>

        {/* Tabs */}
        <div className="skeleton-job-tabs">
            <div className="skeleton skeleton-tab" />
            <div className="skeleton skeleton-tab" />
        </div>

        {/* Container */}
        <div className="skeleton-jobs-container">
            {/* Jobs List */}
            <div className="skeleton-jobs-list">
                {[1, 2, 3, 4, 5].map(i => (
                    <JobItemSkeleton key={i} />
                ))}
            </div>

            {/* Job Details */}
            <div className="skeleton-job-detail">
                <div className="skeleton-detail-header">
                    <div className="skeleton-detail-top">
                        <div className="skeleton skeleton-detail-logo" />
                        <div className="skeleton-detail-info">
                            <div className="skeleton skeleton-detail-title" />
                            <div className="skeleton skeleton-detail-company" />
                            <div className="skeleton-detail-meta">
                                <div className="skeleton skeleton-detail-meta-item" />
                                <div className="skeleton skeleton-detail-meta-item" />
                                <div className="skeleton skeleton-detail-meta-item" />
                            </div>
                        </div>
                    </div>
                    <div className="skeleton skeleton-apply-btn" />
                </div>

                <div className="skeleton-detail-salary">
                    <div className="skeleton skeleton-salary-label" />
                    <div className="skeleton skeleton-salary-value" />
                </div>

                <div className="skeleton-detail-section">
                    <div className="skeleton skeleton-section-title" />
                    <div className="skeleton skeleton-section-text" />
                </div>

                <div className="skeleton-detail-section">
                    <div className="skeleton skeleton-section-title" />
                    <div className="skeleton-section-list">
                        <div className="skeleton skeleton-list-item" />
                        <div className="skeleton skeleton-list-item" />
                        <div className="skeleton skeleton-list-item" />
                        <div className="skeleton skeleton-list-item" />
                    </div>
                </div>

                <div className="skeleton-detail-section">
                    <div className="skeleton skeleton-section-title" />
                    <div className="skeleton-section-list">
                        <div className="skeleton skeleton-list-item" />
                        <div className="skeleton skeleton-list-item" />
                        <div className="skeleton skeleton-list-item" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ============================================================================
// JOB ITEM SKELETON (for list view)
// ============================================================================

export const JobItemSkeleton: React.FC = () => (
    <div className="skeleton-job-item">
        <div className="skeleton-job-item-top">
            <div className="skeleton skeleton-job-item-logo" />
            <div className="skeleton-job-item-info">
                <div className="skeleton skeleton-job-item-title" />
                <div className="skeleton skeleton-job-item-company" />
            </div>
        </div>
        <div className="skeleton-job-item-meta">
            <div className="skeleton skeleton-job-item-location" />
            <div className="skeleton skeleton-job-item-time" />
        </div>
        <div className="skeleton-job-item-bottom">
            <div className="skeleton skeleton-job-item-salary" />
            <div className="skeleton skeleton-job-item-type" />
        </div>
    </div>
);

// ============================================================================
// APPLICATION PAGE SKELETON
// ============================================================================

export const ApplicationPageSkeleton: React.FC = () => (
    <div className="application-skeleton">
        {/* Header */}
        <div className="skeleton-app-header">
            <div className="skeleton skeleton-app-title" />
            <div className="skeleton skeleton-app-subtitle" />
        </div>

        {/* Tabs */}
        <div className="skeleton-app-tabs">
            <div className="skeleton skeleton-tab" />
            <div className="skeleton skeleton-tab" />
            <div className="skeleton skeleton-tab" />
        </div>

        {/* Kanban Board */}
        <div className="skeleton-kanban">
            {[1, 2, 3, 4, 5].map(colIdx => (
                <div key={colIdx} className="skeleton-kanban-column">
                    <div className="skeleton-column-header">
                        <div className="skeleton skeleton-column-title" />
                        <div className="skeleton skeleton-column-count" />
                    </div>
                    {[1, 2].map(cardIdx => (
                        <ApplicationCardSkeleton key={cardIdx} />
                    ))}
                </div>
            ))}
        </div>
    </div>
);

// ============================================================================
// APPLICATION CARD SKELETON
// ============================================================================

export const ApplicationCardSkeleton: React.FC = () => (
    <div className="skeleton-app-card">
        <div className="skeleton-app-card-header">
            <div className="skeleton skeleton-app-logo" />
        </div>
        <div className="skeleton skeleton-app-card-title" />
        <div className="skeleton skeleton-app-card-company" />
        <div className="skeleton skeleton-app-card-meta" />
        <div className="skeleton-app-card-footer">
            <div className="skeleton skeleton-app-salary" />
            <div className="skeleton skeleton-app-date" />
        </div>
    </div>
);

// ============================================================================
// PROFILE PAGE SKELETON
// ============================================================================

export const ProfilePageSkeleton: React.FC = () => (
    <div className="tabs-container skeleton-fade-in">
        <div className="onboarding-tabs" style={{ marginBottom: '0', position: 'relative' }}>
            <div className="tab-button">
                <Skeleton width={100} height={14} />
            </div>
            <div className="tab-button">
                <Skeleton width={100} height={14} />
            </div>
        </div>

        <div className="tab-content">
            <div className="review-tab-layout">
                <div className="review-main-grid">
                    {/* Left Column: Basics, Summary & Skills */}
                    <div className="review-col review-col-left">
                        <div className="summary-preview-section">
                            <div className="summary-section-header">
                                <Skeleton width={130} height={18} />
                                <div className="skeleton-edit-btn" />
                            </div>
                            <div className="summary-content">
                                <div className="summary-details-grid">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="detail-row">
                                            <Skeleton width={70} height={14} />
                                            <Skeleton width={200} height={14} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="summary-preview-section">
                            <div className="summary-section-header">
                                <Skeleton width={160} height={18} />
                                <div className="skeleton-edit-btn" />
                            </div>
                            <div className="summary-content">
                                <div className="skeleton-text-line" style={{ width: '100%' }} />
                                <div className="skeleton-text-line" style={{ width: '92%' }} />
                                <div className="skeleton-text-line" style={{ width: '96%' }} />
                                <div className="skeleton-text-line" style={{ width: '75%' }} />
                            </div>
                        </div>

                        <div className="summary-preview-section">
                            <div className="summary-section-header">
                                <Skeleton width={110} height={18} />
                                <div className="skeleton-edit-btn" />
                            </div>
                            <div className="summary-content">
                                <div className="summary-skills-list">
                                    {[80, 100, 70, 90, 110, 60, 95].map((w, i) => (
                                        <Skeleton key={i} width={w} height={32} borderRadius={8} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Key Professional History */}
                    <div className="review-col review-col-right">
                        {/* Work Experience */}
                        <div className="summary-preview-section">
                            <div className="summary-section-header">
                                <Skeleton width={140} height={18} />
                                <div className="skeleton-edit-btn" />
                            </div>
                            <div className="summary-content">
                                {[1, 2].map(i => (
                                    <div key={i} className="summary-item">
                                        <Skeleton width="70%" height={16} style={{ marginBottom: '8px' }} />
                                        <Skeleton width="50%" height={14} style={{ marginBottom: '8px' }} />
                                        <Skeleton width="30%" height={12} style={{ marginBottom: '12px' }} />
                                        <div className="skeleton-text-line" style={{ width: '95%' }} />
                                        <div className="skeleton-text-line" style={{ width: '85%' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="summary-preview-section">
                            <div className="summary-section-header">
                                <Skeleton width={100} height={18} />
                                <div className="skeleton-edit-btn" />
                            </div>
                            <div className="summary-content">
                                {[1, 2].map(i => (
                                    <div key={i} className="summary-item">
                                        <Skeleton width="60%" height={16} style={{ marginBottom: '8px' }} />
                                        <Skeleton width="45%" height={14} style={{ marginBottom: '8px' }} />
                                        <Skeleton width="25%" height={12} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Projects */}
                        <div className="summary-preview-section">
                            <div className="summary-section-header">
                                <Skeleton width={150} height={18} />
                                <div className="skeleton-edit-btn" />
                            </div>
                            <div className="summary-content">
                                <div className="summary-item">
                                    <Skeleton width="55%" height={16} style={{ marginBottom: '8px' }} />
                                    <Skeleton width="40%" height={14} style={{ marginBottom: '8px' }} />
                                    <div className="skeleton-text-line" style={{ width: '90%' }} />
                                </div>
                            </div>
                        </div>

                        {/* Research */}
                        <div className="summary-preview-section">
                            <div className="summary-section-header">
                                <Skeleton width={120} height={18} />
                                <div className="skeleton-edit-btn" />
                            </div>
                            <div className="summary-content">
                                <div className="summary-item">
                                    <Skeleton width="65%" height={16} style={{ marginBottom: '8px' }} />
                                    <Skeleton width="50%" height={14} style={{ marginBottom: '8px' }} />
                                    <div className="skeleton-text-line" style={{ width: '92%' }} />
                                </div>
                            </div>
                        </div>

                        {/* Certifications */}
                        <div className="summary-preview-section">
                            <div className="summary-section-header">
                                <Skeleton width={110} height={18} />
                                <div className="skeleton-edit-btn" />
                            </div>
                            <div className="summary-content">
                                <div className="summary-item">
                                    <Skeleton width="50%" height={16} style={{ marginBottom: '8px' }} />
                                    <Skeleton width="40%" height={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ============================================================================
// TEST PAGE SKELETON
// ============================================================================

export const TestPageSkeleton: React.FC = () => (
    <div className="skeleton-test-container">
        {/* Instructions Section */}
        <div className="skeleton-test-card">
            <div className="skeleton skeleton-test-instruction-title" />
            <div className="skeleton skeleton-test-text" />
            <div className="skeleton skeleton-test-text" />
            <div className="skeleton skeleton-test-text" style={{ width: '80%' }} />

            <div className="skeleton-test-footer">
                <div className="skeleton skeleton-test-btn" />
                <div className="skeleton skeleton-test-btn" style={{ width: '120px', height: '44px' }} />
            </div>
        </div>

        {/* Question Skeleton */}
        <div className="skeleton-test-card">
            <div className="skeleton skeleton-test-question-title" />
            <div className="skeleton skeleton-test-text" style={{ height: '24px', marginBottom: '24px' }} />

            {/* Options */}
            <div className="skeleton-test-options">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="skeleton-test-option">
                        <div className="skeleton skeleton-test-radio" />
                        <div className="skeleton skeleton-test-option-text" />
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton skeleton-test-btn" />
                <div className="skeleton skeleton-test-btn" />
            </div>
        </div>
    </div>
);

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    Skeleton,
    LoginRequiredBanner,
    HomePageSkeleton,
    JobCardSkeleton,
    JobPageSkeleton,
    JobItemSkeleton,
    ApplicationPageSkeleton,
    ApplicationCardSkeleton,
    ProfilePageSkeleton,
    TestPageSkeleton
};
