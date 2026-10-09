import { afterEach, describe, expect, it, vi } from 'vitest';
import api from './Axios';
import { updateMyApplication } from './InstructorApplication';

const originalAdapter = api.defaults.adapter;

const response = (config, payload = { success: true }) => ({
    config,
    data: payload,
    headers: {},
    status: 200,
    statusText: 'OK',
});

const unauthorized = (config) => Promise.reject({
    config,
    response: {
        config,
        data: { message: 'Invalid or expired token' },
        headers: {},
        status: 401,
        statusText: 'Unauthorized',
    },
    isAxiosError: true,
});

describe('shared API client', () => {
    afterEach(() => {
        localStorage.clear();
        api.defaults.adapter = originalAdapter;
        vi.clearAllMocks();
    });

    it('sends credentialed cookies and preserves normal JWT authorization headers', async () => {
        localStorage.setItem('porhaxaliAuth', JSON.stringify({ accessToken: 'student-jwt' }));
        let requestConfig;

        await api.get('api/test', {
            adapter: async (config) => {
                requestConfig = config;
                return {
                    config,
                    data: { success: true },
                    headers: {},
                    status: 200,
                    statusText: 'OK',
                };
            },
        });

        expect(api.defaults.withCredentials).toBe(true);
        expect(requestConfig.withCredentials).toBe(true);
        expect(requestConfig.headers.get('Authorization')).toBe('Bearer student-jwt');
    });

    it('uses the authenticated client for the instructor application PUT', async () => {
        localStorage.setItem('porhaxaliAuth', JSON.stringify({
            accessToken: 'applicant-access-token',
            refreshToken: 'applicant-refresh-token',
            userRole: 'INSTRUCTOR_APPLICANT',
        }));
        let requestConfig;
        api.defaults.adapter = async (config) => {
            requestConfig = config;
            return response(config, { data: { applicationStatus: 'DRAFT' } });
        };

        const saved = await updateMyApplication({ bio: 'Faculty biography' });

        expect(saved).toEqual({ applicationStatus: 'DRAFT' });
        expect(requestConfig.method).toBe('put');
        expect(requestConfig.url).toBe('api/instructor-applications/me');
        expect(requestConfig.headers.get('Authorization')).toBe('Bearer applicant-access-token');
    });

    it('refreshes an expired access token and retries the original PUT once', async () => {
        localStorage.setItem('porhaxaliAuth', JSON.stringify({
            accessToken: 'expired-access-token',
            refreshToken: 'valid-refresh-token',
            userEmail: 'applicant@example.com',
            userRole: 'INSTRUCTOR_APPLICANT',
        }));
        let refreshAttempts = 0;
        let putAttempts = 0;
        api.defaults.adapter = async (config) => {
            if (config.url === 'api/auth/refresh') {
                refreshAttempts += 1;
                return response(config, {
                    data: {
                        accessToken: 'fresh-access-token',
                        refreshToken: 'fresh-refresh-token',
                        email: 'applicant@example.com',
                        role: 'INSTRUCTOR_APPLICANT',
                    },
                });
            }

            putAttempts += 1;
            if (config.headers.get('Authorization') === 'Bearer expired-access-token') {
                return unauthorized(config);
            }
            return response(config, { data: { applicationStatus: 'DRAFT' } });
        };

        await expect(updateMyApplication({ bio: 'Still here' })).resolves.toEqual({
            applicationStatus: 'DRAFT',
        });

        expect(refreshAttempts).toBe(1);
        expect(putAttempts).toBe(2);
        expect(JSON.parse(localStorage.getItem('porhaxaliAuth'))).toMatchObject({
            accessToken: 'fresh-access-token',
            refreshToken: 'fresh-refresh-token',
        });
    });

    it('shares one token refresh across simultaneous 401 responses', async () => {
        localStorage.setItem('porhaxaliAuth', JSON.stringify({
            accessToken: 'expired-access-token',
            refreshToken: 'valid-refresh-token',
            userRole: 'INSTRUCTOR_APPLICANT',
        }));
        let refreshAttempts = 0;
        const successfulUrls = [];
        api.defaults.adapter = async (config) => {
            if (config.url === 'api/auth/refresh') {
                refreshAttempts += 1;
                await Promise.resolve();
                return response(config, {
                    data: {
                        accessToken: 'shared-access-token',
                        refreshToken: 'rotated-refresh-token',
                        role: 'INSTRUCTOR_APPLICANT',
                    },
                });
            }

            if (config.headers.get('Authorization') === 'Bearer expired-access-token') {
                return unauthorized(config);
            }
            successfulUrls.push(config.url);
            return response(config);
        };

        await expect(Promise.all([
            api.get('api/instructor-applications/me'),
            api.get('api/instructor-applications/me/qualifications'),
        ])).resolves.toHaveLength(2);

        expect(refreshAttempts).toBe(1);
        expect(successfulUrls).toEqual([
            'api/instructor-applications/me',
            'api/instructor-applications/me/qualifications',
        ]);
    });

    it('clears an invalid session when refresh fails', async () => {
        localStorage.setItem('porhaxaliAuth', JSON.stringify({
            accessToken: 'expired-access-token',
            refreshToken: 'invalid-refresh-token',
            userRole: 'INSTRUCTOR_APPLICANT',
        }));
        const authUpdate = vi.fn();
        window.addEventListener('porhaxaliAuthUpdated', authUpdate, { once: true });
        let refreshAttempts = 0;
        api.defaults.adapter = async (config) => {
            if (config.url === 'api/auth/refresh') {
                refreshAttempts += 1;
                return unauthorized(config);
            }
            return unauthorized(config);
        };

        await expect(updateMyApplication({ bio: 'Unsaved value' })).rejects.toMatchObject({
            response: { status: 401 },
        });

        expect(refreshAttempts).toBe(1);
        expect(localStorage.getItem('porhaxaliAuth')).toBeNull();
        expect(authUpdate).toHaveBeenCalledTimes(1);
    });

    it('never retries a protected request more than once', async () => {
        localStorage.setItem('porhaxaliAuth', JSON.stringify({
            accessToken: 'expired-access-token',
            refreshToken: 'valid-refresh-token',
        }));
        let refreshAttempts = 0;
        let putAttempts = 0;
        api.defaults.adapter = async (config) => {
            if (config.url === 'api/auth/refresh') {
                refreshAttempts += 1;
                return response(config, {
                    data: {
                        accessToken: 'rejected-access-token',
                        refreshToken: 'rotated-refresh-token',
                    },
                });
            }
            putAttempts += 1;
            return unauthorized(config);
        };

        await expect(updateMyApplication({ bio: 'Preserved by the caller' })).rejects.toMatchObject({
            response: { status: 401 },
        });

        expect(refreshAttempts).toBe(1);
        expect(putAttempts).toBe(2);
    });
});
