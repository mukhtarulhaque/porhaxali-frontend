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

export const getInstructorSubmissionIssue = (application, requiredDocumentTypes = []) => {
    if (!application) return { step: 1, message: 'Unable to verify the application. Please reload and try again.' };

    if (!application.applicantName?.trim() || !application.applicantEmail?.trim()) {
        return { step: 1, message: 'Your account name and email are required before submission.' };
    }
    if (!application.phoneNumber?.trim()) {
        return { step: 1, message: 'A phone number is required on your account before submission.' };
    }
    if (!application.dateOfBirth || !application.address?.trim()) {
        return { step: 1, message: 'Date of birth and residential address are required before submission.' };
    }
    if (application.teachingExperienceYears == null
        || application.teachingExperienceYears < 0
        || !application.teachingExperienceDescription?.trim()
        || !application.bio?.trim()) {
        return { step: 2, message: 'Experience, teaching experience description, and short bio are required before submission.' };
    }
    if (!(application.qualifications ?? []).some((qualification) => qualification.qualificationName?.trim())) {
        return { step: 2, message: 'At least one named qualification is required before submission.' };
    }
    if (!(application.subjects ?? []).length) {
        return { step: 2, message: 'Select at least one subject before submitting your application.' };
    }
    if ((application.subjects ?? []).some((subject) => subject.subjectStatus !== 'ACTIVE')) {
        return { step: 2, message: 'Remove inactive subjects before submitting your application.' };
    }
    if (!application.profilePhotoPresent) {
        return { step: 1, message: 'Upload and save a profile photograph before submitting your application.' };
    }

    const documents = application.documents ?? [];
    for (const requiredType of requiredDocumentTypes) {
        const matchingDocuments = documents.filter((document) => document.documentType === requiredType.code);
        if (matchingDocuments.some((document) => document.verificationStatus === 'REJECTED')) {
            return { step: 3, message: `Replace the rejected ${requiredType.label} before submitting.` };
        }
        const confirmed = matchingDocuments.some((document) => document.originalFileName?.trim()
            && document.mimeType?.trim()
            && document.fileSize > 0
            && document.verificationStatus);
        if (!confirmed) {
            return { step: 3, message: `Upload the required ${requiredType.label} before submitting.` };
        }
    }

    return null;
};
