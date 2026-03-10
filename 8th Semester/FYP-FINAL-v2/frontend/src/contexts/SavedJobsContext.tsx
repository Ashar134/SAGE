import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

// ============================================================================
// TYPES
// ============================================================================

interface SavedJobsContextType {
    savedJobIds: Set<number | string>;
    toggleSaveJob: (jobId: number | string) => void;
    isSaved: (jobId: number | string) => boolean;
    clearAllSaved: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const SavedJobsContext = createContext<SavedJobsContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export const SavedJobsProvider = ({ children }: { children: ReactNode }) => {
    const { accessToken, isAuthenticated, loading } = useAuth();
    // Initialize state directly from localStorage to avoid race conditions
    const [savedJobIds, setSavedJobIds] = useState<Set<number | string>>(() => {
        const saved = localStorage.getItem('savedJobs');
        if (saved) {
            try {
                return new Set(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved jobs from localStorage', e);
            }
        }
        return new Set();
    });

    // Fetch saved jobs from backend when component mounts or user changes
    useEffect(() => {
        const fetchSavedJobs = async () => {
            if (isAuthenticated && accessToken) {
                try {
                    const response = await fetch('http://localhost:8000/api/saved-jobs/', {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        },
                        credentials: 'include'
                    });
                    const data = await response.json();

                    if (data.success) {
                        const backendIds = data.saved_jobs.map((item: any) => item.job.id);
                        setSavedJobIds(new Set(backendIds));
                    }
                } catch (error) {
                    console.error('Failed to fetch saved jobs from backend', error);
                }
            }
        };

        fetchSavedJobs();
    }, [isAuthenticated, accessToken]);

    // Save to localStorage whenever it changes (as a local cache)
    useEffect(() => {
        localStorage.setItem('savedJobs', JSON.stringify(Array.from(savedJobIds)));
    }, [savedJobIds]);

    const toggleSaveJob = async (jobId: number | string) => {
        if (loading) return; // Wait for auth to finish initialization

        if (!isAuthenticated || !accessToken) {
            alert('Please login to save jobs');
            window.location.href = 'http://localhost:8000/auth/';
            return;
        }

        const isCurrentlySaved = savedJobIds.has(jobId);

        // Optimistic UI update
        setSavedJobIds((prev) => {
            const newSet = new Set(prev);
            if (isCurrentlySaved) {
                newSet.delete(jobId);
            } else {
                newSet.add(jobId);
            }
            return newSet;
        });

        // Sync with backend
        try {
            let response;
            if (isCurrentlySaved) {
                // DELETE if already saved
                response = await fetch(`http://localhost:8000/api/saved-jobs/${jobId}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    credentials: 'include'
                });
            } else {
                // POST if not saved
                response = await fetch('http://localhost:8000/api/saved-jobs/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ job_id: jobId }),
                    credentials: 'include'
                });
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // If it's already saved/unsaved on the server, we can ignore the error and keep our local state
                if (errorData.error === 'Job already saved' || response.status === 404) {
                    console.log('Server state already matches or handles this: ', errorData.error);
                } else {
                    throw new Error(errorData.error || `Server responded with ${response.status}`);
                }
            }
        } catch (error: any) {
            console.error('Error syncing saved job with backend:', error);
            // Revert optimistic update on failure
            setSavedJobIds((prev) => {
                const newSet = new Set(prev);
                if (isCurrentlySaved) {
                    newSet.add(jobId);
                } else {
                    newSet.delete(jobId);
                }
                return newSet;
            });
            alert(`Failed to sync saved jobs: ${error.message}`);
        }
    };

    const isSaved = (jobId: number | string) => {
        return savedJobIds.has(jobId);
    };

    const clearAllSaved = () => {
        setSavedJobIds(new Set());
        localStorage.removeItem('savedJobs');
    };

    return (
        <SavedJobsContext.Provider value={{ savedJobIds, toggleSaveJob, isSaved, clearAllSaved }}>
            {children}
        </SavedJobsContext.Provider>
    );
};

export const useSavedJobs = () => {
    const context = useContext(SavedJobsContext);
    if (context === undefined) {
        throw new Error('useSavedJobs must be used within a SavedJobsProvider');
    }
    return context;
};
