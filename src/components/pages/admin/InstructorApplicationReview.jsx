import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  XCircle,
  UserRound,
  UserCheck,
} from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  approveInstructorApplication,
  activateInstructor,
  getInstructorApplication,
  getInstructorApplicationDocumentViewUrl,
  rejectInstructorApplication,
  rejectInstructorApplicationDocument,
  requestInstructorApplicationChanges,
  startInstructorApplicationReview,
  verifyInstructorApplicationDocument,
} from '../../../api/AdminInstructorApplications';
import Sidebar from '../student/Sidebar';
import { adminTabs } from '../commom/CommonArrays';

const EMPTY_VALUE = '—';

const APPLICATION_STATUS_STYLES = {
  DRAFT: 'border-slate-200 bg-slate-50 text-slate-700',
  SUBMITTED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  UNDER_REVIEW: 'border-blue-200 bg-blue-50 text-blue-700',
  CHANGES_REQUESTED: 'border-amber-200 bg-amber-50 text-amber-700',
  APPROVED: 'border-teal-200 bg-teal-50 text-teal-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
};

const DOCUMENT_STATUS_STYLES = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  VERIFIED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
};

const humanize = (value) => {
  if (!value) return 'Unknown';
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDateTime = (value) => {
  if (!value) return EMPTY_VALUE;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const formatDate = (value) => {
  if (!value) return EMPTY_VALUE;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(date);
};

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes < 0) return EMPTY_VALUE;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const valueOrDash = (value) => value === null || value === undefined || value === '' ? EMPTY_VALUE : value;

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Detail({ label, value, className = '' }) {
  return (
    <div className={className}>
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium leading-6 text-slate-800">{valueOrDash(value)}</dd>
    </div>
  );
}

const getErrorContent = (error) => {
  if (error.response?.status === 404) {
    return {
      title: 'Application not found',
      message: 'This instructor application does not exist or is no longer available.',
    };
  }
  if (error.response?.status === 401) {
    return {
      title: 'Session expired',
      message: 'Please sign in again to view this instructor application.',
    };
  }
  if (error.response?.status === 403) {
    return {
      title: 'Access restricted',
      message: 'You do not have permission to view this instructor application.',
    };
  }
  return {
    title: 'Unable to load instructor application',
    message: 'The application details could not be loaded. Please try again.',
  };
};

export default function InstructorApplicationReview() {
  const { applicationId } = useParams();
  const location = useLocation();
  const [requestVersion, setRequestVersion] = useState(0);
  const requestKey = `${applicationId}|${requestVersion}`;
  const [requestState, setRequestState] = useState({ data: null, error: null, key: '' });
  const [openingDocumentId, setOpeningDocumentId] = useState(null);
  const [documentError, setDocumentError] = useState(null);
  const [isStartingReview, setIsStartingReview] = useState(false);
  const [documentMutationId, setDocumentMutationId] = useState(null);
  const [rejectingDocument, setRejectingDocument] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState(null);
  const [decisionDialog, setDecisionDialog] = useState(null);
  const [decisionText, setDecisionText] = useState('');
  const [decisionError, setDecisionError] = useState(null);
  const [isDeciding, setIsDeciding] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState(null);
  const application = requestState.data;
  const error = requestState.key === requestKey ? requestState.error : null;
  const isLoading = requestState.key !== requestKey;
  const backTo = typeof location.state?.from === 'string'
    && location.state.from.startsWith('/admin/instructor-applications')
    ? location.state.from
    : '/admin/instructor-applications';

  useEffect(() => {
    let active = true;

    getInstructorApplication(applicationId)
      .then((response) => {
        if (active) setRequestState({ data: response, error: null, key: requestKey });
      })
      .catch((requestError) => {
        console.error('Unable to load instructor application', requestError);
        if (active) setRequestState({ data: null, error: getErrorContent(requestError), key: requestKey });
      });

    return () => { active = false; };
  }, [applicationId, requestKey]);

  const openDocument = async (document) => {
    setOpeningDocumentId(document.documentId);
    setDocumentError(null);
    try {
      const response = await getInstructorApplicationDocumentViewUrl(applicationId, document.documentId);
      window.open(response.url, '_blank', 'noopener,noreferrer');
    } catch (requestError) {
      console.error('Unable to open instructor application document', requestError);
      setDocumentError(`Unable to open ${document.originalFilename || 'the selected document'}. Please try again.`);
    } finally {
      setOpeningDocumentId(null);
    }
  };

  const startReview = async () => {
    setIsStartingReview(true);
    setActionError(null);
    try {
      const updatedApplication = await startInstructorApplicationReview(applicationId);
      setRequestState({ data: updatedApplication, error: null, key: requestKey });
    } catch (requestError) {
      console.error('Unable to start instructor application review', requestError);
      const stale = requestError.response?.status === 409 || requestError.response?.status === 400;
      setActionError(stale
        ? 'Review could not be started because the application state has changed. Refresh the details and try again.'
        : 'Unable to start review. Please try again.');
    } finally {
      setIsStartingReview(false);
    }
  };

  const updateDocument = async (document, action, reason) => {
    setDocumentMutationId(document.documentId);
    setActionError(null);
    try {
      const updatedDocument = action === 'verify'
        ? await verifyInstructorApplicationDocument(applicationId, document.documentId)
        : await rejectInstructorApplicationDocument(applicationId, document.documentId, reason);
      setRequestState((previous) => ({
        ...previous,
        data: {
          ...previous.data,
          documents: previous.data.documents.map((item) =>
            item.documentId === updatedDocument.documentId ? updatedDocument : item),
        },
      }));
      if (action === 'reject') {
        setRejectingDocument(null);
        setRejectionReason('');
      }
    } catch (requestError) {
      console.error('Unable to update instructor application document', requestError);
      const stale = requestError.response?.status === 409 || requestError.response?.status === 400;
      setActionError(stale
        ? 'This document can no longer be reviewed in its current state. Refresh the details to see the latest status.'
        : 'Unable to update the document review status. Please try again.');
      if (action === 'reject') {
        setRejectingDocument(null);
        setRejectionReason('');
      }
    } finally {
      setDocumentMutationId(null);
    }
  };

  const openRejectConfirmation = (document) => {
    setActionError(null);
    setRejectionReason('');
    setRejectingDocument(document);
  };

  const openDecisionDialog = (decision) => {
    setActionError(null);
    setDecisionError(null);
    setDecisionText('');
    setDecisionDialog(decision);
  };

  const submitDecision = async (event) => {
    event.preventDefault();
    const text = decisionText.trim();
    if (decisionDialog !== 'approve' && !text) return;

    setIsDeciding(true);
    setDecisionError(null);
    try {
      let updatedApplication;
      if (decisionDialog === 'approve') {
        updatedApplication = await approveInstructorApplication(applicationId, text || undefined);
      } else if (decisionDialog === 'reject') {
        updatedApplication = await rejectInstructorApplication(applicationId, text);
      } else {
        updatedApplication = await requestInstructorApplicationChanges(applicationId, text);
      }
      setRequestState({ data: updatedApplication, error: null, key: requestKey });
      setDecisionDialog(null);
      setDecisionText('');
    } catch (requestError) {
      console.error('Unable to record instructor application decision', requestError);
      const stale = requestError.response?.status === 409 || requestError.response?.status === 400;
      setDecisionError(stale
        ? requestError.response?.data?.message
          || 'This application can no longer be decided in its current state. Refresh the details and try again.'
        : 'Unable to record the application decision. Please try again.');
    } finally {
      setIsDeciding(false);
    }
  };

  const refreshDetails = () => {
    setActionError(null);
    setRequestVersion((version) => version + 1);
  };

  const submitActivation = async () => {
    setIsActivating(true);
    setActivationError(null);
    setActionError(null);
    try {
      const activation = await activateInstructor(applicationId);
      setRequestState((previous) => ({
        ...previous,
        data: {
          ...previous.data,
          activation,
          applicant: { ...previous.data.applicant, role: activation.role },
        },
      }));
      setShowActivationDialog(false);
    } catch (requestError) {
      console.error('Unable to activate instructor', requestError);
      setActivationError(requestError.response?.data?.message
        || 'Instructor activation failed. The approved application was not changed; review the account and subject state, then try again.');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 font-montserrat text-slate-800">
      <Sidebar pageId="instructorApplications" tabs={adminTabs} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Instructor Applications
          </Link>

          {isLoading ? (
            <div className="mt-6 space-y-4" aria-label="Loading instructor application" aria-busy="true">
              <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              </div>
            </div>
          ) : error ? (
            <section role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-white px-6 py-14 text-center shadow-sm">
              <h1 className="text-2xl font-bold text-slate-900">{error.title}</h1>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{error.message}</p>
              <button
                type="button"
                onClick={() => setRequestVersion((version) => version + 1)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </section>
          ) : (
            <div className="mt-6 space-y-5">
              <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="px-6 py-7 sm:px-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-700">
                        <ClipboardCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-700">Admin review</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                          {application.applicant?.name || 'Instructor Application'}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">Application ID: {application.applicationId}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <span className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${APPLICATION_STATUS_STYLES[application.applicationStatus] ?? APPLICATION_STATUS_STYLES.DRAFT}`}>
                        {humanize(application.applicationStatus)}
                      </span>
                      {application.applicationStatus === 'SUBMITTED' && (
                        <button
                          type="button"
                          onClick={startReview}
                          disabled={isStartingReview}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100 disabled:cursor-wait disabled:opacity-60"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                          {isStartingReview ? 'Starting Review…' : 'Start Review'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              {actionError && (
                <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between">
                  <p>{actionError}</p>
                  <button type="button" onClick={refreshDetails} className="inline-flex shrink-0 items-center gap-2 font-bold text-rose-800 underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-rose-300">
                    <RefreshCw className="h-4 w-4" /> Refresh details
                  </button>
                </div>
              )}

              {application.applicationStatus === 'UNDER_REVIEW' && (
                <section aria-labelledby="application-decision-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 id="application-decision-title" className="font-bold text-slate-900">Final application decision</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">Record the review outcome after checking the application and required documents.</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button type="button" onClick={() => openDecisionDialog('approve')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100">
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </button>
                      <button type="button" onClick={() => openDecisionDialog('changes')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-100">
                        <AlertTriangle className="h-4 w-4" /> Request Changes
                      </button>
                      <button type="button" onClick={() => openDecisionDialog('reject')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-800 hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100">
                        <XCircle className="h-4 w-4" /> Reject Application
                      </button>
                    </div>
                  </div>
                  {(!application.documents?.length
                    || application.documents.some((document) => document.verificationStatus !== 'VERIFIED')) && (
                    <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      Some documents are missing or not verified. The backend will confirm that every required document is present and verified before approval.
                    </p>
                  )}
                </section>
              )}

              {application.applicationStatus === 'APPROVED' && !application.activation && (
                <section aria-labelledby="instructor-activation-title" className="rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm sm:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 id="instructor-activation-title" className="font-bold text-slate-900">Instructor activation</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">The application passed review. Activate the account separately when the instructor is ready for operational access.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setActivationError(null); setShowActivationDialog(true); }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    >
                      <UserCheck className="h-4 w-4" /> Activate Instructor
                    </button>
                  </div>
                </section>
              )}

              {application.activation && (
                <Section icon={UserCheck} title="Activated Instructor" description="Operational instructor account created from this approved application.">
                  <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Detail label="Instructor Profile ID" value={application.activation.instructorProfileId} />
                    <Detail label="Account Role" value={humanize(application.activation.role)} />
                    <Detail label="Profile Status" value={humanize(application.activation.instructorStatus)} />
                    <Detail label="Activated At" value={formatDateTime(application.activation.activatedAt)} />
                    <Detail label="Activated By" value={application.activation.activatedBy?.name} />
                    <Detail label="Active Subjects" value={application.activation.assignedSubjects?.map((subject) => subject.subjectName).join(', ')} />
                  </dl>
                </Section>
              )}

              <Section icon={ClipboardCheck} title="Application Information" description="Submission and review tracking information.">
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Detail label="Application ID" value={application.applicationId} />
                  <Detail label="Status" value={humanize(application.applicationStatus)} />
                  <Detail label="Submitted" value={formatDateTime(application.submittedAt)} />
                  <Detail label="Review Started" value={formatDateTime(application.reviewStartedAt)} />
                  <Detail label="Review Started By" value={application.reviewStartedBy?.name} />
                  <Detail label="Reviewed" value={formatDateTime(application.reviewedAt)} />
                  <Detail label="Reviewed By" value={application.reviewedBy?.name} />
                  <Detail label="Last Updated" value={formatDateTime(application.updatedAt)} />
                </dl>
              </Section>

              <div className="grid gap-5 lg:grid-cols-2">
                <Section icon={UserRound} title="Applicant" description="Account contact information supplied by the applicant.">
                  <dl className="grid gap-5 sm:grid-cols-2">
                    <Detail label="Full Name" value={application.applicant?.name} />
                    <Detail label="Email" value={application.applicant?.email} />
                    <Detail label="Phone" value={application.applicant?.phone} className="sm:col-span-2" />
                  </dl>
                </Section>

                <Section icon={UserRound} title="Personal Details">
                  <dl className="grid gap-5 sm:grid-cols-2">
                    <Detail label="Date of Birth" value={formatDate(application.dateOfBirth)} />
                    <Detail label="Age" value={application.calculatedAge} />
                    <Detail label="Address" value={application.address} className="sm:col-span-2" />
                    <Detail
                      label="Profile Photo"
                      value={application.profilePhotoPresent
                        ? application.profilePhotoOriginalFilename || 'Photo on file'
                        : EMPTY_VALUE}
                      className="sm:col-span-2"
                    />
                  </dl>
                </Section>
              </div>

              <Section icon={BriefcaseBusiness} title="Teaching Profile">
                <dl className="grid gap-5 sm:grid-cols-2">
                  <Detail label="Teaching Experience" value={application.teachingExperienceYears === null || application.teachingExperienceYears === undefined ? EMPTY_VALUE : `${application.teachingExperienceYears} years`} />
                  <Detail label="Experience Description" value={application.teachingExperienceDescription} className="sm:col-span-2" />
                  <Detail label="Bio" value={application.bio} className="sm:col-span-2" />
                </dl>
              </Section>

              <Section icon={BookOpen} title="Subjects Applied For">
                {application.requestedSubjects?.length ? (
                  <ul className="flex flex-wrap gap-2">
                    {application.requestedSubjects.map((subject) => (
                      <li key={subject.id ?? subject.subjectId} className="rounded-xl border border-pink-100 bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-800">
                        {subject.subjectName || 'Unnamed subject'}
                        {subject.subjectCode && <span className="ml-2 text-xs font-medium text-pink-600">{subject.subjectCode}</span>}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-slate-500">No subjects were selected.</p>}
              </Section>

              <Section icon={GraduationCap} title="Qualifications">
                {application.qualifications?.length ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {application.qualifications.map((qualification) => (
                      <article key={qualification.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                        <h3 className="font-bold text-slate-900">{valueOrDash(qualification.qualificationName)}</h3>
                        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                          <Detail label="Institution" value={qualification.institutionName} />
                          <Detail label="Specialization" value={qualification.specialization} />
                          <Detail label="Completion Year" value={qualification.completionYear} />
                        </dl>
                      </article>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-500">No qualifications were provided.</p>}
              </Section>

              <Section icon={FileText} title="Uploaded Documents" description="Documents remain private and are opened through a short-lived authorized link.">
                {documentError && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{documentError}</p>}
                {application.documents?.length ? (
                  <div className="space-y-3">
                    {application.documents.map((document) => (
                      <article key={document.documentId} className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-all font-bold text-slate-900">{document.originalFilename || 'Unnamed document'}</h3>
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${DOCUMENT_STATUS_STYLES[document.verificationStatus] ?? 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                              {humanize(document.verificationStatus)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-medium text-slate-600">{humanize(document.documentType)}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Uploaded {formatDateTime(document.uploadedAt)} · {formatFileSize(document.fileSize)}
                          </p>
                          {(document.verifiedAt || document.verifiedBy?.name) && (
                            <p className="mt-1 text-xs text-slate-500">
                              Reviewed {formatDateTime(document.verifiedAt)}{document.verifiedBy?.name ? ` by ${document.verifiedBy.name}` : ''}
                            </p>
                          )}
                          {document.remarks && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{document.remarks}</p>}
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => openDocument(document)}
                            disabled={openingDocumentId === document.documentId}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100 disabled:cursor-wait disabled:opacity-60"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {openingDocumentId === document.documentId ? 'Opening…' : 'View Document'}
                          </button>
                          {application.applicationStatus === 'UNDER_REVIEW' && document.verificationStatus === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateDocument(document, 'verify')}
                                disabled={documentMutationId !== null}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-wait disabled:opacity-60"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                {documentMutationId === document.documentId ? 'Saving…' : 'Mark Verified'}
                              </button>
                              <button
                                type="button"
                                onClick={() => openRejectConfirmation(document)}
                                disabled={documentMutationId !== null}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-wait disabled:opacity-60"
                              >
                                <XCircle className="h-4 w-4" /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-500">No documents were uploaded.</p>}
              </Section>

              <Section icon={ShieldCheck} title="Administrative Review" description="Read-only information recorded during administrative review.">
                <dl className="grid gap-5 sm:grid-cols-2">
                  <Detail label="Reviewed By" value={application.reviewedBy?.name} />
                  <Detail label="Reviewed At" value={formatDateTime(application.reviewedAt)} />
                  <Detail label="Admin Remarks" value={application.adminRemarks} className="sm:col-span-2" />
                  <Detail label="Rejection Reason" value={application.rejectionReason} className="sm:col-span-2" />
                </dl>

                {application.reviewHistory?.length > 0 && (
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <h3 className="text-sm font-bold text-slate-900">Review History</h3>
                    <ol className="mt-3 space-y-3">
                      {application.reviewHistory.map((item) => (
                        <li key={item.id} className="rounded-xl bg-slate-50 p-4 text-sm">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <span className="font-bold text-slate-800">{humanize(item.action)}</span>
                            <span className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.performedBy?.name || 'Administrator'}
                            {item.previousStatus || item.newStatus
                              ? ` · ${humanize(item.previousStatus)} → ${humanize(item.newStatus)}`
                              : ''}
                          </p>
                          {item.remark && <p className="mt-2 whitespace-pre-wrap text-slate-600">{item.remark}</p>}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </Section>
            </div>
          )}
        </div>
      </main>
      {rejectingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="reject-document-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
            <h2 id="reject-document-title" className="text-xl font-bold text-slate-900">Reject document?</h2>
            <p className="mt-2 break-all text-sm leading-6 text-slate-600">
              Record why <strong>{rejectingDocument.originalFilename || 'this document'}</strong> cannot be accepted.
            </p>
            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                const reason = rejectionReason.trim();
                if (reason) updateDocument(rejectingDocument, 'reject', reason);
              }}
            >
              <label htmlFor="document-rejection-reason" className="block text-sm font-semibold text-slate-700">Rejection reason</label>
              <textarea
                id="document-rejection-reason"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                rows={4}
                maxLength={2000}
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                placeholder="Explain what is wrong with this document"
              />
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingDocument(null);
                    setRejectionReason('');
                  }}
                  disabled={documentMutationId !== null}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rejectionReason.trim() || documentMutationId !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  {documentMutationId === rejectingDocument.documentId ? 'Rejecting…' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {decisionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="application-decision-dialog-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
            <h2 id="application-decision-dialog-title" className="text-xl font-bold text-slate-900">
              {decisionDialog === 'approve' ? 'Approve application?' : decisionDialog === 'reject' ? 'Reject application?' : 'Request application changes?'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {decisionDialog === 'approve'
                ? 'This marks the application APPROVED. It does not activate the instructor, create an instructor profile, or assign subjects.'
                : decisionDialog === 'reject'
                  ? 'Record the reason this application cannot be accepted.'
                  : 'Tell the applicant what must be updated before another review.'}
            </p>
            {decisionError && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{decisionError}</p>}
            <form className="mt-5" onSubmit={submitDecision}>
              <label htmlFor="application-decision-text" className="block text-sm font-semibold text-slate-700">
                {decisionDialog === 'approve' ? 'Approval remarks (optional)' : decisionDialog === 'reject' ? 'Rejection reason' : 'Requested changes'}
              </label>
              <textarea
                id="application-decision-text"
                value={decisionText}
                onChange={(event) => setDecisionText(event.target.value)}
                rows={5}
                maxLength={2000}
                required={decisionDialog !== 'approve'}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
              />
              <p className="mt-1 text-right text-xs text-slate-400">{decisionText.length}/2000</p>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setDecisionDialog(null)} disabled={isDeciding} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">Cancel</button>
                <button
                  type="submit"
                  disabled={isDeciding || (decisionDialog !== 'approve' && !decisionText.trim())}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${decisionDialog === 'approve' ? 'bg-emerald-700 hover:bg-emerald-800' : decisionDialog === 'reject' ? 'bg-rose-700 hover:bg-rose-800' : 'bg-amber-700 hover:bg-amber-800'}`}
                >
                  {isDeciding ? 'Saving…' : decisionDialog === 'approve' ? 'Confirm Approval' : decisionDialog === 'reject' ? 'Confirm Rejection' : 'Send Change Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showActivationDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="activate-instructor-dialog-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
            <h2 id="activate-instructor-dialog-title" className="text-xl font-bold text-slate-900">Activate this instructor?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This converts the applicant account to Instructor, creates an active InstructorProfile and subject assignments, and grants Instructor-level application permissions.
            </p>
            {activationError && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{activationError}</p>}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowActivationDialog(false)} disabled={isActivating} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">Cancel</button>
              <button type="button" onClick={submitActivation} disabled={isActivating} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">
                <UserCheck className="h-4 w-4" /> {isActivating ? 'Activating…' : 'Confirm Activation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
