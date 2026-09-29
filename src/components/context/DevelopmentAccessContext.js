import { createContext, useContext } from 'react';

const DevelopmentAccessContext = createContext(null);

const useDevelopmentAccess = () => {
    const context = useContext(DevelopmentAccessContext);
    if (!context) {
        throw new Error('useDevelopmentAccess must be used within DevelopmentAccessProvider');
    }
    return context;
};

export { DevelopmentAccessContext, useDevelopmentAccess };
