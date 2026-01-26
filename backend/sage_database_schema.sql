-- ============================================================================
-- SAGE (Smart Application Guidance Engine) - Complete PostgreSQL Database Setup
-- ============================================================================
-- This file contains ALL PostgreSQL queries used in the project
-- You can run this entire file to set up your database from scratch
-- ============================================================================
-- Author: SAGE Team
-- Last Updated: January 2026
-- Database: PostgreSQL 12+
-- ============================================================================

-- ============================================================================
-- PART 1: MAIN DATABASE SCHEMA
-- ============================================================================
-- This schema supports a comprehensive job application tracking system
-- with user profiles, job listings, applications, and CV parsing features
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Extends Supabase Auth with additional user profile information
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    
    -- Password for direct authentication (not using Supabase Auth)
    password_hash TEXT,
    
    -- Address Information
    street_address TEXT,
    city_state TEXT,
    postal_code TEXT,
    country TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- USER SKILLS TABLE
-- ============================================================================
-- Stores user skills categorized by type
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_type TEXT NOT NULL CHECK (skill_type IN ('language', 'framework', 'tool', 'soft_skill')),
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_of_experience NUMERIC(3,1),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, skill_name, skill_type)
);

-- ============================================================================
-- EDUCATION TABLE
-- ============================================================================
-- Stores user education history
CREATE TABLE IF NOT EXISTS education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    degree TEXT NOT NULL,
    school TEXT NOT NULL,
    field_of_study TEXT,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    gpa NUMERIC(3,2),
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- WORK EXPERIENCE TABLE
-- ============================================================================
-- Stores user work experience history
CREATE TABLE IF NOT EXISTS work_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    responsibilities TEXT[], -- Array of responsibility bullets
    achievements TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMPANIES TABLE
-- ============================================================================
-- Stores company information for jobs
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    logo_color TEXT DEFAULT '#6366f1',
    logo_initial TEXT,
    industry TEXT,
    company_size TEXT,
    website_url TEXT,
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- JOBS TABLE
-- ============================================================================
-- Stores job listings
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    -- Basic Information
    title TEXT NOT NULL,
    company_name TEXT NOT NULL, -- Denormalized for quick access
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Job Details
    job_type TEXT[] DEFAULT ARRAY['Full-time'], -- Full-time, Part-time, Internship, Freelance, Volunteer
    work_mode TEXT[] DEFAULT ARRAY['On-site'], -- Remote, Hybrid, On-site
    salary_min NUMERIC(10,2),
    salary_max NUMERIC(10,2),
    salary_currency TEXT DEFAULT 'USD',
    
    -- Requirements & Bullets
    requirements TEXT[],
    responsibilities TEXT[],
    benefits TEXT[],
    
    -- Metadata
    is_remote BOOLEAN DEFAULT FALSE,
    posted_date TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    source_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);

-- ============================================================================
-- SAVED JOBS TABLE
-- ============================================================================
-- Tracks jobs saved/bookmarked by users
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    notes TEXT,
    
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);

-- ============================================================================
-- APPLICATIONS TABLE
-- ============================================================================
-- Tracks job applications submitted by users
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    
    -- Job Information (denormalized for historical tracking)
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_logo_color TEXT DEFAULT '#6366f1',
    company_logo_initial TEXT,
    location TEXT,
    salary_range TEXT,
    
    -- Application Status
    status TEXT NOT NULL DEFAULT 'applied' 
        CHECK (status IN ('applied', 'reviewing', 'interview', 'test', 'offer', 'rejected', 'withdrawn', 'accepted')),
    
    -- Interview/Test Information
    interview_type TEXT CHECK (interview_type IN ('phone_screen', 'technical', 'behavioral', 'panel', 'test', 'assessment')),
    interview_date TIMESTAMPTZ,
    interview_notes TEXT,
    
    -- Tracking
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    last_status_update TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional Information
    cover_letter TEXT,
    resume_url TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at DESC);

-- ============================================================================
-- APPLICATION TIMELINE TABLE
-- ============================================================================
-- Tracks status changes and events in the application process
CREATE TABLE IF NOT EXISTS application_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    
    event_type TEXT NOT NULL CHECK (event_type IN (
        'status_change', 'interview_scheduled', 'interview_completed', 
        'test_scheduled', 'test_completed', 'note_added', 'document_submitted'
    )),
    
    old_status TEXT,
    new_status TEXT,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_application_id ON application_timeline(application_id);
CREATE INDEX IF NOT EXISTS idx_timeline_event_date ON application_timeline(event_date DESC);

-- ============================================================================
-- CV/RESUME UPLOADS TABLE
-- ============================================================================
-- Stores parsed CV/resume information
CREATE TABLE IF NOT EXISTS cv_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    
    -- Parsed Information
    parsed_data JSONB, -- Stores the complete parsed CV data
    parse_status TEXT DEFAULT 'pending' CHECK (parse_status IN ('pending', 'processing', 'completed', 'failed')),
    parse_error TEXT,
    
    is_primary BOOLEAN DEFAULT FALSE, -- Mark the primary/active CV
    
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    parsed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cv_uploads_user_id ON cv_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_uploads_is_primary ON cv_uploads(is_primary);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
-- Stores user notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'application_update', 'interview_reminder', 'new_job', 'system'
    )),
    
    related_application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    related_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- JOB SEARCH FILTERS TABLE
-- ============================================================================
-- Stores user's saved job search filters/preferences
CREATE TABLE IF NOT EXISTS saved_filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    filter_name TEXT NOT NULL,
    filter_data JSONB NOT NULL, -- Stores the complete filter configuration
    
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON saved_filters(user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_skills_updated_at ON user_skills;
CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON user_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_education_updated_at ON education;
CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_work_experience_updated_at ON work_experience;
CREATE TRIGGER update_work_experience_updated_at BEFORE UPDATE ON work_experience
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cv_uploads_updated_at ON cv_uploads;
CREATE TRIGGER update_cv_uploads_updated_at BEFORE UPDATE ON cv_uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_filters_updated_at ON saved_filters;
CREATE TRIGGER update_saved_filters_updated_at BEFORE UPDATE ON saved_filters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create timeline entry when application status changes
CREATE OR REPLACE FUNCTION create_application_timeline_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
        INSERT INTO application_timeline (
            application_id,
            event_type,
            old_status,
            new_status,
            title,
            description
        ) VALUES (
            NEW.id,
            'status_change',
            OLD.status,
            NEW.status,
            'Status changed to ' || INITCAP(NEW.status),
            'Application status updated from ' || INITCAP(OLD.status) || ' to ' || INITCAP(NEW.status)
        );
        
        NEW.last_status_update = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS application_status_change_trigger ON applications;
CREATE TRIGGER application_status_change_trigger
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION create_application_timeline_on_status_change();

-- Function to enforce only one primary CV per user
CREATE OR REPLACE FUNCTION enforce_single_primary_cv()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        -- Set all other CVs for this user to not primary
        UPDATE cv_uploads
        SET is_primary = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_primary_cv_trigger ON cv_uploads;
CREATE TRIGGER enforce_primary_cv_trigger
    BEFORE INSERT OR UPDATE ON cv_uploads
    FOR EACH ROW
    EXECUTE FUNCTION enforce_single_primary_cv();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for active applications with job details
CREATE OR REPLACE VIEW user_active_applications AS
SELECT 
    a.id,
    a.user_id,
    a.job_title,
    a.company_name,
    a.company_logo_color,
    a.company_logo_initial,
    a.location,
    a.salary_range,
    a.status,
    a.interview_type,
    a.interview_date,
    a.applied_at,
    a.last_status_update,
    j.id as job_id,
    j.description as job_description
FROM applications a
LEFT JOIN jobs j ON a.job_id = j.id
WHERE a.status NOT IN ('rejected', 'withdrawn', 'accepted');

-- View for user statistics
CREATE OR REPLACE VIEW user_application_stats AS
SELECT 
    user_id,
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'applied') as applied_count,
    COUNT(*) FILTER (WHERE status = 'reviewing') as reviewing_count,
    COUNT(*) FILTER (WHERE status = 'interview') as interview_count,
    COUNT(*) FILTER (WHERE status = 'test') as test_count,
    COUNT(*) FILTER (WHERE status = 'offer') as offer_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
    COUNT(*) FILTER (WHERE status NOT IN ('rejected', 'withdrawn', 'accepted')) as active_count
FROM applications
GROUP BY user_id;

-- ============================================================================
-- PART 2: SAMPLE DATA POPULATION
-- ============================================================================
-- Insert sample companies and jobs for testing
-- ============================================================================

-- Insert sample companies
INSERT INTO companies (id, name, logo_color, logo_initial, industry) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Google', '#4285f4', 'G', 'Technology'),
    ('22222222-2222-2222-2222-222222222222', 'Apple', '#000000', '', 'Technology'),
    ('33333333-3333-3333-3333-333333333333', 'Meta', '#0668E1', 'M', 'Technology'),
    ('44444444-4444-4444-4444-444444444444', 'Netflix', '#E50914', 'N', 'Entertainment'),
    ('55555555-5555-5555-5555-555555555555', 'Airbnb', '#FF5A5F', 'A', 'Travel'),
    ('66666666-6666-6666-6666-666666666666', 'Spotify', '#1DB954', 'S', 'Music')
ON CONFLICT (name) DO NOTHING;

-- Insert sample jobs
INSERT INTO jobs (
  company_id,
  title,
  company_name,
  location,
  description,
  job_type,
  work_mode,
  salary_min,
  salary_max,
  salary_currency,
  requirements,
  responsibilities,
  benefits,
  is_remote,
  is_active
)
VALUES
-- Google Jobs
(
  '11111111-1111-1111-1111-111111111111',
  'Senior Product Designer',
  'Google',
  'Mountain View, CA',
  'Create world-class product experiences for billions of users. Join our design team to shape the future of how people interact with technology.',
  ARRAY['Full-time'],
  ARRAY['Hybrid'],
  120000,
  180000,
  'USD',
  ARRAY['5+ years of product design experience', 'Expert in Figma and design systems', 'Strong portfolio showcasing user-centered design', 'Experience leading design projects'],
  ARRAY['Lead design initiatives for core products', 'Collaborate with cross-functional teams', 'Create high-fidelity prototypes', 'Conduct user research and testing'],
  ARRAY['Health insurance', '401k matching', 'Free meals', 'Gym membership', 'Stock options'],
  false,
  true
),
-- Apple Jobs
(
  '22222222-2222-2222-2222-222222222222',
  'Human Interface Designer',
  'Apple',
  'Cupertino, CA',
  'Design the future of Apple products. Work on cutting-edge interfaces that millions of users will interact with daily.',
  ARRAY['Full-time'],
  ARRAY['On-site'],
  150000,
  220000,
  'USD',
  ARRAY['7+ years of HCI or product design experience', 'Deep understanding of iOS design principles', 'Strong visual design skills', 'Passion for detail and craft'],
  ARRAY['Design intuitive user interfaces', 'Collaborate with engineering teams', 'Create design specifications', 'Present to leadership'],
  ARRAY['Comprehensive health coverage', 'Generous stock grants', 'Product discounts', 'Professional development', 'On-site fitness center'],
  false,
  true
),
-- Meta Jobs
(
  '33333333-3333-3333-3333-333333333333',
  'Senior UX Designer',
  'Meta',
  'Menlo Park, CA',
  'Shape the future of social connection and virtual reality. Design experiences used by billions worldwide.',
  ARRAY['Full-time'],
  ARRAY['Hybrid'],
  130000,
  190000,
  'USD',
  ARRAY['5+ years of UX design experience', 'Experience with AR/VR design', 'Strong prototyping skills', 'Data-driven mindset'],
  ARRAY['Design next-generation social features', 'Create VR experiences', 'Run user testing sessions', 'Collaborate with PM and engineering'],
  ARRAY['Health and wellness benefits', 'Equity compensation', 'Remote work stipend', 'Learning budget', 'Parental leave'],
  false,
  true
),
-- Netflix Jobs
(
  '44444444-4444-4444-4444-444444444444',
  'UI/UX Designer',
  'Netflix',
  'Los Gatos, CA',
  'Design experiences that entertain millions worldwide. Be part of our creative team pushing the boundaries of streaming media.',
  ARRAY['Full-time'],
  ARRAY['Remote'],
  110000,
  160000,
  'USD',
  ARRAY['4+ years of UI/UX design experience', 'Strong visual design portfolio', 'Experience with responsive design', 'Familiar with A/B testing'],
  ARRAY['Design streaming interfaces', 'Create mobile and TV experiences', 'Collaborate with content teams', 'Iterate based on user data'],
  ARRAY['Unlimited vacation', 'Competitive salary', 'Stock options', 'Wellness programs', '100% remote'],
  true,
  true
),
-- Airbnb Jobs
(
  '55555555-5555-5555-5555-555555555555',
  'Interaction Designer',
  'Airbnb',
  'San Francisco, CA',
  'Design delightful experiences for travelers and hosts worldwide. Join our mission to create a world where anyone can belong anywhere.',
  ARRAY['Full-time'],
  ARRAY['Hybrid'],
  115000,
  170000,
  'USD',
  ARRAY['5+ years of interaction design experience', 'Strong motion design skills', 'Experience with cross-platform design', 'Excellent communication skills'],
  ARRAY['Design core booking flows', 'Create micro-interactions', 'Work with global design team', 'Present work to stakeholders'],
  ARRAY['Quarterly travel credit', 'Health benefits', 'Equity grants', 'Work from anywhere', 'Professional growth'],
  false,
  true
),
-- Spotify Jobs
(
  '66666666-6666-6666-6666-666666666666',
  'Visual Designer',
  'Spotify',
  'New York, NY',
  'Create stunning visual designs for the world''s leading music streaming platform. Shape how millions discover and enjoy music.',
  ARRAY['Full-time'],
  ARRAY['Remote'],
  100000,
  150000,
  'USD',
  ARRAY['3+ years of visual design experience', 'Strong typography and color theory', 'Experience with brand design', 'Music industry passion'],
  ARRAY['Design marketing campaigns', 'Create visual assets', 'Maintain brand consistency', 'Collaborate with product design'],
  ARRAY['Premium Spotify account', 'Concert tickets', 'Flexible schedule', 'Remote first', 'Health insurance'],
  true,
  true
),
-- Additional Remote Jobs
(
  '11111111-1111-1111-1111-111111111111',
  'Product Designer - Remote',
  'Google',
  'Remote',
  'Work remotely while designing products used by billions. Collaborate with teams across the globe.',
  ARRAY['Full-time'],
  ARRAY['Remote'],
  110000,
  165000,
  'USD',
  ARRAY['4+ years of product design experience', 'Remote work experience', 'Strong communication skills', 'Self-motivated and organized'],
  ARRAY['Design cloud products', 'Remote collaboration', 'Async communication', 'Present designs virtually'],
  ARRAY['Remote work stipend', 'Health insurance', 'Learning budget', 'Stock options', 'Flexible hours'],
  true,
  true
),
(
  '33333333-3333-3333-3333-333333333333',
  'VR/AR Designer',
  'Meta',
  'Remote',
  'Pioneer the future of virtual and augmented reality. Design immersive experiences from anywhere in the world.',
  ARRAY['Full-time'],
  ARRAY['Remote'],
  140000,
  200000,
  'USD',
  ARRAY['3+ years of VR/AR design experience', 'Experience with Unity or Unreal', '3D design skills', 'Portfolio of VR projects'],
  ARRAY['Design VR applications', 'Create AR experiences', 'Test in immersive environments', 'Innovate new interactions'],
  ARRAY['VR headset provided', 'Remote setup budget', 'Equity compensation', 'Flexible schedule', 'Team gatherings'],
  true,
  true
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
-- Database schema created successfully!
-- ============================================================================
