import { useEffect, useState } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import Navbar from "../pages/commom/Navbar";
import UseAuth from "../Hooks/UseAuth";
import { BarLoader } from "react-spinners";

const RequireAuth = () => {
    const { auth, clearAuth, refreshCurrentUser } = UseAuth();
    const location = useLocation();

    const [isCheckingSession, setIsCheckingSession] = useState(Boolean(auth?.jwtToken && !auth?.userEmail));

    useEffect(() => {
        const loadCurrentUser = async () => {
            if (!auth?.jwtToken || auth?.userEmail) {
                setIsCheckingSession(false);
                return;
            }

            try {
                await refreshCurrentUser(auth.jwtToken);
            } catch (error) {
                console.error("Unable to refresh current user", error);
                clearAuth();
            } finally {
                setIsCheckingSession(false);
            }
        };

        loadCurrentUser();
    }, [auth?.jwtToken, auth?.userEmail, clearAuth, refreshCurrentUser]);

    if (isCheckingSession) {
        return (
            <div className="flex h-screen items-center justify-center">
                <BarLoader color="#36d7b7" loading={isCheckingSession} width={200} aria-label="Loading Bar" />
            </div>
        );
    }

    return (

        //  auth?.userEmail
        auth?.jwtToken
            ? <>
                <Navbar />
                <Outlet />
            </>

            : <Navigate to="/" state={{ from: location }} replace />

    );
}
export default RequireAuth;
