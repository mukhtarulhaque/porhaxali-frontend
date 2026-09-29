import api from './Axios';
import {
    DEVELOPMENT_ACCESS_LOGOUT,
    DEVELOPMENT_ACCESS_REQUEST_OTP,
    DEVELOPMENT_ACCESS_STATUS,
    DEVELOPMENT_ACCESS_VERIFY_OTP,
} from './Urls';

const publicRequestConfig = { skipAuth: true };

const getDevelopmentAccessStatus = async () => {
    const response = await api.get(DEVELOPMENT_ACCESS_STATUS, publicRequestConfig);
    const authorized = response.data?.data?.authorized;
    if (typeof authorized !== 'boolean') {
        throw new Error('Invalid development access status response');
    }
    return authorized;
};

const requestDevelopmentAccessOtp = (email) => api.post(
    DEVELOPMENT_ACCESS_REQUEST_OTP,
    { email },
    publicRequestConfig,
);

const verifyDevelopmentAccessOtp = (otp) => api.post(
    DEVELOPMENT_ACCESS_VERIFY_OTP,
    { otp },
    publicRequestConfig,
);

const logoutDevelopmentAccess = () => api.post(
    DEVELOPMENT_ACCESS_LOGOUT,
    null,
    publicRequestConfig,
);

export {
    getDevelopmentAccessStatus,
    logoutDevelopmentAccess,
    requestDevelopmentAccessOtp,
    verifyDevelopmentAccessOtp,
};
