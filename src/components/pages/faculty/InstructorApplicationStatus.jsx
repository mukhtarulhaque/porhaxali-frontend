import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CircleCheckBig,
  Clock3,
  Eye,
  FilePenLine,
  FileText,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { BarLoader } from 'react-spinners';
import { getMyApplication } from '../../../api/InstructorApplication';

const STATUS_CONTENT = {
  DRAFT: {
    title: 'Application Incomplete',
    description: 'Your application is still a draft. Complete the remaining steps when you are ready.',
    icon: FilePenLine,
    iconClasses: 'border-amber-200 bg-amber-50 text-amber-700',
    badgeClasses: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  SUBMITTED: {
    title: 'Application Submitted Successfully',
    description: 'Your application has been submitted successfully and is awaiting administrative review.',
    icon: CircleCheckBig,
    iconClasses: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    badgeClasses: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  UNDER_REVIEW: {
    title: 'Application Under Review',
    description: 'Your application is currently being reviewed by the Porhaxali team.',
    icon: Search,
    iconClasses: 'border-blue-200 bg-blue-50 text-blue-700',
    badgeClasses: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  APPROVED: {
    title: 'Application Approved',
    description: 'Your instructor application has been approved.',
    icon: CircleCheckBig,
    iconClasses: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    badgeClasses: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  REJECTED: {
    title: 'Application Not Approved',
    description: 'Your instructor application was not approved.',
    icon: XCircle,
    iconClasses: 'border-rose-200 bg-rose-50 text-rose-700',
    badgeClasses: 'border-rose-200 bg-rose-50 text-rose-700',
  },
};

const FALLBACK_STATUS_CONTENT = {
  title: 'Application Status',
  description: 'Your application status is available below.',
  icon: Clock3,
  iconClasses: 'border-slate-200 bg-slate-50 text-slate-700',
  badgeClasses: 'border-slate-200 bg-slate-50 text-slate-700',
};

const formatStatus = (status) => status?.replaceAll('_', ' ') ?? 'Unavailable';

const formatDateTime = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
};

const getErrorContent = (error) => {
  if (error.response?.status === 404) {
    return {
      title: 'Application not found',
      message: 'We could not find an instructor application for your account.',
    };
  }
  if (error.response?.status === 401) {
    return {
      title: 'Session expired',
      message: 'Please sign in again to view your application status.',
    };
  }

  return {
    title: 'Unable to load application',
    message: error.response?.data?.message ?? 'We could not load your application status. Please try again.',
  };
};

export default function InstructorApplicationStatus() {
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadApplication = useCallback(async () => {
    try {
      setApplication(await getMyApplication());
    } catch (requestError) {
      console.error('Unable to load instructor application status', requestError);
      setError(getErrorContent(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retryLoadApplication = () => {
    setIsLoading(true);
    setError(null);
    loadApplication();
  };

  useEffect(() => {
    let active = true;
    getMyApplication()
      .then((loadedApplication) => {
        if (active) setApplication(loadedApplication);
      })
      .catch((requestError) => {
        console.error('Unable to load instructor application status', requestError);
        if (active) setError(getErrorContent(requestError));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, []);

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50" aria-busy="true">
        <BarLoader color="#059669" width={220} aria-label="Loading application status" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12 font-montserrat sm:px-6">
        <section role="alert" className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-sm sm:p-9">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
            <XCircle className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">{error.title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{error.message}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={retryLoadApplication}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            {error.title === 'Application not found' && (
              <Link
                to="/completeFacultyApplication"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Start Application
              </Link>
            )}
          </div>
        </section>
      </main>
    );
  }

  const status = application.applicationStatus;
  const content = STATUS_CONTENT[status] ?? FALLBACK_STATUS_CONTENT;
  const StatusIcon = content.icon;
  const isDraft = status === 'DRAFT';

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 font-montserrat sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative px-6 py-8 sm:px-9 sm:py-10">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-100/60 blur-3xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border ${content.iconClasses}`}>
                <StatusIcon className="h-8 w-8" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Instructor Application</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{content.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{content.description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${content.badgeClasses}`}>
                    Status: {formatStatus(status)}
                  </span>
                  {application.submittedAt && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      Submitted {formatDateTime(application.submittedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {status === 'REJECTED' && application.rejectionReason && (
            <div className="border-t border-rose-100 bg-rose-50/70 px-6 py-5 sm:px-9">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Reason provided</p>
              <p className="mt-2 text-sm leading-6 text-rose-900">{application.rejectionReason}</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Application Summary</h2>
              <p className="text-xs text-slate-500">Details from your saved instructor application</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Applicant Name</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{application.applicantName || 'Not available'}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</dt>
              <dd className="mt-1 break-all text-sm font-semibold text-slate-800">{application.applicantEmail || 'Not available'}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{application.phoneNumber || 'Not available'}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Application Status</dt>
              <dd className="mt-1 text-sm font-semibold capitalize text-slate-800">{formatStatus(status).toLowerCase()}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Submitted Date</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{formatDateTime(application.submittedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Attached Documents</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{application.documents?.length ?? 0}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
            {isDraft ? (
              <Link
                to="/completeFacultyApplication"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20"
              >
                <FilePenLine className="h-4 w-4" />
                Continue Application
              </Link>
            ) : (
              <Link
                to="/faculty/application/view"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/10"
              >
                <Eye className="h-4 w-4" />
                View Submitted Application
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
