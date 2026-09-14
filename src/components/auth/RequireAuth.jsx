import { useEffect, useState } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import Navbar from "../pages/commom/Navbar";
import UseAuth from "../Hooks/UseAuth";
import { BarLoader } from "react-spinners";

const RequireAuth = () => {
    const { auth, clearAuth, refreshCurrentUser } = UseAuth();
    const location = useLocation();
    const accessToken = auth?.accessToken ?? auth?.jwtToken;

    const [isCheckingSession, setIsCheckingSession] = useState(Boolean(accessToken && !auth?.userEmail));

    useEffect(() => {
        const loadCurrentUser = async () => {
            if (!accessToken || auth?.userEmail) {
                setIsCheckingSession(false);
                return;
            }

            try {
                await refreshCurrentUser(accessToken);
            } catch (error) {
                console.error("Unable to refresh current user", error);
                clearAuth();
            } finally {
                setIsCheckingSession(false);
            }
        };

        loadCurrentUser();
    }, [accessToken, auth?.userEmail, clearAuth, refreshCurrentUser]);

    if (isCheckingSession) {
        return (
            <div className="flex h-screen items-center justify-center">
                <BarLoader color="#36d7b7" loading={isCheckingSession} width={200} aria-label="Loading Bar" />
            </div>
        );
    }

    return (

        //  auth?.userEmail
        accessToken
            ? <>
                <Navbar />
                <Outlet />
            </>

            : <Navigate to="/" state={{ from: location }} replace />

    );
}
export default RequireAuth;
