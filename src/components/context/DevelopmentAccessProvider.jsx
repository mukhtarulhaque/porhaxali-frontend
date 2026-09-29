import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    getDevelopmentAccessStatus,
    logoutDevelopmentAccess,
} from '../../api/DevelopmentAccess';
import { DevelopmentAccessContext } from './DevelopmentAccessContext';

const DevelopmentAccessProvider = ({ children }) => {
    const [state, setState] = useState({
        status: 'checking',
        authorized: false,
    });

    const refreshStatus = useCallback(async ({ showLoading = true } = {}) => {
        if (showLoading) {
            setState({ status: 'checking', authorized: false });
        }
        try {
            const authorized = await getDevelopmentAccessStatus();
            setState({ status: 'resolved', authorized });
            return authorized;
        } catch {
            setState({ status: 'error', authorized: false });
            return false;
        }
    }, []);

    useEffect(() => {
        let active = true;
        getDevelopmentAccessStatus()
            .then((authorized) => {
                if (active) {
                    setState({ status: 'resolved', authorized });
                }
            })
            .catch(() => {
                if (active) {
                    setState({ status: 'error', authorized: false });
                }
            });
        return () => {
            active = false;
        };
    }, []);

    const logout = useCallback(async () => {
        await logoutDevelopmentAccess();
        setState({ status: 'resolved', authorized: false });
    }, []);

    const value = useMemo(() => ({
        ...state,
        refreshStatus,
        logout,
    }), [logout, refreshStatus, state]);

    return (
        <DevelopmentAccessContext.Provider value={value}>
            {children}
        </DevelopmentAccessContext.Provider>
    );
};

export default DevelopmentAccessProvider;
