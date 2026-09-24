import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Upload, User, X } from 'lucide-react';
import {
  confirmProfilePhotoUpload,
  getProfilePhotoViewUrl,
  requestProfilePhotoUpload,
  uploadFileToR2,
} from '../../../../api/InstructorApplication';
import { validateProfilePhotoFile } from '../instructorApplicationConfig';

const apiMessage = (error, fallback) => error.response?.data?.message ?? fallback;

const FacultyProfilePhoto = ({ application, isDraft, photoPreview, setPhotoPreview, onRefresh }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [operation, setOperation] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const localPreviewRef = useRef(null);

  const clearLocalPreview = () => {
    if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current);
    localPreviewRef.current = null;
  };

  useEffect(() => {
    let active = true;
    if (application?.profilePhotoPresent) {
      getProfilePhotoViewUrl()
        .then((view) => {
          if (active) setPhotoPreview(view.url);
        })
        .catch((error) => {
          console.error('Unable to load profile photo', error);
          if (active) setOperation({ phase: 'error', message: apiMessage(error, 'Unable to display the saved profile photo.') });
        });
    }
    return () => {
      active = false;
      clearLocalPreview();
    };
    // The setter is stable and the persisted metadata changes only after a refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application?.profilePhotoPresent, application?.profilePhotoOriginalFileName]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraActive(false);
  };

  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    setOperation(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
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

  const persistPhoto = async (file) => {
    const validationError = validateProfilePhotoFile(file);
    if (validationError) {
      setOperation({ phase: 'error', message: validationError });
      return;
    }

    clearLocalPreview();
    localPreviewRef.current = URL.createObjectURL(file);
    setPhotoPreview(localPreviewRef.current);
    try {
      setOperation({ phase: 'authorizing', message: 'Requesting a secure upload URL…' });
      const authorization = await requestProfilePhotoUpload({
        originalFileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });
      setOperation({ phase: 'uploading', message: 'Uploading directly to secure storage…' });
      await uploadFileToR2(authorization.uploadUrl, file, authorization.requiredHeaders);
      setOperation({ phase: 'confirming', message: 'Saving your profile photo…' });
      await confirmProfilePhotoUpload(authorization.uploadIntentId);
      await onRefresh();
      const view = await getProfilePhotoViewUrl();
      clearLocalPreview();
      setPhotoPreview(view.url);
      setOperation({ phase: 'success', message: 'Profile photo saved successfully.' });
    } catch (error) {
      console.error('Unable to save profile photo', error);
      const storageFailure = !error.response
        && (error instanceof TypeError || error.message?.startsWith('Storage upload'));
      setOperation({
        phase: 'error',
        message: apiMessage(error, storageFailure
          ? 'Photo upload to secure storage failed.'
          : 'Unable to save your profile photo.'),
      });
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) persistPhoto(new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.85);
    stopCamera();
  };

  const busy = operation && !['success', 'error'].includes(operation.phase);

  return (
    <div className={`rounded-xl border p-5 ${operation?.phase === 'error' ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-slate-50'}`}>
      <label className="mb-3 block text-sm font-semibold text-slate-800">Profile Photograph</label>
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-white shadow-inner">
          {isCameraActive ? (
            <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
          ) : photoPreview ? (
            <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <User className="h-14 w-14 text-slate-300" />
          )}
        </div>

        <div className="space-y-3 text-center sm:text-left">
          {isDraft && <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {!isCameraActive ? (
              <>
                <label className={`inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 ${!isDraft || busy ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                  {application?.profilePhotoPresent ? <RefreshCw className="h-4 w-4 text-slate-500" /> : <Upload className="h-4 w-4 text-slate-500" />}
                  {application?.profilePhotoPresent ? 'Replace Photo' : 'Upload File'}
                  <input type="file" accept="image/jpeg,image/png" className="sr-only" disabled={!isDraft || busy} onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) persistPhoto(file);
                    event.target.value = '';
                  }} />
                </label>
                <button type="button" disabled={!isDraft || busy} onClick={startCamera} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50">
                  <Camera className="h-4 w-4" /> Use Camera
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={capturePhoto} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
                  <Camera className="h-4 w-4" /> Snap Photo
                </button>
                <button type="button" onClick={stopCamera} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100">
                  <X className="h-4 w-4" /> Cancel
                </button>
              </>
            )}
          </div>}
          <p className="text-xs text-slate-500">Capture with your webcam or upload PNG/JPG (Maximum file size: 2 MB).</p>
          {!isDraft && <p className="text-xs text-amber-700">The photo can only be changed while the application is in DRAFT status.</p>}
          {operation && <p role={operation.phase === 'error' ? 'alert' : 'status'} className={`text-xs ${operation.phase === 'error' ? 'text-rose-600' : operation.phase === 'success' ? 'text-emerald-700' : 'text-blue-700'}`}>{operation.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default FacultyProfilePhoto;
