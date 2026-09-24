export const ALLOWED_DOCUMENT_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
]);

export const MAX_INSTRUCTOR_FILE_SIZE_BYTES = 2_202_010;

export const ALLOWED_PROFILE_PHOTO_TYPES = new Set(['image/jpeg', 'image/png']);

export const EMPTY_APPLICATION = {
    teachingExperienceYears: null,
    teachingExperienceDescription: null,
    dateOfBirth: null,
    address: null,
    bio: null,
};

export const validateDocumentFile = (file) => {
    if (!file) return 'Select a file first.';
    if (file.size <= 0) return 'The selected file is empty.';
    if (file.size > MAX_INSTRUCTOR_FILE_SIZE_BYTES) return 'File size must not exceed 2 MB.';
    if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) return 'Choose a PDF, JPEG, or PNG file.';
    return '';
};

export const validateProfilePhotoFile = (file) => {
    if (!file) return 'Select a photo first.';
    if (file.size <= 0) return 'The selected photo is empty.';
    if (file.size > MAX_INSTRUCTOR_FILE_SIZE_BYTES) return 'Photo size must not exceed 2 MB.';
    if (!ALLOWED_PROFILE_PHOTO_TYPES.has(file.type)) return 'Choose a JPEG or PNG image.';
    return '';
};
