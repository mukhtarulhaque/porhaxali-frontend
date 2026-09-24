import {useState,useRef, useEffect} from "react";
import { User, Briefcase, FileText, FileUp } from 'lucide-react';
import { BarLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import useAuth from "../../Hooks/UseAuth";
import Input from "../commom/Input";
import Label from "../commom/Label";
import FacultyProfilePhoto from "./facultyComponents/FacultyProfilePhoto";
import { getAddressError, getDobError, getExperienceYearsError, getBiodataError } from "./facultyComponents/Validator";
import FacultyApplicationDocuments from './facultyComponents/FacultyApplicationDocuments';
import DynamicModal from '../commom/Modals/DynamicModal';
import {
    createMyApplication,
    getMyApplication,
    getProfilePhotoViewUrl,
    submitMyApplication,
    updateMyApplication,
} from '../../../api/InstructorApplication';
import { EMPTY_APPLICATION } from './instructorApplicationConfig';

const apiMessage = (error, fallback) => error.response?.data?.message ?? fallback;

const CompleteApplication = ({ initialStep = 1, readOnly = false }) => {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [application, setApplication] = useState(null);
    const [isLoadingApplication, setIsLoadingApplication] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
    const [applicationMessage, setApplicationMessage] = useState(null);

    const dateInputRef = useRef(null);
    const navigate = useNavigate();

    const { auth} = useAuth(); 
    const [errors, setErrors] = useState({});
    const isDraft = application?.applicationStatus === 'DRAFT';

    const steps = [
        { id: 1, name: 'Personal & Photo', icon: User },
        { id: 2, name: 'Academic & Exp', icon: Briefcase },
        { id: 3, name: 'Documents', icon: FileUp },
        { id: 4, name: 'Review & Submit', icon: FileText },
      ];
  
    const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      phone: '',
      dob: '',
      address: '',
      experienceYears: '',
      teachingExperienceDescription: '',
      bio: '',
    });

    const applyServerApplication = (loaded) => {
      setApplication(loaded);
      if (loaded.applicationStatus && loaded.applicationStatus !== 'DRAFT') setCurrentStep(4);
      setFormData((current) => ({
        ...current,
        fullName: loaded.applicantName ?? current.fullName,
        email: loaded.applicantEmail ?? current.email,
        phone: loaded.phoneNumber ?? current.phone,
        dob: loaded.dateOfBirth ?? '',
        address: loaded.address ?? '',
        experienceYears: loaded.teachingExperienceYears ?? '',
        teachingExperienceDescription: loaded.teachingExperienceDescription ?? '',
        bio: loaded.bio ?? '',
      }));
      return loaded;
    };

    const refreshApplication = async () => applyServerApplication(await getMyApplication());

    useEffect(() => {
      let active = true;
      const initialize = async () => {
        try {
          let loaded;
          try {
            loaded = await getMyApplication();
          } catch (error) {
            if (error.response?.status !== 404) throw error;
            loaded = await createMyApplication(EMPTY_APPLICATION);
          }
          if (!active) return;
          if (readOnly && loaded.applicationStatus === 'DRAFT') {
            navigate('/completeFacultyApplication', { replace: true });
            return;
          }
          if (!readOnly && loaded.applicationStatus !== 'DRAFT') {
            navigate('/faculty/application/status', { replace: true });
            return;
          }
          applyServerApplication(loaded);
        } catch (error) {
          console.error('Unable to load instructor application', error);
          if (active) setApplicationMessage({ type: 'error', text: apiMessage(error, 'Unable to load your application.') });
        } finally {
          if (active) setIsLoadingApplication(false);
        }
      };
      initialize();
      return () => { active = false; };
    }, [navigate, readOnly]);

    useEffect(() => {
      if (currentStep !== 4 || !application?.profilePhotoPresent) return undefined;

      let active = true;
      getProfilePhotoViewUrl()
        .then((view) => {
          if (active) setPhotoPreview(view.url);
        })
        .catch((error) => {
          console.error('Unable to load profile photo for application review', error);
        });

      return () => { active = false; };
    }, [
      application?.profilePhotoOriginalFileName,
      application?.profilePhotoPresent,
      currentStep,
    ]);

    const saveDraft = async () => {
      if (application?.applicationStatus !== 'DRAFT') {
        setApplicationMessage({ type: 'error', text: 'Only a DRAFT application can be edited.' });
        return false;
      }
      setIsSaving(true);
      setApplicationMessage(null);
      try {
        const saved = await updateMyApplication({
          teachingExperienceYears: formData.experienceYears === '' ? null : Number(formData.experienceYears),
          teachingExperienceDescription: formData.teachingExperienceDescription.trim() || null,
          dateOfBirth: formData.dob || null,
          address: formData.address.trim() || null,
          bio: formData.bio.trim() || null,
        });
        applyServerApplication(saved);
        setApplicationMessage({ type: 'success', text: 'Draft saved successfully.' });
        return true;
      } catch (error) {
        console.error('Unable to save instructor application', error);
        setApplicationMessage({ type: 'error', text: apiMessage(error, 'Unable to save your application.') });
        return false;
      } finally {
        setIsSaving(false);
      }
    };

    const nextStep = async () =>{
        if (!isDraft) {
            setCurrentStep((prev) => Math.min(prev + 1, 4));
            return;
        }
        if(currentStep === 1) {
            const dobError = getDobError(formData.dob);
            const addressError = getAddressError(formData.address);
            if (dobError) {
                setErrors((prev) => ({ ...prev, dob: dobError }));
                return;
              }
            if (addressError) {
                setErrors((prev) => ({ ...prev, address: addressError }));
                return;
                }
            if (await saveDraft()) setCurrentStep((prev) => Math.min(prev + 1, 4));
        }
        if(currentStep === 2) {
            const experiYrError = getExperienceYearsError(formData.experienceYears);
            const biodataError = getBiodataError(formData.bio);
            if(experiYrError) {
                setErrors((prev) => ({ ...prev, experienceYears: experiYrError}));
                return;
            }
            if(biodataError) {
                setErrors((prev) => ({ ...prev, biodata: biodataError}));
                return;
            }
            if (await saveDraft()) setCurrentStep((prev) => Math.min(prev + 1, 4));
        } 
        if(currentStep === 3) {
            setCurrentStep((prev) => Math.min(prev + 1, 4));
        } 
    } 
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  
const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 4 && isDraft) setShowSubmitConfirmation(true);
};

const confirmSubmission = async () => {
  if (isSubmitting || !isDraft) return;
  setIsSubmitting(true);
  setApplicationMessage(null);
  try {
    const submitted = await submitMyApplication();
    applyServerApplication(submitted);
    setShowSubmitConfirmation(false);
    navigate('/faculty/application/status', { replace: true });
  } catch (error) {
    console.error('Unable to submit instructor application', error);
    setApplicationMessage({ type: 'error', text: apiMessage(error, 'Unable to submit your application.') });
  } finally {
    setIsSubmitting(false);
  }
};
// 3. Clear the error dynamically as the user types
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));

  // Auto-clear this field's error once the user begins typing
  if (errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }
};

const handleAddressBlur = (e) => {
  const errorMsg = getAddressError(e.target.value);
  setErrors((prev) => ({ ...prev, address: errorMsg }));
};
 
const handleDobBlur = (e) => {
  const errorMsg = getDobError(e.target.value);
  setErrors((prev) => ({ ...prev, dob: errorMsg }));
};

const openDatePicker = () => {
  if (dateInputRef.current) {
    // Triggers browser's native picker popup
    if (typeof dateInputRef.current.showPicker === 'function') {
      dateInputRef.current.showPicker();
    } else {
      dateInputRef.current.focus();
    }
  }
};

const handleExperienceYearsBlur = (e) => {
    const errorMsg = getExperienceYearsError(e.target.value);
    setErrors((prev) => ({ ...prev, experienceYears: errorMsg }));
};
const handleBioBlur = (e) => {
    const errorMsg = getBiodataError(e.target.value);
    setErrors((prev) => ({ ...prev, biodata: errorMsg }));
};

    if (isLoadingApplication) {
      return <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <BarLoader color="#059669" width={220} aria-label="Loading application" />
      </div>;
    }

    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="relative overflow-hidden border-b border-slate-200/80 bg-white px-6 py-7 sm:px-8">
            <div 
                aria-hidden="true" 
                className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-100/70 blur-3xl"
            />
            <div 
                aria-hidden="true" 
                className="pointer-events-none absolute -bottom-12 left-1/4 h-36 w-36 rounded-full bg-blue-100/60 blur-3xl"
            />
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/80 text-emerald-700 shadow-sm shadow-emerald-500/5">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-4.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                />
                </svg>
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Faculty Onboarding
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] font-medium text-slate-500">Official Portal</span>
                </div>
                <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    Academic Faculty Profile Dossier
                </h2>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Comprehensive bio-data & credentials intake portal
                </p>
                {application?.applicationStatus && <span className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    {application.applicationStatus.replaceAll('_', ' ')}
                </span>}
            </div>
        </div>
            <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-xs text-emerald-600 border border-slate-200/60">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Security Level</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-none">Encrypted Intake</p>
            </div>
            </div>
        </div>
    </div>
          {/* Stepper Progress Bar (Matches Header Theme) */}
            <div className="border-b border-slate-200/80 bg-slate-50/50 px-4 py-4 sm:px-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;

                        return (
                            <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                <div className="flex items-center gap-2.5">
                                    {/* Step Icon / Number Indicator */}
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                                            isCompleted
                                            ? 'border border-emerald-500/20 bg-emerald-600 text-white shadow-xs'
                                            : isCurrent
                                        ? 'border border-emerald-500 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-600/10 shadow-xs'
                                         : 'border border-slate-200 bg-white text-slate-400'
                         }`}
                        >
              {isCompleted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 stroke-[2.5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>

            {/* Step Label */}
            <div className="hidden sm:block">
              <span
                className={`block text-[10px] font-bold uppercase tracking-wider ${
                  isCurrent
                    ? 'text-emerald-700'
                    : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                Step 0{step.id}
              </span>
              <span
                className={`block text-xs font-semibold leading-tight ${
                  isCurrent
                    ? 'text-slate-900'
                    : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {step.name}
              </span>
            </div>
          </div>

          {/* Connector Divider */}
          {idx !== steps.length - 1 && (
            <div
              className={`mx-3 sm:mx-4 h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
</div>
          {/* Form Body */}
          {applicationMessage && <div role={applicationMessage.type === 'error' ? 'alert' : 'status'} className={`mx-6 mt-6 rounded-xl border px-4 py-3 text-xs sm:mx-8 ${applicationMessage.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {applicationMessage.text}
          </div>}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* STEP 1: Personal Details & Camera/Photo */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <FacultyProfilePhoto
                    application={application}
                    isDraft={application?.applicationStatus === 'DRAFT'}
                    photoPreview={photoPreview}
                    setPhotoPreview={setPhotoPreview}
                    onRefresh={refreshApplication}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="font-montserrat">
                    <Label htmlFor="fullName" nameOfLabel="Full Name"/>
                    <Input
                        id="fullName" value={auth.userName} autoComplete="off" type="text" disabled={true} 
                    />
                  </div>
                  <div className="font-montserrat">
                    <Label htmlFor="email" nameOfLabel="Email"/>
                    <Input
                        id="email" value={auth.userEmail} autoComplete="off" type="email" disabled={true}  
                    />
                  </div>
                  <div className="font-montserrat">
                  <Label htmlFor="phone" nameOfLabel="Phone Number"/>
                    <Input
                        id="phone" value={application?.phoneNumber ?? auth.phone ?? ''} autoComplete="off" type="phone" readOnly disabled={true}
                    />
                  </div>
                <div className="w-full font-montserrat">
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Date of Birth <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            ref={dateInputRef}
                            type="date"
                            name="dob"
                            required
                            max={new Date().toISOString().split('T')[0]} // Blocks future dates in picker
                            value={formData.dob || ''}
                            disabled={!isDraft}
                            onChange={handleInputChange}
                            onBlur={handleDobBlur}
                            className={`mt-2 w-full rounded-xl border bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 disabled:cursor-wait disabled:opacity-70 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden ${
                            errors?.dob
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                            : 'border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10'
                            }`}
                        />
                        {/* Custom Calendar Icon Button */}
                            <button
                                type="button"
                                onClick={openDatePicker}
                                disabled={!isDraft}
                                tabIndex={-1}
                                className="absolute cursor-pointer inset-y-0 right-0 top-2 flex items-center pr-4 text-slate-400 hover:text-emerald-600 transition-colors"
                                aria-label="Open date picker"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                                </svg>
                            </button>
                        </div>
                    {/* Validation Error Feedback */}
                    {errors?.dob && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                            <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                                />
                            </svg>
                        {errors.dob}
                        </p>
                    )}
                </div>

                    <div className="w-full font-montserrat">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                            Residential Address <span className="text-rose-500">*</span>
                            </label>
                            <span
                                className={`text-xs ${
                                (formData.address?.length || 0) > 200
                                ? 'font-semibold text-rose-500'
                                : 'text-slate-400'
                                }`}
                            >
                            {formData.address?.length || 0}/200
                             </span>
                        </div>
                        <textarea
                            name="address"
                            rows={3}
                            required
                            maxLength={200}
                            value={formData.address || ''}
                            disabled={!isDraft}
                            onChange={handleInputChange}
                            onBlur={handleAddressBlur}
                            placeholder="Street name, Flat/House No., Landmark, City, State, ZIP"
                            className={`mt-2 w-full resize-none rounded-xl border px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 disabled:cursor-wait disabled:opacity-70 ${
                            errors?.address
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                            : 'border-slate-200 bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10'
                            }`}
                        />
                            {/* Error Message */}
                            {errors?.address && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                                <svg
                                className="h-3.5 w-3.5 shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                >
                                <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                                />
                                </svg>
                                {errors.address}
                             </p>
                            )}
                    </div>
                </div>
              </div>
            )}
  
            {/* STEP 2: Academic & Professional Details */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full font-montserrat">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Years of Experience <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="experienceYears"
                        required
                        value={formData.experienceYears ?? ''}
                        disabled={!isDraft}
                        onChange={handleInputChange}
                        onBlur={handleExperienceYearsBlur}
                        placeholder="e.g. 6"
                        className={`mt-2 w-full rounded-xl border px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 disabled:cursor-wait disabled:opacity-70 ${
                            errors?.experienceYears
                                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                                    : 'border-slate-200 bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10'
                                }`}
                    />
                    {errors?.experienceYears && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                            <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {errors.experienceYears}
                         </p>
                    )}
                </div>
                <div className="w-full font-montserrat sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Teaching Experience Description
                    </label>
                    <textarea
                        name="teachingExperienceDescription"
                        rows={3}
                        value={formData.teachingExperienceDescription || ''}
                        disabled={!isDraft}
                        onChange={handleInputChange}
                        placeholder="Describe your teaching experience, responsibilities, and notable outcomes..."
                        className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                    />
                </div>
                 <div className="w-full font-montserrat sm:col-span-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                            Short Bio <span className="text-rose-500">*</span>
                            </label>
                            <span
                                className={`text-xs ${
                                (formData.bio?.length || 0) > 200
                                ? 'font-semibold text-rose-500'
                                : 'text-slate-400'
                                }`}
                            >
                            {formData.bio?.length || 0}/200
                             </span>
                        </div>
                        <textarea
                            name="bio"
                            rows={3}
                            required
                            maxLength={200}
                            value={formData.bio || ''}
                            disabled={!isDraft}
                            onChange={handleInputChange}
                            onBlur={handleBioBlur}
                            placeholder="Summary of research or teaching background..."
                            className={`mt-2 w-full resize-none rounded-xl border px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 disabled:cursor-wait disabled:opacity-70 ${
                            errors?.biodata
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                            : 'border-slate-200 bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10'
                            }`}
                        />
                            {/* Error Message */}
                            {errors?.biodata && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                                <svg
                                className="h-3.5 w-3.5 shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                >
                                <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                                />
                                </svg>
                                {errors.biodata}
                             </p>
                            )}
                    </div>
              </div>
            )}
  
            {/* STEP 3: Document Upload Facility */}
            {currentStep === 3 && (
              <FacultyApplicationDocuments
                documents={application?.documents ?? []}
                isDraft={application?.applicationStatus === 'DRAFT'}
                onRefresh={refreshApplication}
              />
            )}
  
            {/* STEP 4: Review & Final Submission */}
            {currentStep === 4 && (
              <div className="space-y-5">
                {!isDraft && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <h3 className="text-base font-bold text-emerald-900">
                    {application?.applicationStatus === 'SUBMITTED' ? 'Application Submitted' : 'Application is read-only'}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-emerald-800">
                    <p><span className="font-semibold">Status:</span> {application?.applicationStatus?.replaceAll('_', ' ')}</p>
                    {application?.submittedAt && <p><span className="font-semibold">Submitted On:</span> {new Date(application.submittedAt).toLocaleString()}</p>}
                    <p className="pt-1">Your application has been submitted successfully and is awaiting administrative review.</p>
                  </div>
                </div>}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Registration Review
                  </h4>
  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-full h-full p-3 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{formData.fullName || 'Not provided'}</p>
                      <p className="text-xs text-slate-500">{auth.userEmail || 'Email'}</p>
                    </div>
                  </div>
  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
                    <p><span className="font-semibold text-slate-700">Phone:</span> {application?.phoneNumber || auth.phone || '—'}</p>
                    <p><span className="font-semibold text-slate-700">Experience:</span> {formData.experienceYears !== '' ? `${formData.experienceYears} Years` : '—'}</p>
                    <p><span className="font-semibold text-slate-700">Date of Birth:</span> {formData.dob || '—'}</p>
                    <p className="sm:col-span-2"><span className="font-semibold text-slate-700">Address:</span> {formData.address || '—'}</p>
                    <p className="sm:col-span-2"><span className="font-semibold text-slate-700">Bio:</span> {formData.bio || '—'}</p>
                  </div>
  
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-1">Attached Documents:</p>
                    {(application?.documents?.length ?? 0) > 0 ? (
                      <ul className="list-disc list-inside text-xs text-slate-600">
                        {application.documents.map((document) => (
                          <li key={document.id} className="truncate">{document.originalFileName}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No documents attached.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
  
            {/* Stepper Navigation Buttons */}
            {/* Option 1: Ambient Frosted Glow */}
            <div className="relative overflow-hidden border-t border-slate-200/80 bg-white/80 px-6 py-4.5 backdrop-blur-md sm:px-8">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-emerald-100/60 blur-2xl"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-10 right-10 h-28 w-28 rounded-full bg-blue-100/50 blur-2xl"
                />
                <div className="relative z-10 flex items-center justify-between">
                    {currentStep > 1 ? (
                         <button
                            type="button"
                            onClick={prevStep}
                            className="inline-flex hover:cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-white hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-slate-100 active:scale-[0.99]"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                                 Back
                        </button>
                     ) : <div />}
                    {currentStep < 4 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={isSaving}
                            className="inline-flex hover:cursor-pointer items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm shadow-emerald-600/25 transition hover:border-emerald-700 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 active:scale-[0.99]"
                        >
                            Next Step
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ) : isDraft ? (
                        <button
                            type="submit"
                            disabled={isSaving || isSubmitting}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-700 px-7 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-emerald-700/30 transition hover:border-emerald-800 hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 active:scale-[0.99]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                                {isSubmitting ? 'Submitting…' : 'Submit Application'}
                        </button>
                     ) : <div />}
                </div>
            </div>
          </form>
          <DynamicModal
            isOpen={showSubmitConfirmation}
            onClose={() => { if (!isSubmitting) setShowSubmitConfirmation(false); }}
            title="Submit application?"
          >
            <p className="text-sm leading-6 text-slate-600">
              Please review your information and documents carefully. Submission sends your application for administrative review, and it cannot be edited while it is being reviewed.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowSubmitConfirmation(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Keep Reviewing
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmSubmission}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting…' : 'Confirm Submission'}
              </button>
            </div>
          </DynamicModal>
        </div>
      </div>
    );
  }
export default CompleteApplication;
