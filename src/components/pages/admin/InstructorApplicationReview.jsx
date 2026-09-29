import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  ExternalLink,
  FileText,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  getInstructorApplication,
  getInstructorApplicationDocumentViewUrl,
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
                    <span className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${APPLICATION_STATUS_STYLES[application.applicationStatus] ?? APPLICATION_STATUS_STYLES.DRAFT}`}>
                      {humanize(application.applicationStatus)}
                    </span>
                  </div>
                </div>
              </header>

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
                        <button
                          type="button"
                          onClick={() => openDocument(document)}
                          disabled={openingDocumentId === document.documentId}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100 disabled:cursor-wait disabled:opacity-60"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {openingDocumentId === document.documentId ? 'Opening…' : 'View Document'}
                        </button>
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
    </div>
  );
}
