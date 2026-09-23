import React, {useState,useRef, useEffect} from "react";
import { Camera, Upload, User, Briefcase, FileText, 
    RefreshCw, X, FileUp, Paperclip, Trash2 } from 'lucide-react';
import useAuth from "../../Hooks/UseAuth";
import Input from "../commom/Input";
import Label from "../commom/Label";


const CompleteApplication = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [documents, setDocuments] = useState([]);
  
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const docInputRef = useRef(null);

    const { auth} = useAuth(); 
    const [errors, setErrors] = useState({});

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
      gender: '',
      address: '',
      qualification: '',
      department: '',
      designation: '',
      experienceYears: '',
      specialization: '',
      bio: '',
    });
  
    // --- Camera Operations ---
    const startCamera = async () => {
      try {
        setIsCameraActive(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera access error:', err);
        alert('Unable to access camera. Please verify device permissions.');
        setIsCameraActive(false);
      }
    };
  
    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    };
  
    const capturePhoto = () => {
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setPhotoPreview(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    };
  
    const handlePhotoUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        setPhotoPreview(URL.createObjectURL(file));
        if (isCameraActive) stopCamera();
      }
    };
  
    // --- Document Upload Operations ---
    const handleDocumentChange = (e) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        setDocuments((prev) => [...prev, ...selectedFiles]);
      }
    };
  
    const removeDocument = (indexToRemove) => {
      setDocuments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };
  
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files || []);
      if (droppedFiles.length > 0) {
        setDocuments((prev) => [...prev, ...droppedFiles]);
      }
    };
    const nextStep = () =>{
        if(currentStep === 1) {
            const dobError = getDobError(formData.dob);
            const genderError = getGenderError(formData.gender);
            const addressError = getAddressError(formData.address);
            if (dobError) {
                setErrors((prev) => ({ ...prev, dob: dobError }));
                return;
              }
            if (genderError) {
                setErrors((prev) => ({ ...prev, gender: genderError }));
                return;
              }
            if (addressError) {
                setErrors((prev) => ({ ...prev, address: addressError }));
                return;
                }
            setCurrentStep((prev) => Math.min(prev + 1, 4));
        }
        if(currentStep === 2) {
            const qualError = getQualificationError(formData.qualification);
            const deptError = getDepartmentError(formData.department);
            const desigError = getDesignationError(formData.designation); 
            const experiYrError = getExperienceYearsError(formData.experienceYears);
            const areaSplError = getAreaSpecializationError(formData.specialization);
            const biodataError = getBiodataError(formData.bio);
            if (qualError) {
                setErrors((prev) => ({ ...prev, qualification: qualError }));
                return;
            }
            if (deptError) {
                setErrors((prev) => ({ ...prev, department: deptError }));
                return;
            }
            if(desigError) {
                setErrors((prev) => ({ ...prev, designation: desigError}));
                return;
            }
            if(experiYrError) {
                setErrors((prev) => ({ ...prev, experienceYears: experiYrError}));
                return;
            }
            if(areaSplError) {
                setErrors((prev) => ({ ...prev, areaSpecialization: areaSplError}));
                return;
            }
            if(biodataError) {
                setErrors((prev) => ({ ...prev, biodata: biodataError}));
                return;
            }
            setCurrentStep((prev) => Math.min(prev + 1, 4));
        }  
    } 
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Submission Payload:', {
        ...formData,
        photo: photoPreview,
        documents: documents.map((d) => d.name),
      });
      alert('Bio-data along with documents submitted successfully!');
    };
  
    useEffect(() => {
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };
    }, []);
  
// 2. Pure validator function (does NOT call setState)
const getAddressError = (value) => {
  if (!value || !value.trim()) {
    return 'Residential address is required.';
  }
  if (value.trim().length < 10) {
    return 'Address must be at least 10 characters long.';
  }
  return '';
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

// 4. Validate when the user clicks/tabs away from the field
const handleAddressBlur = (e) => {
  const errorMsg = getAddressError(e.target.value);
  setErrors((prev) => ({ ...prev, address: errorMsg }));
};
 
const dateInputRef = useRef(null);

// Pure validator for Date of Birth
const getDobError = (value) => {
  if (!value) {
    return 'Date of birth is required.';
  }

  const selectedDate = new Date(value);
  const today = new Date();

  if (isNaN(selectedDate.getTime())) {
    return 'Please select a valid date.';
  }

  if (selectedDate > today) {
    return 'Date of birth cannot be in the future.';
  }

  // Teacher eligibility check: Minimum 18 years old
  const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  if (selectedDate > minAgeDate) {
    return 'Faculty member must be at least 18 years of age.';
  }

  return '';
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
// Validation function
const getGenderError = (value) => {
    if (!value || value.trim() === '') {
      return 'Please select a gender.';
    }
    return '';
  };
  
const handleGenderBlur = (e) => {
    const errorMsg = getGenderError(e.target.value);
    setErrors((prev) => ({ ...prev, gender: errorMsg }));
  };

const getQualificationError = (value) => {
    if (!value || !value.trim()) {
      return 'Highest qualification is required.';
    }
    if (value.trim().length < 2) {
      return 'Qualification must be at least 2 characters.';
    }
    return '';
  };  
const handleQualificationBlur = (e) => {
    const errorMsg = getQualificationError(e.target.value);
    setErrors((prev) => ({ ...prev, qualification: errorMsg }));
  };
 

const getDepartmentError = (value) => {
    if (!value || !value.trim()) {
      return 'Department is required.';
    }
    if (value.trim().length < 2) {
      return 'Department name must be at least 2 characters.';
    }
    return '';
  };
const handleDepartmentBlur = (e) => {
    const errorMsg = getDepartmentError(e.target.value);
    setErrors((prev) => ({ ...prev, department: errorMsg }));
  };

const getDesignationError = (value) => {
    if (!value || !value.trim()) {
      return 'Designation is required.';
    }
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      return 'Designation must be at least 2 characters long.';
    }
    if (trimmed.length > 80) {
      return 'Designation cannot exceed 80 characters.';
    }
    if (!/[a-zA-Z]/.test(trimmed)) {
      return 'Please enter a valid designation title.';
    }
    return '';
};
const handleDesignationBlur = (e) => {
    const errorMsg = getDesignationError(e.target.value);
    setErrors((prev) => ({ ...prev, designation: errorMsg }));
};

const getExperienceYearsError = (value) => {
    // Convert number to string if needed and handle empty checks
    const strVal = String(value ?? '').trim();
  
    if (!strVal) {
      return 'Experience is required.';
    }
  
    // 1. Must contain ONLY digits (0-9)
    if (!/^\d+$/.test(strVal)) {
      return 'Please enter only numbers.';
    }
  
    // 2. Realistic range check (e.g., 0 to 60 years)
    const years = parseInt(strVal, 10);
    if (years < 0 || years > 60) {
      return 'Experience must be between 0 and 60 years.';
    }
  
    return '';
  };
  const handleExperienceYearsBlur = (e) => {
    const errorMsg = getExperienceYearsError(e.target.value);
    setErrors((prev) => ({ ...prev, experienceYears: errorMsg }));
};
const getAreaSpecializationError = (value) => {
    if (!value || !value.trim()) {
      return 'Area of Specialization is required.';
    }
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      return 'Specialization must be at least 2 characters long.';
    }
    if (trimmed.length > 80) {
      return 'Specialization cannot exceed 80 characters.';
    }
    if (!/[a-zA-Z]/.test(trimmed)) {
      return 'Please enter a valid specialization title.';
    }
    return '';
};
const handleAreaSpecializationBlur = (e) => {
    const errorMsg = getAreaSpecializationError(e.target.value);
    setErrors((prev) => ({ ...prev, areaSpecialization: errorMsg }));
};

const getBiodataError = (value) => {
    if (!value || !value.trim()) {
      return 'Short Bio is required.';
    }
    const trimmed = value.trim();
    if (trimmed.length < 15) {
      return 'Short Bio must be at least 15 characters long.';
    }
    if (trimmed.length > 200) {
      return 'Short Bio cannot exceed 200 characters.';
    }
    if (!/[a-zA-Z]/.test(trimmed)) {
      return 'Please enter a valid short bio title.';
    }
    return '';
};
const handleBioBlur = (e) => {
    const errorMsg = getBiodataError(e.target.value);
    setErrors((prev) => ({ ...prev, biodata: errorMsg }));
};


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
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* STEP 1: Personal Details & Camera/Photo */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <label className="block text-sm font-semibold text-slate-800 mb-3">Profile Photograph</label>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-white border-2 border-dashed border-slate-300 flex items-center justify-center shadow-inner">
                      {isCameraActive ? (
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      ) : photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-14 h-14 text-slate-300" />
                      )}
                    </div>
  
                    <div className="space-y-3 text-center sm:text-left">
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {!isCameraActive ? (
                          <>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm transition">
                              <Upload className="w-4 h-4 text-slate-500" /> Upload File
                              <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} />
                            </label>
  
                            <button
                              type="button"
                              onClick={startCamera}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium rounded-lg hover:bg-blue-100 transition"
                            >
                              <Camera className="w-4 h-4" /> Use Camera
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                            >
                              <Camera className="w-4 h-4" /> Snap Photo
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 border border-rose-200 text-sm font-medium rounded-lg hover:bg-rose-100 transition"
                            >
                              <X className="w-4 h-4" /> Cancel
                            </button>
                          </>
                        )}
  
                        {photoPreview && !isCameraActive && (
                          <button
                            type="button"
                            onClick={() => setPhotoPreview(null)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-rose-600 text-xs font-medium hover:underline"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Remove Photo
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">Capture using your camera or upload PNG/JPG (Max 5MB).</p>
                    </div>
                  </div>
                </div>
  
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
                        id="phone" value={auth.phone} autoComplete="off" type="phone" readOnly disabled={true}
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
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Gender <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            name="gender"
                            value={formData.gender || ''}
                            onChange={handleInputChange}
                            onBlur={handleGenderBlur}
                            className={`mt-2 w-full appearance-none rounded-xl border px-4 py-3.5 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 disabled:cursor-wait disabled:opacity-70 ${
                                    errors?.gender
                                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                                    : 'border-slate-200 bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10'
                                    }`}
                            >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 top-2 flex items-center pr-4 text-slate-500">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    {errors?.gender && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                            <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {errors.gender}
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
                        Highest Qualification <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="qualification"
                        required
                        value={formData.qualification || ''}
                        onChange={handleInputChange}
                        onBlur={handleQualificationBlur}
                        placeholder="e.g. Ph.D. in Computer Science"
                        className={`mt-2 w-full rounded-xl border px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 disabled:cursor-wait disabled:opacity-70 ${
                                    errors?.qualification
                                ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                                : 'border-slate-200 bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10'
                         }`}
                    />
                        {errors?.qualification && (
                             <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                                <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {errors.qualification}
                            </p>
                        )}
                </div>
                <div className="w-full font-montserrat">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Department <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="department"
                        required
                        value={formData.department || ''}
                        onChange={handleInputChange}
                        onBlur={handleDepartmentBlur}
                        placeholder="e.g. Information Technology"
                        className={`mt-2 w-full rounded-xl border px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 disabled:cursor-wait disabled:opacity-70 ${
                            errors?.department
                                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                                    : 'border-slate-200 bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10'
                                }`}
                    />
                    {errors?.department && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                            <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {errors.department}
                         </p>
                    )}
                </div>
                <div className="w-full font-montserrat">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Designation <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="designation"
                        required
                        value={formData.designation || ''}
                        onChange={handleInputChange}
                        onBlur={handleDesignationBlur}
                        placeholder="e.g. Assistant Professor"
                        className={`mt-2 w-full rounded-xl border px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 disabled:cursor-wait disabled:opacity-70 ${
                            errors?.designation
                                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                                    : 'border-slate-200 bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10'
                                }`}
                    />
                    {errors?.designation && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                            <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {errors.designation}
                         </p>
                    )}
                </div>
                <div className="w-full font-montserrat">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Years of Experience <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="experienceYears"
                        required
                        value={formData.experienceYears || ''}
                        onChange={handleInputChange}
                        onBlur={handleExperienceYearsBlur}
                        placeholder="e.g. Assistant Professor"
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
                        Area of Specialization <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="specialization"
                        required
                        value={formData.specialization || ''}
                        onChange={handleInputChange}
                        onBlur={handleAreaSpecializationBlur}
                        placeholder="e.g. Artificial Intelligence, Distributed Systems"
                        className={`mt-2 w-full rounded-xl border px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 disabled:cursor-wait disabled:opacity-70 ${
                            errors?.areaSpecialization
                                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                                    : 'border-slate-200 bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10'
                                }`}
                    />
                    {errors?.areaSpecialization && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600">
                            <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {errors.areaSpecialization}
                         </p>
                    )}
                </div>
                {/* <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio</label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Summary of research or teaching background..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div> */}
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
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Required Documents</h3>
                  <p className="text-xs text-slate-500">
                    Please upload your CV, degree certificates, ID proof, and experience certificates (PDF, DOCX, PNG, JPG).
                  </p>
                </div>
  
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => docInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-8 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={docInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleDocumentChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-blue-600 mb-3">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    Click to browse files or drag and drop here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX, or images up to 10MB each</p>
                </div>
  
                {/* Uploaded File List */}
                {documents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Uploaded Files ({documents.length})
                    </p>
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-white">
                      {documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 text-sm">
                          <div className="flex items-center gap-2 truncate">
                            <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate font-medium text-slate-700">{doc.name}</span>
                            <span className="text-xs text-slate-400 shrink-0">
                              ({(doc.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
  
            {/* STEP 4: Review & Final Submission */}
            {currentStep === 4 && (
              <div className="space-y-5">
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
                      <p className="text-xs text-slate-500">{formData.designation || 'Designation'} • {formData.department || 'Department'}</p>
                      <p className="text-xs text-slate-500">{formData.email || 'Email'}</p>
                    </div>
                  </div>
  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
                    <p><span className="font-semibold text-slate-700">Phone:</span> {formData.phone || '—'}</p>
                    <p><span className="font-semibold text-slate-700">Qualification:</span> {formData.qualification || '—'}</p>
                    <p><span className="font-semibold text-slate-700">Specialization:</span> {formData.specialization || '—'}</p>
                    <p><span className="font-semibold text-slate-700">Experience:</span> {formData.experienceYears ? `${formData.experienceYears} Years` : '—'}</p>
                  </div>
  
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-1">Attached Documents:</p>
                    {documents.length > 0 ? (
                      <ul className="list-disc list-inside text-xs text-slate-600">
                        {documents.map((d, i) => (
                          <li key={i} className="truncate">{d.name}</li>
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
                            className="inline-flex hover:cursor-pointer items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm shadow-emerald-600/25 transition hover:border-emerald-700 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 active:scale-[0.99]"
                        >
                            Next Step
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-700 px-7 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-emerald-700/30 transition hover:border-emerald-800 hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 active:scale-[0.99]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                                Submit Bio-Data
                        </button>
                     )}
                </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
export default CompleteApplication;




