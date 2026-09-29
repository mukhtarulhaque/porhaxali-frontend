import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InstructorApplicationReview from './InstructorApplicationReview';
import {
  approveInstructorApplication,
  getInstructorApplication,
  getInstructorApplicationDocumentViewUrl,
  rejectInstructorApplication,
  rejectInstructorApplicationDocument,
  requestInstructorApplicationChanges,
  startInstructorApplicationReview,
  verifyInstructorApplicationDocument,
} from '../../../api/AdminInstructorApplications';

vi.mock('../../../api/AdminInstructorApplications', () => ({
  approveInstructorApplication: vi.fn(),
  getInstructorApplication: vi.fn(),
  getInstructorApplicationDocumentViewUrl: vi.fn(),
  rejectInstructorApplication: vi.fn(),
  rejectInstructorApplicationDocument: vi.fn(),
  requestInstructorApplicationChanges: vi.fn(),
  startInstructorApplicationReview: vi.fn(),
  verifyInstructorApplicationDocument: vi.fn(),
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
    startInstructorApplicationReview.mockResolvedValue({
      ...detail,
      applicationStatus: 'UNDER_REVIEW',
    });
    verifyInstructorApplicationDocument.mockResolvedValue({
      ...detail.documents[0],
      verificationStatus: 'VERIFIED',
      verifiedAt: '2026-09-29T09:00:00',
      verifiedBy: { id: 1, name: 'Admin User' },
    });
    rejectInstructorApplicationDocument.mockResolvedValue({
      ...detail.documents[0],
      verificationStatus: 'REJECTED',
      verifiedAt: '2026-09-29T09:00:00',
      verifiedBy: { id: 1, name: 'Admin User' },
      remarks: 'Unreadable scan',
    });
    approveInstructorApplication.mockResolvedValue({
      ...detail,
      applicationStatus: 'APPROVED',
      adminRemarks: 'Documents verified',
      rejectionReason: null,
      reviewedAt: '2026-09-29T10:00:00',
      reviewHistory: [...detail.reviewHistory, {
        id: 81,
        action: 'APPROVED',
        previousStatus: 'UNDER_REVIEW',
        newStatus: 'APPROVED',
        performedBy: { id: 1, name: 'Admin User' },
        remark: 'Documents verified',
        createdAt: '2026-09-29T10:00:00',
      }],
    });
    rejectInstructorApplication.mockResolvedValue({
      ...detail,
      applicationStatus: 'REJECTED',
      rejectionReason: 'Qualifications do not meet requirements',
    });
    requestInstructorApplicationChanges.mockResolvedValue({
      ...detail,
      applicationStatus: 'CHANGES_REQUESTED',
      adminRemarks: 'Upload a clearer certificate',
      rejectionReason: null,
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

  it('shows Start Review only for submitted applications and updates from the backend response', async () => {
    getInstructorApplication.mockResolvedValue({
      ...detail,
      applicationStatus: 'SUBMITTED',
      reviewStartedAt: null,
      reviewStartedBy: null,
    });
    renderReview();

    const startButton = await screen.findByRole('button', { name: 'Start Review' });
    expect(screen.queryByRole('button', { name: 'Mark Verified' })).not.toBeInTheDocument();
    fireEvent.click(startButton);

    await waitFor(() => expect(startInstructorApplicationReview).toHaveBeenCalledWith('42'));
    expect(screen.queryByRole('button', { name: 'Start Review' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark Verified' })).toBeInTheDocument();
  });

  it('prevents duplicate Start Review submissions while the request is running', async () => {
    getInstructorApplication.mockResolvedValue({ ...detail, applicationStatus: 'SUBMITTED' });
    let resolveStart;
    startInstructorApplicationReview.mockReturnValue(new Promise((resolve) => { resolveStart = resolve; }));
    renderReview();
    const startButton = await screen.findByRole('button', { name: 'Start Review' });

    fireEvent.click(startButton);
    expect(screen.getByRole('button', { name: 'Starting Review…' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Starting Review…' }));
    expect(startInstructorApplicationReview).toHaveBeenCalledTimes(1);
    resolveStart(detail);
  });

  it('keeps the submitted state and shows a useful conflict error when Start Review fails', async () => {
    getInstructorApplication.mockResolvedValue({ ...detail, applicationStatus: 'SUBMITTED' });
    startInstructorApplicationReview.mockRejectedValue({ response: { status: 409 } });
    renderReview();
    fireEvent.click(await screen.findByRole('button', { name: 'Start Review' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('application state has changed');
    expect(screen.getByRole('button', { name: 'Start Review' })).toBeInTheDocument();
  });

  it('shows document controls only for pending documents while under review', async () => {
    renderReview();
    await screen.findByText('identity.pdf');

    expect(screen.queryByRole('button', { name: 'Start Review' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Mark Verified' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Reject' })).toHaveLength(1);
  });

  it('shows final decision actions only while the application is under review', async () => {
    renderReview();
    expect(await screen.findByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Request Changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject Application' })).toBeInTheDocument();
    expect(screen.getByText(/backend will confirm that every required document/i)).toBeInTheDocument();
  });

  it('confirms approval is decision-only and updates the page from the response', async () => {
    renderReview();
    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));

    expect(screen.getByRole('dialog', { name: 'Approve application?' })).toHaveTextContent('does not activate the instructor');
    fireEvent.change(screen.getByLabelText('Approval remarks (optional)'), { target: { value: '  Documents verified  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Approval' }));

    await waitFor(() => expect(approveInstructorApplication).toHaveBeenCalledWith('42', 'Documents verified'));
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Documents verified').length).toBeGreaterThan(0);
  });

  it('requires a rejection reason and applies the returned rejected state', async () => {
    renderReview();
    fireEvent.click(await screen.findByRole('button', { name: 'Reject Application' }));

    const reason = screen.getByLabelText('Rejection reason');
    expect(reason).toHaveAttribute('maxlength', '2000');
    expect(screen.getByRole('button', { name: 'Confirm Rejection' })).toBeDisabled();
    fireEvent.change(reason, { target: { value: 'Qualifications do not meet requirements' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Rejection' }));

    await waitFor(() => expect(rejectInstructorApplication).toHaveBeenCalledWith(
      '42',
      'Qualifications do not meet requirements',
    ));
    expect(screen.queryByRole('button', { name: 'Reject Application' })).not.toBeInTheDocument();
    expect(screen.getByText('Qualifications do not meet requirements')).toBeInTheDocument();
  });

  it('requires request-change remarks and applies the returned state', async () => {
    renderReview();
    fireEvent.click(await screen.findByRole('button', { name: 'Request Changes' }));

    const remarks = screen.getByLabelText('Requested changes');
    expect(screen.getByRole('button', { name: 'Send Change Request' })).toBeDisabled();
    fireEvent.change(remarks, { target: { value: 'Upload a clearer certificate' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Change Request' }));

    await waitFor(() => expect(requestInstructorApplicationChanges).toHaveBeenCalledWith(
      '42',
      'Upload a clearer certificate',
    ));
    expect(screen.queryByRole('button', { name: 'Request Changes' })).not.toBeInTheDocument();
    expect(screen.getByText('Upload a clearer certificate')).toBeInTheDocument();
  });

  it('keeps decision controls visible and reports stale-state conflicts', async () => {
    approveInstructorApplication.mockRejectedValue({ response: { status: 409 } });
    renderReview();
    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Approval' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('can no longer be decided');
    expect(screen.getByRole('dialog', { name: 'Approve application?' })).toBeInTheDocument();
  });

  it('hides final decisions for terminal statuses', async () => {
    getInstructorApplication.mockResolvedValue({ ...detail, applicationStatus: 'APPROVED' });
    renderReview();
    await screen.findByRole('heading', { name: 'Asha Das' });

    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Request Changes' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject Application' })).not.toBeInTheDocument();
  });

  it('verifies only the selected document using the application-scoped API', async () => {
    renderReview();
    await screen.findByText('identity.pdf');
    fireEvent.click(screen.getByRole('button', { name: 'Mark Verified' }));

    await waitFor(() => expect(verifyInstructorApplicationDocument).toHaveBeenCalledWith('42', 30));
    const identityCard = screen.getByText('identity.pdf').closest('article');
    const degreeCard = screen.getByText('degree.pdf').closest('article');
    expect(within(identityCard).getByText('Verified')).toBeInTheDocument();
    expect(within(degreeCard).getByText('Verified')).toBeInTheDocument();
    expect(within(identityCard).queryByRole('button', { name: 'Mark Verified' })).not.toBeInTheDocument();
  });

  it('requires confirmation and a reason before rejecting a document', async () => {
    renderReview();
    await screen.findByText('identity.pdf');
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));

    expect(screen.getByRole('dialog', { name: 'Reject document?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm Rejection' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Rejection reason'), { target: { value: 'Unreadable scan' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Rejection' }));

    await waitFor(() => expect(rejectInstructorApplicationDocument).toHaveBeenCalledWith('42', 30, 'Unreadable scan'));
    const identityCard = screen.getByText('identity.pdf').closest('article');
    expect(within(identityCard).getByText('Rejected')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('leaves the previous document status intact when a document mutation fails', async () => {
    verifyInstructorApplicationDocument.mockRejectedValue(new Error('network'));
    renderReview();
    await screen.findByText('identity.pdf');
    fireEvent.click(screen.getByRole('button', { name: 'Mark Verified' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to update the document review status');
    const identityCard = screen.getByText('identity.pdf').closest('article');
    expect(within(identityCard).getByText('Pending')).toBeInTheDocument();
    expect(within(identityCard).getByRole('button', { name: 'Mark Verified' })).toBeInTheDocument();
  });
});
