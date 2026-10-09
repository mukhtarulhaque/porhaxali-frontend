import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import RequireAuth from './RequireAuth';
import UseAuth from '../Hooks/UseAuth';

vi.mock('../Hooks/UseAuth', () => ({ default: vi.fn() }));
vi.mock('../pages/commom/Navbar', () => ({ default: () => <div>Navigation</div> }));

function RedirectTarget() {
  const location = useLocation();
  return <div>Public landing from {location.state?.from?.pathname}</div>;
}

it('uses the existing unauthenticated redirect behavior for protected admin routes', () => {
  UseAuth.mockReturnValue({
    auth: {},
    clearAuth: vi.fn(),
    refreshCurrentUser: vi.fn(),
  });

  render(
    <MemoryRouter initialEntries={['/admin/instructor-applications']}>
      <Routes>
        <Route path="/" element={<RedirectTarget />} />
        <Route element={<RequireAuth />}>
          <Route path="/admin/instructor-applications" element={<div>Protected list</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

  expect(screen.getByText('Public landing from /admin/instructor-applications')).toBeInTheDocument();
  expect(screen.queryByText('Protected list')).not.toBeInTheDocument();
});

it('waits for session restoration before rendering a protected route', async () => {
  let finishRestoration;
  const refreshCurrentUser = vi.fn(() => new Promise((resolve) => {
    finishRestoration = resolve;
  }));
  UseAuth.mockReturnValue({
    auth: { accessToken: 'restored-access-token' },
    clearAuth: vi.fn(),
    refreshCurrentUser,
  });

  render(
    <MemoryRouter initialEntries={['/completeFacultyApplication']}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/completeFacultyApplication" element={<div>Faculty application</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

  expect(screen.getByLabelText('Loading Bar')).toBeInTheDocument();
  expect(screen.queryByText('Faculty application')).not.toBeInTheDocument();
  expect(refreshCurrentUser).toHaveBeenCalledWith('restored-access-token');

  finishRestoration({ userRole: 'INSTRUCTOR_APPLICANT' });
  expect(await screen.findByText('Faculty application')).toBeInTheDocument();
});
