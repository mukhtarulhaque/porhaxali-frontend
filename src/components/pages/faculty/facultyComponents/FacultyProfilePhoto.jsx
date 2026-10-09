import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  ImageUp,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  User,
  X,
} from 'lucide-react';
import {
  confirmProfilePhotoUpload,
  getProfilePhotoViewUrl,
  requestProfilePhotoUpload,
  uploadFileToR2,
} from '../../../../api/InstructorApplication';
import { validateProfilePhotoFile } from '../instructorApplicationConfig';

const apiMessage = (error, fallback) => error.response?.data?.message ?? fallback;
const isBusyPhase = (phase) => ['authorizing', 'uploading', 'confirming', 'refreshing'].includes(phase);

const FacultyProfilePhoto = ({ application, isEditable, photoPreview, setPhotoPreview, onRefresh }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingSavedPhoto, setIsLoadingSavedPhoto] = useState(Boolean(application?.profilePhotoPresent));
  const [operation, setOperation] = useState(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const selectedPreviewRef = useRef(null);

  const releaseSelectedPreview = useCallback(() => {
    if (selectedPreviewRef.current) URL.revokeObjectURL(selectedPreviewRef.current);
    selectedPreviewRef.current = null;
    setSelectedPreview(null);
  }, []);

  const loadSavedPhoto = useCallback(async ({ showLoading = true, force = false } = {}) => {
    if (!force && !application?.profilePhotoPresent) {
      setPhotoPreview(null);
      return null;
    }

    if (showLoading) setIsLoadingSavedPhoto(true);
    try {
      const view = await getProfilePhotoViewUrl();
      setPhotoPreview(view.url);
      if (showLoading) setOperation(null);
      return view;
    } catch (error) {
      console.error('Unable to load profile photo', error);
      setOperation({
        phase: 'retrieval-error',
        message: apiMessage(error, 'Your photo is saved, but it could not be displayed. Try loading it again.'),
      });
      return null;
    } finally {
      if (showLoading) setIsLoadingSavedPhoto(false);
    }
  }, [application?.profilePhotoPresent, setPhotoPreview]);

  useEffect(() => {
    let active = true;
    if (application?.profilePhotoPresent) {
      getProfilePhotoViewUrl()
        .then((view) => {
          if (active) setPhotoPreview(view.url);
        })
        .catch((error) => {
          console.error('Unable to load profile photo', error);
          if (active) {
            setOperation({
              phase: 'retrieval-error',
              message: apiMessage(error, 'Your photo is saved, but it could not be displayed. Try loading it again.'),
            });
          }
        })
        .finally(() => {
          if (active) setIsLoadingSavedPhoto(false);
        });
    }

    return () => { active = false; };
  }, [
    application?.profilePhotoPresent,
    application?.profilePhotoOriginalFileName,
    setPhotoPreview,
  ]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraActive(false);
  }, []);

  useEffect(() => () => {
    stopCamera();
    if (selectedPreviewRef.current) URL.revokeObjectURL(selectedPreviewRef.current);
  }, [stopCamera]);

  const selectPhoto = (file) => {
    const validationError = validateProfilePhotoFile(file);
    if (validationError) {
      setOperation({ phase: 'error', message: validationError });
      return;
    }

    releaseSelectedPreview();
    const previewUrl = URL.createObjectURL(file);
    selectedPreviewRef.current = previewUrl;
    setSelectedPreview(previewUrl);
    setSelectedFile(file);
    setOperation(null);
  };

  const cancelSelection = () => {
    releaseSelectedPreview();
    setSelectedFile(null);
    setOperation(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const startCamera = async () => {
    setOperation(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      window.requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch (error) {
      console.error('Camera access error', error);
      setOperation({ phase: 'error', message: 'Unable to access the camera. Check your device permissions.' });
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) selectPhoto(new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.85);
    stopCamera();
  };

  const persistPhoto = async () => {
    const validationError = validateProfilePhotoFile(selectedFile);
    if (validationError) {
      setOperation({ phase: 'error', message: validationError });
      return;
    }

    try {
      setOperation({ phase: 'authorizing', message: 'Preparing a secure upload…' });
      const authorization = await requestProfilePhotoUpload({
        originalFileName: selectedFile.name,
        contentType: selectedFile.type,
        fileSize: selectedFile.size,
      });

      setOperation({ phase: 'uploading', message: 'Uploading your photo…' });
      await uploadFileToR2(authorization.uploadUrl, selectedFile, authorization.requiredHeaders);

      setOperation({ phase: 'confirming', message: 'Confirming your photo…' });
      await confirmProfilePhotoUpload(authorization.uploadIntentId);

      setOperation({ phase: 'refreshing', message: 'Loading the saved photo…' });
      await onRefresh();
      const view = await loadSavedPhoto({ showLoading: false, force: true });
      releaseSelectedPreview();
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';

      setOperation(view
        ? { phase: 'success', message: 'Profile photo saved successfully.' }
        : {
            phase: 'retrieval-error',
            message: 'Your photo was saved, but it could not be displayed. Try loading it again.',
          });
    } catch (error) {
      console.error('Unable to save profile photo', error);
      const storageFailure = !error.response
        && (error instanceof TypeError || error.message?.startsWith('Storage upload'));
      setOperation({
        phase: 'error',
        message: apiMessage(error, storageFailure
          ? 'The storage upload failed or the upload link expired. Try again for a fresh link.'
          : 'Unable to save your profile photo. Please try again.'),
      });
    }
  };

  const busy = isBusyPhase(operation?.phase);
  const replacementFailed = operation?.phase === 'error' && application?.profilePhotoPresent;
  const displayedPhoto = replacementFailed ? photoPreview : selectedPreview || photoPreview;
  const hasSavedPhoto = Boolean(application?.profilePhotoPresent);
  const statusIsError = ['error', 'retrieval-error'].includes(operation?.phase);

  return (
    <section
      aria-labelledby="profile-photo-heading"
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${statusIsError ? 'border-rose-200' : 'border-slate-200'}`}
    >
      <div className="border-b border-slate-100 bg-linear-to-r from-blue-50 via-white to-emerald-50 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
            <ImageUp className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div>
            <h3 id="profile-photo-heading" className="text-sm font-bold text-slate-900">Profile photograph</h3>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
              This photo will represent you on your public faculty profile after approval. Use a clear, front-facing portrait.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:items-start sm:p-6">
        <div className="relative shrink-0">
          <div className={`flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 bg-slate-50 shadow-inner sm:h-40 sm:w-40 ${selectedPreview ? 'border-blue-200' : 'border-white ring-1 ring-slate-200'}`}>
            {isCameraActive ? (
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" aria-label="Live camera preview" />
            ) : displayedPhoto ? (
              <img
                src={displayedPhoto}
                alt={selectedPreview && !replacementFailed ? 'Selected profile photo preview' : 'Saved faculty profile'}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-16 w-16 text-slate-300" aria-hidden="true" />
            )}
          </div>
          {isLoadingSavedPhoto && !selectedPreview && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/75" aria-label="Loading saved profile photo">
              <LoaderCircle className="h-7 w-7 animate-spin text-blue-600" aria-hidden="true" />
            </div>
          )}
          {hasSavedPhoto && !selectedPreview && !isCameraActive && (
            <span className="absolute right-1 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white" title="Saved photo">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="w-full flex-1 text-center sm:text-left">
          {selectedFile ? (
            <div>
              <p className="text-sm font-semibold text-slate-800">Ready to save</p>
              <p className="mt-1 truncate text-xs text-slate-500">{selectedFile.name}</p>
              <div className="mt-4 flex flex-col gap-2 min-[420px]:flex-row sm:flex-wrap">
                <button
                  type="button"
                  disabled={busy}
                  onClick={persistPhoto}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ImageUp className="h-4 w-4" aria-hidden="true" />}
                  {busy ? 'Saving…' : operation?.phase === 'error' ? 'Retry Upload' : 'Save Photo'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={cancelSelection}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X className="h-4 w-4" aria-hidden="true" /> Cancel
                </button>
              </div>
              {hasSavedPhoto && <p className="mt-3 text-xs text-slate-500">Your saved photo stays in place until this replacement is confirmed.</p>}
            </div>
          ) : isCameraActive ? (
            <div className="flex flex-col gap-2 min-[420px]:flex-row sm:flex-wrap">
              <button type="button" onClick={capturePhoto} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                <Camera className="h-4 w-4" aria-hidden="true" /> Take Photo
              </button>
              <button type="button" onClick={stopCamera} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <X className="h-4 w-4" aria-hidden="true" /> Cancel Camera
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-800">{hasSavedPhoto ? 'Your photo is saved' : 'Add your profile photo'}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">JPEG or PNG · Maximum file size: 2 MB</p>
              {isEditable ? (
                <div className="mt-4 flex flex-col gap-2 min-[420px]:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {hasSavedPhoto ? <RefreshCw className="h-4 w-4" aria-hidden="true" /> : <ImageUp className="h-4 w-4" aria-hidden="true" />}
                    {hasSavedPhoto ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {'mediaDevices' in navigator && (
                    <button type="button" disabled={busy} onClick={startCamera} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                      <Camera className="h-4 w-4" aria-hidden="true" /> Use Camera
                    </button>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs font-medium text-amber-700">The photo cannot be changed in the current application status.</p>
              )}
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="sr-only"
            aria-label={hasSavedPhoto ? 'Choose a replacement profile photo' : 'Choose a profile photo'}
            disabled={!isEditable || busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) selectPhoto(file);
              event.target.value = '';
            }}
          />

          {operation && (
            <div
              role={statusIsError ? 'alert' : 'status'}
              aria-live="polite"
              className={`mt-4 rounded-xl border px-3 py-2.5 text-xs ${statusIsError ? 'border-rose-200 bg-rose-50 text-rose-700' : operation.phase === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}
            >
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                {busy && <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />}
                <span>{operation.message}</span>
              </div>
              {busy && <div role="progressbar" aria-label="Profile photo upload progress" className="mt-2 h-1 overflow-hidden rounded-full bg-blue-100"><div className="h-full w-full animate-pulse rounded-full bg-blue-400" /></div>}
              {operation.phase === 'retrieval-error' && hasSavedPhoto && (
                <button type="button" onClick={() => loadSavedPhoto()} className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 font-semibold text-rose-700 hover:bg-rose-50">
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Load Photo Again
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FacultyProfilePhoto;
