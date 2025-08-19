import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { api } from '../api';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    login: (userId: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'project_dashboard_user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkStoredUser = async () => {
            const storedUserJson = localStorage.getItem(USER_STORAGE_KEY);
            if (storedUserJson) {
                try {
                    const storedUser: User = JSON.parse(storedUserJson);
                    // Re-validate the user with the backend
                    const freshUser = await api.login(storedUser.id);
                    setUser(freshUser);
                } catch (error) {
                    console.error("Failed to re-authenticate stored user", error);
                    localStorage.removeItem(USER_STORAGE_KEY);
                }
            }
            setIsLoading(false);
        };
        checkStoredUser();
    }, []);

    const login = useCallback(async (userId: string) => {
        setIsLoading(true);
        try {
            const loggedInUser = await api.login(userId);
            setUser(loggedInUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
