import { useEffect, useState } from 'react';
import { ArrowRight, ClipboardCheck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getInstructorApplicationCounts } from '../../../api/AdminInstructorApplications';
import Sidebar from '../student/Sidebar';
import { adminTabs } from '../commom/CommonArrays';

export default function Dashboard() {
  const [requestVersion, setRequestVersion] = useState(0);
  const [requestState, setRequestState] = useState({ counts: null, error: false, version: -1 });
  const isLoading = requestState.version !== requestVersion;
  const { counts, error } = requestState;

  useEffect(() => {
    let active = true;
    getInstructorApplicationCounts()
      .then((response) => {
        if (active) setRequestState({ counts: response, error: false, version: requestVersion });
      })
      .catch((requestError) => {
        console.error('Unable to load instructor application counts', requestError);
        if (active) setRequestState({ counts: null, error: true, version: requestVersion });
      });

    return () => { active = false; };
  }, [requestVersion]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 font-montserrat text-slate-800">
      <Sidebar pageId="adminDashboard" tabs={adminTabs} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-700">Administration</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Overview System</h1>
            <p className="mt-2 text-sm text-slate-600">Monitor the review queue and manage Porhaxali operations.</p>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              <div className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-label="Loading instructor application review count" aria-busy="true">
                <div className="h-11 w-11 rounded-xl bg-slate-100" />
                <div className="mt-5 h-4 w-40 rounded bg-slate-100" />
                <div className="mt-3 h-9 w-28 rounded bg-slate-100" />
                <div className="mt-5 h-4 w-52 rounded bg-slate-100" />
              </div>
            ) : error ? (
              <section role="alert" className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-lg font-bold text-slate-900">Instructor Applications</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">The pending review count is temporarily unavailable.</p>
                <button
                  type="button"
                  onClick={() => setRequestVersion((version) => version + 1)}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-bold text-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100"
                >
                  <RefreshCw className="h-4 w-4" /> Try again
                </button>
              </section>
            ) : (
              <Link
                to="/admin/instructor-applications"
                aria-label={`${counts.totalPendingReview} instructor applications pending review. View instructor applications.`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-pink-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-pink-700">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-pink-600" />
                </div>
                <p className="mt-5 text-sm font-bold text-slate-900">Instructor Applications</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{counts.totalPendingReview}</p>
                <p className="text-sm font-medium text-slate-500">pending review</p>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{counts.submitted} Submitted</span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">{counts.underReview} Under Review</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
