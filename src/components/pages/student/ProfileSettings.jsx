import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Check,
  CircleCheck,
  CircleDashed,
  GraduationCap,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import Sidebar from './Sidebar';
import UseAuth from '../../Hooks/UseAuth';
import { studentTabs } from '../commom/CommonArrays';
import Axios from '../../../api/Axios';
import { GET_MY_STUDENT_PROFILE, SAVE_MY_STUDENT_PROFILE } from '../../../api/Urls';
import { BarLoader } from 'react-spinners';

const initialForm = {
  className: '',
  board: '',
  medium: '',
  preferredSubjects: '',
  learningGoal: '',
  guardianName: '',
  guardianPhone: '',
  guardianRelation: '',
};

const fieldLabels = {
  className: 'Class',
  board: 'Board',
  medium: 'Medium',
  preferredSubjects: 'Preferred Subjects',
  learningGoal: 'Learning Goal',
  guardianName: 'Guardian Name',
  guardianPhone: 'Guardian Phone',
  guardianRelation: 'Guardian Relation',
  'learningPreferences.preferredSubjects': 'Preferred Subjects',
  'learningPreferences.learningGoal': 'Learning Goal',
  'guardianInfo.name': 'Guardian Name',
  'guardianInfo.phone': 'Guardian Phone',
  'guardianInfo.relation': 'Guardian Relation',
};

const requiredFormFields = ['className', 'board', 'medium'];

const toFormState = (profile) => ({
  className: profile?.className ?? '',
  board: profile?.board ?? '',
  medium: profile?.medium ?? '',
  preferredSubjects: Array.isArray(profile?.learningPreferences?.preferredSubjects)
    ? profile.learningPreferences.preferredSubjects.join(', ')
    : '',
  learningGoal: profile?.learningPreferences?.learningGoal ?? '',
  guardianName: profile?.guardianInfo?.name ?? '',
  guardianPhone: profile?.guardianInfo?.phone ?? '',
  guardianRelation: profile?.guardianInfo?.relation ?? '',
});

export default function ProfileSettings() {
  const { auth, updateStudentProfileState } = UseAuth();
  const [form, setForm] = useState(initialForm);
  const [completionSummary, setCompletionSummary] = useState(auth?.studentProfileCompletion);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${auth.jwtToken}`,
    Accept: 'application/json',
  }), [auth.jwtToken]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth?.jwtToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await Axios.get(GET_MY_STUDENT_PROFILE, { headers: authHeaders });
        const profile = response.data.data;
        setForm(toFormState(profile));
        setCompletionSummary(profile?.completionSummary);
        updateStudentProfileState(profile);
      } catch (error) {
        console.error('Unable to fetch student profile', error);
        setErrorMessage(error.response?.data?.message ?? 'Unable to load your student profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [auth?.jwtToken, authHeaders, updateStudentProfileState]);

  const completionPercentage = completionSummary?.completionPercentage ?? 0;
  const missingRequiredFields = completionSummary?.missingRequiredFields ?? [];
  const isProfileCompleted = completionSummary?.profileCompleted ?? false;
  const initials = (auth?.userName ?? 'Student')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isFieldFilled = (field) => Boolean(form[field]?.trim());

  const getInputClassName = (field, leftPadding = false) => {
    const baseClasses = 'w-full rounded-xl border py-2 text-sm shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2';
    const paddingClasses = leftPadding ? 'pl-9 pr-4' : 'px-4';

    if (isFieldFilled(field)) {
      return `${baseClasses} ${paddingClasses} border-emerald-200 bg-emerald-50/50 text-gray-900 focus:ring-emerald-500`;
    }

    return `${baseClasses} ${paddingClasses} border-amber-200 bg-amber-50/70 text-gray-900 placeholder:text-amber-700/50 focus:ring-amber-500`;
  };

  const renderFieldLabel = (field, label, required = false) => {
    const filled = isFieldFilled(field);

    return (
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            filled
              ? 'bg-emerald-100 text-emerald-700'
              : required
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700'
          }`}
        >
          {filled ? <CircleCheck className="h-3 w-3" /> : <CircleDashed className="h-3 w-3" />}
          {filled ? 'Filled' : required ? 'Required' : 'Not filled'}
        </span>
      </div>
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const missingFields = requiredFormFields.filter((field) => !form[field].trim());
    if (missingFields.length > 0) {
      setErrorMessage(`Please fill ${missingFields.map((field) => fieldLabels[field]).join(', ')}.`);
      return false;
    }
    return true;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    const preferredSubjects = form.preferredSubjects
      .split(',')
      .map((subject) => subject.trim())
      .filter(Boolean);

    const payload = {
      className: form.className.trim(),
      board: form.board.trim(),
      medium: form.medium.trim(),
      learningPreferences: {
        preferredSubjects,
        learningGoal: form.learningGoal.trim(),
      },
      guardianInfo: {
        name: form.guardianName.trim(),
        phone: form.guardianPhone.trim(),
        relation: form.guardianRelation.trim(),
      },
    };

    setIsSaving(true);
    try {
      const response = await Axios.put(SAVE_MY_STUDENT_PROFILE, payload, {
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
      });
      const savedProfile = response.data.data;
      setForm(toFormState(savedProfile));
      setCompletionSummary(savedProfile?.completionSummary);
      updateStudentProfileState(savedProfile);
      setSuccessMessage(response.data.message ?? 'Student profile saved successfully.');
    } catch (error) {
      console.error('Unable to save student profile', error);
      setErrorMessage(error.response?.data?.message ?? 'Unable to save your student profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50 font-montserrat text-gray-900 antialiased">
      <Sidebar pageId="ProfileSettings" tabs={studentTabs} />

      <div className="w-full">
        {successMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-lg">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}

        <div className="px-6 pb-4 pt-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Student Profile</h1>
          <p className="mt-1 text-gray-500">Complete the academic details required before enrolling in a batch.</p>
        </div>

        {isLoading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <BarLoader color="#36d7b7" loading={isLoading} width={200} aria-label="Loading Bar" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[320px_1fr]">
            <aside className="space-y-6">
              <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-rose-500/20 bg-linear-to-br from-rose-50 to-white text-2xl font-bold text-rose-500 shadow-inner">
                  {initials}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{auth.userName}</h2>
                <p className="text-sm text-gray-500">{auth.userEmail}</p>
                <div className="mt-4 flex justify-center gap-2 border-t border-gray-100 pt-4">
                  <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">{auth.userRole}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    isProfileCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {isProfileCompleted ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Profile Completion</h3>
                  <span className="text-sm font-bold text-rose-600">{completionPercentage}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200/70">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isProfileCompleted
                        ? 'bg-linear-to-r from-emerald-500 to-teal-500'
                        : 'bg-linear-to-r from-amber-400 via-pink-500 to-rose-500'
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                {missingRequiredFields.length > 0 ? (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
                    Missing: {missingRequiredFields.map((field) => fieldLabels[field] ?? field).join(', ')}
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                    Ready for batch enrollment.
                  </div>
                )}
              </section>
            </aside>

            <form onSubmit={handleSave} className="space-y-6">
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {errorMessage}
                </div>
              )}

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">
                  <GraduationCap className="h-5 w-5 text-rose-500" />
                  Academic Details
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    {renderFieldLabel('className', 'Class', true)}
                    <div className="relative">
                      <BookOpen className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                        isFieldFilled('className') ? 'text-emerald-600' : 'text-amber-600'
                      }`} />
                      <input
                        type="text"
                        name="className"
                        value={form.className}
                        onChange={handleChange}
                        required
                        placeholder="Class 10"
                        className={getInputClassName('className', true)}
                      />
                    </div>
                  </div>

                  <div>
                    {renderFieldLabel('board', 'Board', true)}
                    <input
                      type="text"
                      name="board"
                      value={form.board}
                      onChange={handleChange}
                      required
                      placeholder="SEBA, CBSE, AHSEC"
                      className={getInputClassName('board')}
                    />
                  </div>

                  <div>
                    {renderFieldLabel('medium', 'Medium', true)}
                    <input
                      type="text"
                      name="medium"
                      value={form.medium}
                      onChange={handleChange}
                      required
                      placeholder="English, Assamese"
                      className={getInputClassName('medium')}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">
                  <User className="h-5 w-5 text-rose-500" />
                  Learning Preferences
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    {renderFieldLabel('preferredSubjects', 'Preferred Subjects')}
                    <input
                      type="text"
                      name="preferredSubjects"
                      value={form.preferredSubjects}
                      onChange={handleChange}
                      placeholder="Mathematics, Science"
                      className={getInputClassName('preferredSubjects')}
                    />
                  </div>

                  <div>
                    {renderFieldLabel('learningGoal', 'Learning Goal')}
                    <input
                      type="text"
                      name="learningGoal"
                      value={form.learningGoal}
                      onChange={handleChange}
                      placeholder="Improve exam preparation"
                      className={getInputClassName('learningGoal')}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">
                  <Users className="h-5 w-5 text-rose-500" />
                  Guardian Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    {renderFieldLabel('guardianName', 'Guardian Name')}
                    <input
                      type="text"
                      name="guardianName"
                      value={form.guardianName}
                      onChange={handleChange}
                      placeholder="Name"
                      className={getInputClassName('guardianName')}
                    />
                  </div>

                  <div>
                    {renderFieldLabel('guardianPhone', 'Phone')}
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                        isFieldFilled('guardianPhone') ? 'text-emerald-600' : 'text-amber-600'
                      }`} />
                      <input
                        type="text"
                        name="guardianPhone"
                        value={form.guardianPhone}
                        onChange={handleChange}
                        placeholder="+91 ..."
                        className={getInputClassName('guardianPhone', true)}
                      />
                    </div>
                  </div>

                  <div>
                    {renderFieldLabel('guardianRelation', 'Relation')}
                    <input
                      type="text"
                      name="guardianRelation"
                      value={form.guardianRelation}
                      onChange={handleChange}
                      placeholder="Father, Mother"
                      className={getInputClassName('guardianRelation')}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3 text-lg font-bold text-gray-900">
                  <Mail className="h-5 w-5 text-rose-500" />
                  Account
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Full Name</label>
                    <input
                      type="text"
                      value={auth.userName ?? ''}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Email Address</label>
                    <input
                      type="email"
                      value={auth.userEmail ?? ''}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500"
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-end pb-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Student Profile'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
