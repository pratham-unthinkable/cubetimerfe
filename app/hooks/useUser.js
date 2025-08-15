"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient } from "../utils/fetch";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const router = useRouter();
    // Load user if token exists
    const getStats = async () => {
        let token = null;
        const stored = localStorage.getItem("token");
        token = stored ? JSON.parse(stored).token : null;

        const res = await apiClient('https://cubetimerbackend.onrender.com/api/v1/user/stats', {
            method: "GET",
            headers: { authorization: `Bearer ${token}` }
        });
        setStats(res.data);
    }

    const addLog = async (data) => {
        let token = null;
        const stored = localStorage.getItem("token");
        token = stored ? JSON.parse(stored).token : null;

        const res = await apiClient('https://cubetimerbackend.onrender.com/api/v1/user/logs', {
            method: "POST",
            data: { logs: data },
            headers: { authorization: `Bearer ${token}` }
        });
        getStats();
    }    

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoadingUser(false);
            return;
        }
        getStats();
        setLoadingUser(false);
        setUser(JSON.parse(token));
    }, []);

    const login = (token, userData) => {
        setLoadingUser(true);
        localStorage.setItem("token", JSON.stringify({ ...userData, token }));
        setUser({ ...userData, token });
        router.replace('/dashboard')
        setLoadingUser(false);

    };

    const logout = () => {
        setLoadingUser(true);
        localStorage.removeItem("token");
        setUser(null);
        setLoadingUser(false);
    };

    return (
        <UserContext.Provider value={{ user, loading: loadingUser, login, logout, addLog, setStats, stats }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
