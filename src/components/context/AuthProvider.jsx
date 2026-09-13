import { createContext, useCallback, useEffect, useState } from "react";
import Axios from "../../api/Axios";
import { GET_CURRENT_USER } from "../../api/Urls";

const AuthContext = createContext({});

const AUTH_STORAGE_KEY = "porhaxaliAuth";

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
        if (auth?.jwtToken) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }, [auth]);

    const setAuth = useCallback((nextAuth) => {
        setAuthState(nextAuth);
    }, []);

    const clearAuth = useCallback(() => {
        setAuthState({});
    }, []);

    const refreshCurrentUser = useCallback(async (token) => {
        const activeToken = token ?? auth?.jwtToken;
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
        const refreshedAuth = {
            jwtToken: activeToken,
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
    }, [auth?.jwtToken]);

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
