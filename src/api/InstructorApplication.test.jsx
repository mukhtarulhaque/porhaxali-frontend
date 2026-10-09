import { afterEach, describe, expect, it, vi } from 'vitest';
import { uploadFileToR2 } from './InstructorApplication';

describe('direct storage upload', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a raw PUT without browser credentials or authorization tokens', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const file = new File(['photo'], 'profile.jpg', { type: 'image/jpeg' });

    await uploadFileToR2('https://storage.example.test/signed-put', file, {
      'Content-Type': ['image/jpeg'],
      Authorization: ['Bearer application-jwt'],
      Cookie: ['session=sensitive'],
      Host: ['storage.example.test'],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://storage.example.test/signed-put');
    expect(options.method).toBe('PUT');
    expect(options.body).toBe(file);
    expect(options.credentials).toBe('omit');
    expect(options.headers.get('Content-Type')).toBe('image/jpeg');
    expect(options.headers.has('Authorization')).toBe(false);
    expect(options.headers.has('Cookie')).toBe(false);
    expect(options.headers.has('Host')).toBe(false);
  });

  it('reports a failed storage response without calling an application endpoint', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }));

    await expect(uploadFileToR2(
      'https://storage.example.test/expired',
      new File(['photo'], 'profile.png', { type: 'image/png' }),
    )).rejects.toThrow('Storage upload failed with status 403');
  });
});
