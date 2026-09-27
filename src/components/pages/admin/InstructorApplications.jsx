import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { getInstructorApplications } from '../../../api/AdminInstructorApplications';
import Sidebar from '../student/Sidebar';
import { adminTabs } from '../commom/CommonArrays';

const PAGE_SIZE = 20;
const APPLICATION_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'CHANGES_REQUESTED',
  'APPROVED',
  'REJECTED',
];

const STATUS_STYLES = {
  DRAFT: 'border-slate-200 bg-slate-50 text-slate-700',
  SUBMITTED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  UNDER_REVIEW: 'border-blue-200 bg-blue-50 text-blue-700',
  CHANGES_REQUESTED: 'border-amber-200 bg-amber-50 text-amber-700',
  APPROVED: 'border-teal-200 bg-teal-50 text-teal-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
};

const humanizeStatus = (status) => {
  if (!status) return 'Unknown';
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDateTime = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getReviewLabel = (status) => {
  if (status === 'SUBMITTED') return 'Review';
  if (status === 'UNDER_REVIEW') return 'Continue Review';
  if (status === 'APPROVED' || status === 'REJECTED') return 'View Decision';
  return 'View';
};

const parsePage = (value) => {
  const page = Number.parseInt(value ?? '0', 10);
  return Number.isInteger(page) && page >= 0 ? page : 0;
};

function ApplicationSearch({ initialValue, onSearch }) {
  const [value, setValue] = useState(initialValue);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(value.trim());
      }}
      className="min-w-0"
    >
      <label htmlFor="application-search" className="mb-1.5 block text-sm font-semibold text-slate-700">Search applicants</label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="application-search"
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Name or email"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
          />
        </div>
        <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200">
          Search
        </button>
      </div>
    </form>
  );
}

export default function InstructorApplications() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const status = APPLICATION_STATUSES.includes(statusParam) ? statusParam : '';
  const search = searchParams.get('search')?.trim() ?? '';
  const page = parsePage(searchParams.get('page'));
  const [requestVersion, setRequestVersion] = useState(0);
  const requestKey = `${status}|${search}|${page}|${requestVersion}`;
  const [requestState, setRequestState] = useState({ data: null, error: false, key: '' });
  const pageData = requestState.data;
  const error = requestState.key === requestKey && requestState.error;
  const isLoading = requestState.key !== requestKey;

  const updateQuery = useCallback((updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === undefined || value === null || (key === 'page' && value === 0)) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let active = true;

    getInstructorApplications({
      status: status || undefined,
      search: search || undefined,
      page,
      size: PAGE_SIZE,
    })
      .then((response) => {
        if (!active) return;
        if (page > 0 && (response.totalPages === 0 || page >= response.totalPages)) {
          updateQuery({ page: Math.max(response.totalPages - 1, 0) });
          return;
        }
        setRequestState({ data: response, error: false, key: requestKey });
      })
      .catch((requestError) => {
        console.error('Unable to load instructor applications', requestError);
        if (active) setRequestState({ data: null, error: true, key: requestKey });
      });

    return () => { active = false; };
  }, [page, requestKey, search, status, updateQuery]);

  const hasFilters = Boolean(status || search);
  const applications = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const currentPage = pageData?.number ?? page;
  const returnTo = `${location.pathname}${location.search}`;

  const resultSummary = useMemo(() => {
    if (!pageData || pageData.totalElements === 0) return null;
    const first = currentPage * pageData.size + 1;
    const last = Math.min(first + applications.length - 1, pageData.totalElements);
    return `Showing ${first}–${last} of ${pageData.totalElements}`;
  }, [applications.length, currentPage, pageData]);

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 font-montserrat text-slate-800">
      <Sidebar pageId="instructorApplications" tabs={adminTabs} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-700">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-700">Admin review queue</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Instructor Applications</h1>
              <p className="mt-2 text-sm text-slate-600">Search and review submitted instructor applications.</p>
            </div>
          </div>

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="application-filters">
            <div className="border-b border-slate-200 p-4 sm:p-6">
              <h2 id="application-filters" className="sr-only">Application filters</h2>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem_auto] lg:items-end">
                <ApplicationSearch
                  key={search}
                  initialValue={search}
                  onSearch={(value) => updateQuery({ search: value, page: 0 })}
                />

                <div>
                  <label htmlFor="application-status" className="mb-1.5 block text-sm font-semibold text-slate-700">Status</label>
                  <select
                    id="application-status"
                    value={status}
                    onChange={(event) => updateQuery({ status: event.target.value, page: 0 })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
                  >
                    <option value="">All statuses</option>
                    {APPLICATION_STATUSES.map((applicationStatus) => (
                      <option key={applicationStatus} value={applicationStatus}>{humanizeStatus(applicationStatus)}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </button>
              </div>
            </div>

            {error ? (
              <div role="alert" className="px-6 py-16 text-center">
                <h2 className="text-lg font-bold text-slate-900">Unable to load instructor applications</h2>
                <p className="mt-2 text-sm text-slate-600">The review queue could not be loaded. Please try again.</p>
                <button
                  type="button"
                  onClick={() => setRequestVersion((version) => version + 1)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            ) : isLoading && !pageData ? (
              <div className="space-y-3 p-6" aria-label="Loading instructor applications" aria-busy="true">
                {[0, 1, 2, 3, 4].map((row) => <div key={row} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : applications.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <h2 className="text-lg font-bold text-slate-900">{hasFilters ? 'No applications match these filters' : 'No instructor applications exist'}</h2>
                <p className="mt-2 text-sm text-slate-600">{hasFilters ? 'Try clearing the search or status filter.' : 'New applications will appear here when they are submitted.'}</p>
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className="mt-5 text-sm font-bold text-pink-700 underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-pink-300">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="relative overflow-x-auto" aria-busy={isLoading}>
                  {isLoading && <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-pink-500" />}
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th scope="col" className="px-6 py-4">Applicant</th>
                        <th scope="col" className="px-4 py-4">Requested subjects</th>
                        <th scope="col" className="px-4 py-4">Status</th>
                        <th scope="col" className="px-4 py-4">Submitted</th>
                        <th scope="col" className="px-4 py-4">Review</th>
                        <th scope="col" className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {applications.map((application) => (
                        <tr key={application.applicationId} className="transition hover:bg-slate-50/80">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{application.applicantName || 'Name unavailable'}</p>
                            <p className="mt-1 break-all text-xs text-slate-500">{application.email || 'Email unavailable'}</p>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {application.requestedSubjects?.length
                              ? application.requestedSubjects.map((subject) => subject.subjectName).filter(Boolean).join(', ')
                              : 'None listed'}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[application.applicationStatus] ?? STATUS_STYLES.DRAFT}`}>
                              {humanizeStatus(application.applicationStatus)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-600">{formatDateTime(application.submittedAt)}</td>
                          <td className="px-4 py-4 text-slate-600">
                            <p>{application.reviewStartedAt ? formatDateTime(application.reviewStartedAt) : 'Not started'}</p>
                            {application.reviewStartedBy?.name && <p className="mt-1 text-xs text-slate-500">by {application.reviewStartedBy.name}</p>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              to={`/admin/instructor-applications/${application.applicationId}/review`}
                              state={{ from: returnTo }}
                              className="inline-flex rounded-lg bg-pink-50 px-3 py-2 text-xs font-bold text-pink-700 transition hover:bg-pink-100 focus:outline-none focus:ring-4 focus:ring-pink-100"
                            >
                              {getReviewLabel(application.applicationStatus)}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-sm text-slate-500">{resultSummary}</p>
                  <nav className="flex items-center gap-2" aria-label="Application list pagination">
                    <button
                      type="button"
                      onClick={() => updateQuery({ page: currentPage - 1 })}
                      disabled={currentPage <= 0 || isLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </button>
                    <span className="px-2 text-sm font-semibold text-slate-700">Page {currentPage + 1} of {Math.max(totalPages, 1)}</span>
                    <button
                      type="button"
                      onClick={() => updateQuery({ page: currentPage + 1 })}
                      disabled={currentPage >= totalPages - 1 || isLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
