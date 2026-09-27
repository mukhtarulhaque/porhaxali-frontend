import { GraduationCap, Plus, Trash2 } from 'lucide-react';

const fieldClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70';

export default function FacultyQualifications({
  qualifications,
  isEditable,
  errors,
  onChange,
  onAdd,
  onRemove,
}) {
  return (
    <section className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-5 font-montserrat sm:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-emerald-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Academic Qualifications <span className="text-rose-500">*</span>
            </h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Add at least one completed qualification. Institution, specialization, and completion year provide useful review context.
          </p>
        </div>
        {isEditable && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Qualification
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {qualifications.map((qualification, index) => (
          <div key={qualification.clientId} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Qualification {index + 1}</p>
              {isEditable && (
                <button
                  type="button"
                  onClick={() => onRemove(qualification.clientId)}
                  className="inline-flex items-center gap-1 rounded-md p-1.5 text-xs text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  aria-label={`Remove qualification ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600">
                Qualification Name <span className="text-rose-500">*</span>
                <input
                  type="text"
                  value={qualification.qualificationName ?? ''}
                  maxLength={500}
                  disabled={!isEditable}
                  onChange={(event) => onChange(qualification.clientId, 'qualificationName', event.target.value)}
                  placeholder="e.g. M.Sc. in Mathematics"
                  className={fieldClass}
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Institution
                <input
                  type="text"
                  value={qualification.institutionName ?? ''}
                  maxLength={255}
                  disabled={!isEditable}
                  onChange={(event) => onChange(qualification.clientId, 'institutionName', event.target.value)}
                  placeholder="e.g. Gauhati University"
                  className={fieldClass}
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Specialization
                <input
                  type="text"
                  value={qualification.specialization ?? ''}
                  maxLength={255}
                  disabled={!isEditable}
                  onChange={(event) => onChange(qualification.clientId, 'specialization', event.target.value)}
                  placeholder="e.g. Applied Mathematics"
                  className={fieldClass}
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Completion Year
                <input
                  type="number"
                  min="1000"
                  max={new Date().getFullYear()}
                  value={qualification.completionYear ?? ''}
                  disabled={!isEditable}
                  onChange={(event) => onChange(qualification.clientId, 'completionYear', event.target.value)}
                  placeholder={String(new Date().getFullYear())}
                  className={fieldClass}
                />
              </label>
            </div>
            {errors?.[qualification.clientId] && (
              <p className="mt-3 text-xs font-medium text-rose-600">{errors[qualification.clientId]}</p>
            )}
          </div>
        ))}
      </div>

      {errors?.summary && <p className="mt-3 text-xs font-medium text-rose-600">{errors.summary}</p>}
    </section>
  );
}
