import Axios from './Axios';
import {
    INSTRUCTOR_DOCUMENT_UPLOAD_URL,
    INSTRUCTOR_APPLICATION_SUBMIT_URL,
    INSTRUCTOR_PROFILE_PHOTO_URL,
    INSTRUCTOR_REQUIRED_DOCUMENT_TYPES_URL,
    MY_INSTRUCTOR_APPLICATION,
} from './Urls';

const data = (response) => response.data.data;

export const getMyApplication = async () => data(await Axios.get(MY_INSTRUCTOR_APPLICATION));

export const createMyApplication = async (application) =>
    data(await Axios.post(MY_INSTRUCTOR_APPLICATION, application));

export const updateMyApplication = async (application) =>
    data(await Axios.put(MY_INSTRUCTOR_APPLICATION, application));

export const submitMyApplication = async () =>
    data(await Axios.post(INSTRUCTOR_APPLICATION_SUBMIT_URL));

export const requestDocumentUpload = async (upload) =>
    data(await Axios.post(INSTRUCTOR_DOCUMENT_UPLOAD_URL, upload));

export const confirmDocumentUpload = async (uploadIntentId) =>
    data(await Axios.post(`${MY_INSTRUCTOR_APPLICATION}/documents/uploads/${uploadIntentId}/confirm`));

export const deleteDocument = async (documentId) =>
    Axios.delete(`${MY_INSTRUCTOR_APPLICATION}/documents/${documentId}`);

export const getDocumentViewUrl = async (documentId) =>
    data(await Axios.get(`${MY_INSTRUCTOR_APPLICATION}/documents/${documentId}/view-url`));

export const getRequiredDocumentTypes = async () =>
    data(await Axios.get(INSTRUCTOR_REQUIRED_DOCUMENT_TYPES_URL));

export const requestProfilePhotoUpload = async (upload) =>
    data(await Axios.post(`${INSTRUCTOR_PROFILE_PHOTO_URL}/upload-url`, upload));

export const confirmProfilePhotoUpload = async (uploadIntentId) =>
    data(await Axios.post(`${INSTRUCTOR_PROFILE_PHOTO_URL}/uploads/${uploadIntentId}/confirm`));

export const getProfilePhotoViewUrl = async () =>
    data(await Axios.get(`${INSTRUCTOR_PROFILE_PHOTO_URL}/view-url`));

export const uploadFileToR2 = async (uploadUrl, file, requiredHeaders = {}) => {
    const headers = new Headers();
    const browserControlledHeaders = new Set(['host', 'content-length', 'connection']);

    Object.entries(requiredHeaders).forEach(([name, values]) => {
        if (browserControlledHeaders.has(name.toLowerCase())) return;
        const value = Array.isArray(values) ? values.join(',') : values;
        if (value != null) headers.set(name, value);
    });

    if (!headers.has('content-type')) headers.set('Content-Type', file.type);

    const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers,
        body: file,
    });

    if (!response.ok) {
        throw new Error(`Storage upload failed with status ${response.status}`);
    }
};
