import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InstructorApplicationReview from './InstructorApplicationReview';
import {
  getInstructorApplication,
  getInstructorApplicationDocumentViewUrl,
} from '../../../api/AdminInstructorApplications';

vi.mock('../../../api/AdminInstructorApplications', () => ({
  getInstructorApplication: vi.fn(),
  getInstructorApplicationDocumentViewUrl: vi.fn(),
}));

const detail = {
  applicationId: 42,
  applicant: {
    id: 8,
    name: 'Asha Das',
    email: 'asha@example.com',
    phone: '+91 99999 88888',
  },
  qualifications: [
    { id: 1, qualificationName: 'B.Sc.', institutionName: 'Gauhati University', specialization: 'Mathematics', completionYear: 2018 },
    { id: 2, qualificationName: 'B.Ed.', institutionName: 'Dibrugarh University', specialization: 'Education', completionYear: 2020 },
  ],
  teachingExperienceYears: 4,
  teachingExperienceDescription: 'Taught secondary mathematics for four years.',
  dateOfBirth: '1994-05-12',
  calculatedAge: 32,
  address: 'Guwahati, Assam',
  bio: 'Patient and practical educator.',
  profilePhotoPresent: true,
  profilePhotoOriginalFilename: 'asha-photo.jpg',
  applicationStatus: 'UNDER_REVIEW',
  requestedSubjects: [
    { id: 11, subjectId: 4, subjectName: 'Mathematics', subjectCode: 'MATH' },
    { id: 12, subjectId: 7, subjectName: 'Physics', subjectCode: 'PHY' },
  ],
  documents: [
    {
      documentId: 30,
      documentType: 'IDENTITY_PROOF',
      originalFilename: 'identity.pdf',
      mimeType: 'application/pdf',
      fileSize: 2048,
      verificationStatus: 'PENDING',
      uploadedAt: '2026-09-20T10:00:00',
    },
    {
      documentId: 31,
      documentType: 'EDUCATIONAL_CERTIFICATE',
      originalFilename: 'degree.pdf',
      mimeType: 'application/pdf',
      fileSize: 4096,
      verificationStatus: 'VERIFIED',
      uploadedAt: '2026-09-20T10:05:00',
      verifiedAt: '2026-09-21T09:30:00',
      verifiedBy: { id: 1, name: 'Admin User' },
      remarks: 'Certificate is legible.',
    },
  ],
  submittedAt: '2026-09-20T12:00:00',
  reviewStartedAt: '2026-09-21T09:00:00',
  reviewStartedBy: { id: 1, name: 'Admin User' },
  reviewedAt: '2026-09-22T11:00:00',
  reviewedBy: { id: 1, name: 'Admin User' },
  rejectionReason: 'Previous decision reason',
  adminRemarks: 'Check the experience certificate.',
  reviewHistory: [
    {
      id: 80,
      action: 'REVIEW_STARTED',
      previousStatus: 'SUBMITTED',
      newStatus: 'UNDER_REVIEW',
      performedBy: { id: 1, name: 'Admin User' },
      createdAt: '2026-09-21T09:00:00',
    },
  ],
  updatedAt: '2026-09-22T11:00:00',
};

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}

const renderReview = (entry = '/admin/instructor-applications/42/review') => render(
  <MemoryRouter initialEntries={[entry]}>
    <LocationProbe />
    <Routes>
      <Route path="/admin/instructor-applications" element={<div>Applications list</div>} />
      <Route path="/admin/instructor-applications/:applicationId/review" element={<InstructorApplicationReview />} />
    </Routes>
  </MemoryRouter>,
);

describe('Instructor application review detail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getInstructorApplication.mockResolvedValue(detail);
    getInstructorApplicationDocumentViewUrl.mockResolvedValue({
      url: 'https://signed.example.test/document',
      expiresAt: '2026-09-29T12:00:00Z',
    });
  });

  it('loads and displays applicant, subjects, qualifications, documents, and review information', async () => {
    renderReview();

    expect(screen.getByLabelText('Loading instructor application')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Asha Das' })).toBeInTheDocument();
    expect(getInstructorApplication).toHaveBeenCalledWith('42');
    expect(screen.getByText('asha@example.com')).toBeInTheDocument();
    expect(screen.getByText('+91 99999 88888')).toBeInTheDocument();
    expect(screen.getAllByText('Mathematics')).toHaveLength(2);
    expect(screen.getByText('Physics')).toBeInTheDocument();
    expect(screen.getByText('B.Sc.')).toBeInTheDocument();
    expect(screen.getByText('B.Ed.')).toBeInTheDocument();
    expect(screen.getByText('identity.pdf')).toBeInTheDocument();
    expect(screen.getByText('degree.pdf')).toBeInTheDocument();
    expect(screen.getByText('Check the experience certificate.')).toBeInTheDocument();
    expect(screen.getByText('Previous decision reason')).toBeInTheDocument();
    expect(screen.getAllByText('Review Started').length).toBeGreaterThan(1);
  });

  it('renders empty collections and null optional fields safely', async () => {
    getInstructorApplication.mockResolvedValue({
      ...detail,
      applicant: { name: 'Minimal Applicant', email: null, phone: null },
      qualifications: null,
      requestedSubjects: [],
      documents: null,
      teachingExperienceYears: null,
      teachingExperienceDescription: null,
      dateOfBirth: null,
      address: null,
      bio: null,
      reviewedAt: null,
      reviewedBy: null,
      adminRemarks: null,
      rejectionReason: null,
      reviewHistory: null,
    });
    renderReview();

    expect(await screen.findByText('No qualifications were provided.')).toBeInTheDocument();
    expect(screen.getByText('No subjects were selected.')).toBeInTheDocument();
    expect(screen.getByText('No documents were uploaded.')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(3);
  });

  it('shows an error state and retries the detail request', async () => {
    getInstructorApplication
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(detail);
    renderReview();

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load instructor application');
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('heading', { name: 'Asha Das' })).toBeInTheDocument();
    expect(getInstructorApplication).toHaveBeenCalledTimes(2);
  });

  it('handles a missing application distinctly', async () => {
    getInstructorApplication.mockRejectedValue({ response: { status: 404 } });
    renderReview();
    expect(await screen.findByRole('heading', { name: 'Application not found' })).toBeInTheDocument();
  });

  it('requests an application-scoped secure URL and opens the returned document', async () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue({});
    renderReview();
    await screen.findByText('identity.pdf');

    fireEvent.click(screen.getAllByRole('button', { name: 'View Document' })[0]);

    await waitFor(() => expect(getInstructorApplicationDocumentViewUrl).toHaveBeenCalledWith('42', 30));
    expect(openSpy).toHaveBeenCalledWith(
      'https://signed.example.test/document',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });

  it('preserves list query state when navigating back', async () => {
    renderReview({
      pathname: '/admin/instructor-applications/42/review',
      state: { from: '/admin/instructor-applications?status=UNDER_REVIEW&search=asha&page=1' },
    });
    await screen.findByRole('heading', { name: 'Asha Das' });

    fireEvent.click(screen.getByRole('link', { name: /back to instructor applications/i }));
    expect(screen.getByTestId('location')).toHaveTextContent('status=UNDER_REVIEW&search=asha&page=1');
  });
});
