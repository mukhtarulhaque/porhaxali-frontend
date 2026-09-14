import { createContext, useCallback, useEffect, useState } from "react";
import Axios from "../../api/Axios";
import { GET_CURRENT_USER } from "../../api/Urls";

const AuthContext = createContext({});

const AUTH_STORAGE_KEY = "porhaxaliAuth";

const readStoredAuth = () => {
    try {
        const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        return savedAuth ? JSON.parse(savedAuth) : {};
    } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return {};
    }
};

export const AuthProvider = ({children}) => {
    const [auth, setAuthState] = useState(() => {
        const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        try {
            return savedAuth ? JSON.parse(savedAuth) : {};
        } catch {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            return {};
        }
    });

    useEffect(() => {
        if (auth?.accessToken || auth?.jwtToken) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }, [auth]);

    useEffect(() => {
        const handleAuthUpdated = (event) => {
            setAuthState(event.detail ?? {});
        };

        window.addEventListener("porhaxaliAuthUpdated", handleAuthUpdated);
        return () => window.removeEventListener("porhaxaliAuthUpdated", handleAuthUpdated);
    }, []);

    const setAuth = useCallback((nextAuth) => {
        const accessToken = nextAuth?.accessToken ?? nextAuth?.jwtToken;
        setAuthState({
            ...nextAuth,
            accessToken,
            jwtToken: accessToken,
        });
    }, []);

    const clearAuth = useCallback(() => {
        setAuthState({});
    }, []);

    const refreshCurrentUser = useCallback(async (token, sessionAuth = {}) => {
        const activeToken = token ?? auth?.accessToken ?? auth?.jwtToken;
        if (!activeToken) {
            return null;
        }

        const response = await Axios.get(GET_CURRENT_USER, {
            headers: {
                Authorization: `Bearer ${activeToken}`,
                Accept: "application/json",
            },
        });

        const user = response.data.data;
        const storedAuth = readStoredAuth();
        const latestAccessToken = storedAuth.accessToken ?? storedAuth.jwtToken ?? activeToken;
        const latestRefreshToken = storedAuth.refreshToken ?? sessionAuth.refreshToken ?? auth?.refreshToken;
        const refreshedAuth = {
            accessToken: latestAccessToken,
            jwtToken: latestAccessToken,
            refreshToken: latestRefreshToken,
            userId: user.id,
            userEmail: user.email,
            userName: user.userName,
            userRole: user.role,
            enabled: user.enabled,
            emailVerified: user.emailVerified,
            studentProfileCompletion: user.studentProfileCompletion,
        };

        setAuthState(refreshedAuth);
        return refreshedAuth;
    }, [auth?.accessToken, auth?.jwtToken, auth?.refreshToken]);

    const updateStudentProfileState = useCallback((studentProfile) => {
        setAuthState((prev) => ({
            ...prev,
            studentProfile,
            studentProfileCompletion: studentProfile?.completionSummary ?? prev.studentProfileCompletion,
        }));
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth, clearAuth, refreshCurrentUser, updateStudentProfileState }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;
