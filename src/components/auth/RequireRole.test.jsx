import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RequireRole from './RequireRole';
import UseAuth from '../Hooks/UseAuth';

vi.mock('../Hooks/UseAuth', () => ({ default: vi.fn() }));

const renderProtectedRoute = (entry) => render(
  <MemoryRouter initialEntries={[entry]}>
    <Routes>
      <Route element={<RequireRole role="ADMIN" />}>
        <Route path="/admin/instructor-applications" element={<div>Admin list</div>} />
        <Route path="/admin/instructor-applications/:applicationId/review" element={<div>Admin review</div>} />
      </Route>
    </Routes>
  </MemoryRouter>,
);

describe('Admin instructor application route protection', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ['/admin/instructor-applications', 'Admin list'],
    ['/admin/instructor-applications/42/review', 'Admin review'],
  ])('allows an admin to access %s', (path, content) => {
    UseAuth.mockReturnValue({ auth: { userRole: 'ADMIN' } });
    renderProtectedRoute(path);
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  it.each([
    '/admin/instructor-applications',
    '/admin/instructor-applications/42/review',
  ])('blocks a non-admin from %s', (path) => {
    UseAuth.mockReturnValue({ auth: { userRole: 'STUDENT' } });
    renderProtectedRoute(path);
    expect(screen.getByText('Access restricted')).toBeInTheDocument();
  });
});
