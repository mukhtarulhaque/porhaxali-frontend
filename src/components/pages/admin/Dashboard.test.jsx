import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Dashboard from './Dashboard';
import { getInstructorApplicationCounts } from '../../../api/AdminInstructorApplications';

vi.mock('../../../api/AdminInstructorApplications', () => ({
  getInstructorApplicationCounts: vi.fn(),
}));

const renderDashboard = () => render(
  <MemoryRouter initialEntries={['/adminDashboard']}>
    <Routes>
      <Route path="/adminDashboard" element={<Dashboard />} />
      <Route path="/admin/instructor-applications" element={<div>Applications route</div>} />
    </Routes>
  </MemoryRouter>,
);

describe('Admin dashboard instructor application count', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading, renders the count breakdown, and navigates to the queue', async () => {
    let resolveCounts;
    getInstructorApplicationCounts.mockReturnValue(new Promise((resolve) => { resolveCounts = resolve; }));
    renderDashboard();

    expect(screen.getByLabelText('Loading instructor application review count')).toBeInTheDocument();
    resolveCounts({ submitted: 5, underReview: 2, totalPendingReview: 7 });

    const card = await screen.findByRole('link', { name: /7 instructor applications pending review/i });
    expect(screen.getByText('5 Submitted')).toBeInTheDocument();
    expect(screen.getByText('2 Under Review')).toBeInTheDocument();
    fireEvent.click(card);
    expect(await screen.findByText('Applications route')).toBeInTheDocument();
  });

  it('shows a safe retry state when the request fails', async () => {
    getInstructorApplicationCounts.mockRejectedValue(new Error('network'));
    renderDashboard();

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
