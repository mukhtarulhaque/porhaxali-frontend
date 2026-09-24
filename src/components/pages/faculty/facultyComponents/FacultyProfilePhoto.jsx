import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, User, RefreshCw, X } from 'lucide-react';

// Optional: Export validator if keeping it in this file
// export const getPhotoError = (photo) => {
//   if (!photo) {
//     return 'Profile photograph is required. Please upload or snap a photo.';
//   }
//   return '';
// };

const FacultyProfilePhoto = ({ photoPreview, setPhotoPreview, error, clearError, setError }) => {
  // 1. Declare isCameraActive HERE
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Refs for the video stream and DOM element
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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
      alert('Unable to access camera. Please check device permissions.');
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      setPhotoPreview(dataUrl);
      if (clearError) clearError();
      stopCamera();
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      //alert('Please upload a valid image file.');
      setError('Please upload a valid image file.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      //alert('Image size exceeds 5MB limit.');
      setError(`File size exceeds 5MB limit.`);
      e.target.value = ''; // Reset input
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));
    if (clearError) clearError();
    if (isCameraActive) stopCamera();
    e.target.value = '';
  };

  // Clean up camera hardware if component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className={`rounded-xl border p-5 ${error ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-slate-50'}`}>
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
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 cursor-pointer shadow-xs transition">
                  <Upload className="w-4 h-4 text-slate-500" /> Upload File
                  <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} />
                </label>

                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium rounded-lg hover:bg-emerald-100 transition"
                >
                  <Camera className="w-4 h-4" /> Use Camera
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="inline-flex hover:cursor-pointer items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
                >
                  <Camera className="w-4 h-4" /> Snap Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="inline-flex hover:cursor-pointer items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 border border-rose-200 text-sm font-medium rounded-lg hover:bg-rose-100 transition"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </>
            )}

            {photoPreview && !isCameraActive && (
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="inline-flex hover:cursor-pointer items-center gap-1 px-3 py-2 text-rose-600 text-xs font-medium hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Remove Photo
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">Capture with your webcam or upload PNG/JPG (Max 5MB).</p>

          {error && (
            <p className="text-xs text-rose-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
   
    
    // const [isCameraActive, setIsCameraActive] = useState(false);
    // const videoRef = useRef(null);
    // const streamRef = useRef(null);
    // useEffect(() => {
    //     return () => {
    //       if (streamRef.current) {
    //         streamRef.current.getTracks().forEach((track) => track.stop());
    //       }
    //     };
    //   }, []);
    //  // --- Camera Operations ---
    //  const startCamera = async () => {
    //     try {
    //       setIsCameraActive(true);
    //       const stream = await navigator.mediaDevices.getUserMedia({
    //         video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
    //         audio: false,
    //       });
    //       streamRef.current = stream;
    //       if (videoRef.current) {
    //         videoRef.current.srcObject = stream;
    //       }
    //     } catch (err) {
    //       console.error('Camera access error:', err);
    //       alert('Unable to access camera. Please verify device permissions.');
    //       setIsCameraActive(false);
    //     }
    //   };
    
    //   const stopCamera = () => {
    //     if (streamRef.current) {
    //       streamRef.current.getTracks().forEach((track) => track.stop());
    //       streamRef.current = null;
    //     }
    //     setIsCameraActive(false);
    //   };
    
    //   const capturePhoto = () => {
    //     if (videoRef.current) {
    //       const canvas = document.createElement('canvas');
    //       canvas.width = videoRef.current.videoWidth || 640;
    //       canvas.height = videoRef.current.videoHeight || 480;
    //       const ctx = canvas.getContext('2d');
    //       ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    //       setPhotoPreview(canvas.toDataURL('image/jpeg'));
    //       stopCamera();
    //     }
    //   };
    
    //   const handlePhotoUpload = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //       setPhotoPreview(URL.createObjectURL(file));
    //       if (isCameraActive) stopCamera();
    //     }
    //   };
    // return(
    //     <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
    //               <label className="block text-sm font-semibold text-slate-800 mb-3">Profile Photograph</label>
    //               <div className="flex flex-col sm:flex-row items-center gap-6">
    //                 <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-white border-2 border-dashed border-slate-300 flex items-center justify-center shadow-inner">
    //                   {isCameraActive ? (
    //                     <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
    //                   ) : photoPreview ? (
    //                     <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
    //                   ) : (
    //                     <User className="w-14 h-14 text-slate-300" />
    //                   )}
    //                 </div>
  
    //                 <div className="space-y-3 text-center sm:text-left">
    //                   <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
    //                     {!isCameraActive ? (
    //                       <>
    //                         <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm transition">
    //                           <Upload className="w-4 h-4 text-slate-500" /> Upload File
    //                           <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} />
    //                         </label>
  
    //                         <button
    //                           type="button"
    //                           onClick={startCamera}
    //                           className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium rounded-lg hover:bg-blue-100 transition"
    //                         >
    //                           <Camera className="w-4 h-4" /> Use Camera
    //                         </button>
    //                       </>
    //                     ) : (
    //                       <>
    //                         <button
    //                           type="button"
    //                           onClick={capturePhoto}
    //                           className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
    //                         >
    //                           <Camera className="w-4 h-4" /> Snap Photo
    //                         </button>
    //                         <button
    //                           type="button"
    //                           onClick={stopCamera}
    //                           className="inline-flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 border border-rose-200 text-sm font-medium rounded-lg hover:bg-rose-100 transition"
    //                         >
    //                           <X className="w-4 h-4" /> Cancel
    //                         </button>
    //                       </>
    //                     )}
  
    //                     {photoPreview && !isCameraActive && (
    //                       <button
    //                         type="button"
    //                         onClick={() => setPhotoPreview(null)}
    //                         className="inline-flex items-center gap-1 px-3 py-2 text-rose-600 text-xs font-medium hover:underline"
    //                       >
    //                         <RefreshCw className="w-3.5 h-3.5" /> Remove Photo
    //                       </button>
    //                     )}
    //                   </div>
    //                   <p className="text-xs text-slate-500">Capture using your camera or upload PNG/JPG (Max 5MB).</p>
    //                 </div>
    //               </div>
    //             </div>
    // );

export default FacultyProfilePhoto;