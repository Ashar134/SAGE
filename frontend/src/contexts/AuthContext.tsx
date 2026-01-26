import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_onboarded?: boolean;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (userData: User, token: string) => void;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<string | null>;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const login = (userData: User, token: string) => {
        setUser(userData);
        setAccessToken(token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            await fetch('http://localhost:8000/api/auth/logout/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('savedJobs');
        window.location.href = 'http://localhost:8000/auth/';
    };

    const refreshAccessToken = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/refresh/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // This is crucial for sending the HttpOnly cookie
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success && data.access_token) {
                setAccessToken(data.access_token);
                return data.access_token;
            } else {
                // If refresh fails, user needs to login again
                setAccessToken(null);
                return null;
            }
        } catch (error) {
            console.error('Refresh token error:', error);
            setAccessToken(null);
            return null;
        }
    }, []);

    // Initial load: try to restore session from cookie
    useEffect(() => {
        const initAuth = async () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                    await refreshAccessToken();
                } catch (e) {
                    console.error('Auth initialization error:', e);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [refreshAccessToken]);

    // Periodically refresh token before it expires (every 55 minutes for a 1-hour token)
    useEffect(() => {
        if (accessToken) {
            const interval = setInterval(() => {
                refreshAccessToken();
            }, 55 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [accessToken, refreshAccessToken]);

    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            login,
            logout,
            refreshAccessToken,
            isAuthenticated: !!accessToken,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
