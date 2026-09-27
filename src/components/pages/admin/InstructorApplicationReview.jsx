import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Sidebar from '../student/Sidebar';
import { adminTabs } from '../commom/CommonArrays';

export default function InstructorApplicationReview() {
  const { applicationId } = useParams();
  const location = useLocation();
  const backTo = typeof location.state?.from === 'string'
    && location.state.from.startsWith('/admin/instructor-applications')
    ? location.state.from
    : '/admin/instructor-applications';

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 font-montserrat text-slate-800">
      <Sidebar pageId="instructorApplications" tabs={adminTabs} />
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Instructor Applications
          </Link>

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-7 sm:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-700">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-700">Admin review</p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Instructor Application Review</h1>
                  <p className="mt-2 text-sm text-slate-500">Application ID: {applicationId}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-12 text-center sm:px-8 sm:py-16">
              <h2 className="text-lg font-bold text-slate-900">Review details are coming next</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                This protected route is ready. Application details, documents, review history, and decision actions will be added in the next frontend slice.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
