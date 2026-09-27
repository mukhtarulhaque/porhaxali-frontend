import { RefreshCw } from 'lucide-react';
import { BarLoader } from 'react-spinners';

export default function FacultyRequestedSubjects({
  subjects,
  selectedSubjectIds,
  isEditable,
  isLoading,
  loadError,
  validationError,
  onToggle,
  onRetry,
}) {
  return (
    <section className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-5 font-montserrat sm:col-span-2">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Subjects You Want to Teach <span className="text-rose-500">*</span>
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Select one or more subjects you would like to teach. Final subject approval is decided during application review.
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-24 items-center justify-center" aria-busy="true">
          <BarLoader color="#059669" width={150} aria-label="Loading available subjects" />
        </div>
      ) : loadError ? (
        <div role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 font-semibold transition hover:bg-rose-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
        </div>
      ) : subjects.length === 0 ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
          No active subjects are currently available. You may save this application as a draft, but it cannot be submitted yet.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {subjects.map((subject) => {
            const checked = selectedSubjectIds.includes(subject.id);
            const inactive = subject.status && subject.status !== 'ACTIVE';
            return (
              <label
                key={subject.id}
                className={`flex items-start gap-3 rounded-lg border px-3.5 py-3 text-sm transition ${
                  checked
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                    : 'border-slate-200 bg-white text-slate-700'
                } ${isEditable ? 'cursor-pointer hover:border-emerald-300' : 'cursor-default opacity-75'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!isEditable || (inactive && !checked)}
                  onChange={() => onToggle(subject.id)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-emerald-700"
                />
                <span>
                  <span className="block font-semibold">{subject.name}</span>
                  {subject.code && <span className="mt-0.5 block text-xs text-slate-500">{subject.code}</span>}
                  {inactive && (
                    <span className="mt-1 block text-xs font-semibold text-amber-700">
                      No longer active — remove this subject before saving or submitting.
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {validationError && <p className="mt-3 text-xs font-medium text-rose-600">{validationError}</p>}
      {!isEditable && (
        <p className="mt-3 text-xs text-slate-500">Requested subjects cannot be changed in the current application status.</p>
      )}
    </section>
  );
}
