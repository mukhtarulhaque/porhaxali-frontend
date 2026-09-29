import { afterEach, describe, expect, it } from 'vitest';
import api from './Axios';

describe('shared API client', () => {
    afterEach(() => {
        localStorage.clear();
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
});
