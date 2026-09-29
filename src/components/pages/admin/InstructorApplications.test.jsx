import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InstructorApplications from './InstructorApplications';
import InstructorApplicationReview from './InstructorApplicationReview';
import {
  getInstructorApplication,
  getInstructorApplications,
} from '../../../api/AdminInstructorApplications';

vi.mock('../../../api/AdminInstructorApplications', () => ({
  getInstructorApplication: vi.fn(),
  getInstructorApplications: vi.fn(),
  getInstructorApplicationDocumentViewUrl: vi.fn(),
}));

const application = {
  applicationId: 42,
  applicantName: 'Asha Das',
  email: 'asha@example.com',
  applicationStatus: 'UNDER_REVIEW',
  requestedSubjects: [{ subjectId: 7, subjectName: 'Mathematics' }],
  submittedAt: '2026-09-20T12:00:00',
  reviewStartedAt: '2026-09-21T09:00:00',
  reviewStartedBy: { id: 1, name: 'Admin User' },
};

const pageResponse = (content = [application], overrides = {}) => ({
  content,
  number: 0,
  size: 20,
  totalElements: content.length,
  totalPages: content.length ? 1 : 0,
  first: true,
  last: true,
  ...overrides,
});

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}

const renderList = (entry = '/admin/instructor-applications') => render(
  <MemoryRouter initialEntries={[entry]}>
    <LocationProbe />
    <Routes>
      <Route path="/admin/instructor-applications" element={<InstructorApplications />} />
      <Route path="/admin/instructor-applications/:applicationId/review" element={<InstructorApplicationReview />} />
    </Routes>
  </MemoryRouter>,
);

describe('Instructor applications list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getInstructorApplications.mockResolvedValue(pageResponse());
    getInstructorApplication.mockImplementation(async (applicationId) => ({
      applicationId: Number(applicationId),
      applicant: { name: 'Asha Das' },
      qualifications: [],
      requestedSubjects: [],
      documents: [],
      reviewHistory: [],
      applicationStatus: 'UNDER_REVIEW',
    }));
  });

  it('loads rows and renders backend DTO fields with human-readable status', async () => {
    renderList();

    expect(screen.getByLabelText('Loading instructor applications')).toBeInTheDocument();
    expect(await screen.findByText('Asha Das')).toBeInTheDocument();
    expect(screen.getByText('asha@example.com')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getAllByText('Under Review')).toHaveLength(2);
    expect(getInstructorApplications).toHaveBeenCalledWith({ status: undefined, search: undefined, page: 0, size: 20 });
  });

  it('submits trimmed search and status through URL-backed server queries', async () => {
    renderList();
    await screen.findByText('Asha Das');

    fireEvent.change(screen.getByLabelText('Search applicants'), { target: { value: '  asha  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => expect(getInstructorApplications).toHaveBeenLastCalledWith({ status: undefined, search: 'asha', page: 0, size: 20 }));

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'SUBMITTED' } });
    await waitFor(() => expect(getInstructorApplications).toHaveBeenLastCalledWith({ status: 'SUBMITTED', search: 'asha', page: 0, size: 20 }));
    expect(screen.getByTestId('location')).toHaveTextContent('status=SUBMITTED');
  });

  it('uses zero-based backend pagination and preserves filters', async () => {
    getInstructorApplications.mockResolvedValue(pageResponse([application], { totalElements: 25, totalPages: 2, last: false }));
    renderList('/admin/instructor-applications?status=SUBMITTED&search=asha');
    await screen.findByText('Asha Das');

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(getInstructorApplications).toHaveBeenLastCalledWith({ status: 'SUBMITTED', search: 'asha', page: 1, size: 20 }));
  });

  it('renders error and filtered-empty states and clears filters', async () => {
    getInstructorApplications.mockRejectedValueOnce(new Error('network'));
    const view = renderList();
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load instructor applications');
    view.unmount();

    getInstructorApplications.mockResolvedValue(pageResponse([]));
    renderList('/admin/instructor-applications?status=REJECTED');
    expect(await screen.findByText('No applications match these filters')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Clear filters' })[1]);
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/admin/instructor-applications'));
  });

  it('navigates with the application ID and returns to the filtered list', async () => {
    getInstructorApplications.mockResolvedValue(pageResponse([application], {
      number: 1,
      totalElements: 21,
      totalPages: 2,
      first: false,
    }));
    renderList('/admin/instructor-applications?status=UNDER_REVIEW&page=1');
    const action = await screen.findByRole('link', { name: 'Continue Review' });
    fireEvent.click(action);

    expect(await screen.findByText('Application ID: 42')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /back to instructor applications/i }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('status=UNDER_REVIEW&page=1'));
  });

  it('renders a directly opened review route without navigation state', async () => {
    renderList('/admin/instructor-applications/99/review');
    expect(await screen.findByText('Application ID: 99')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to instructor applications/i })).toHaveAttribute('href', '/admin/instructor-applications');
  });
});
