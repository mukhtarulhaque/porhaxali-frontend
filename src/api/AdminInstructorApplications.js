import Axios from './Axios';
import {
  ADMIN_INSTRUCTOR_APPLICATION_COUNTS,
  ADMIN_INSTRUCTOR_APPLICATIONS,
} from './Urls';

const unwrapData = (response) => response.data.data;

const compactParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
);

export const getInstructorApplicationCounts = async () =>
  unwrapData(await Axios.get(ADMIN_INSTRUCTOR_APPLICATION_COUNTS));

export const getInstructorApplications = async (params = {}) =>
  unwrapData(await Axios.get(ADMIN_INSTRUCTOR_APPLICATIONS, { params: compactParams(params) }));

export const getInstructorApplication = async (applicationId) =>
  unwrapData(await Axios.get(`${ADMIN_INSTRUCTOR_APPLICATIONS}/${applicationId}`));

export const getInstructorApplicationDocumentViewUrl = async (applicationId, documentId) =>
  unwrapData(await Axios.get(
    `${ADMIN_INSTRUCTOR_APPLICATIONS}/${applicationId}/documents/${documentId}/view-url`,
  ));

export const startInstructorApplicationReview = async (applicationId) =>
  unwrapData(await Axios.post(`${ADMIN_INSTRUCTOR_APPLICATIONS}/${applicationId}/start-review`));

export const activateInstructor = async (applicationId) =>
  unwrapData(await Axios.post(`${ADMIN_INSTRUCTOR_APPLICATIONS}/${applicationId}/activate-instructor`));

export const approveInstructorApplication = async (applicationId, remarks) =>
  unwrapData(await Axios.post(
    `${ADMIN_INSTRUCTOR_APPLICATIONS}/${applicationId}/approve`,
    { remarks },
  ));

export const rejectInstructorApplication = async (applicationId, reason) =>
  unwrapData(await Axios.post(
    `${ADMIN_INSTRUCTOR_APPLICATIONS}/${applicationId}/reject`,
    { reason },
  ));

export const requestInstructorApplicationChanges = async (applicationId, remarks) =>
  unwrapData(await Axios.post(
    `${ADMIN_INSTRUCTOR_APPLICATIONS}/${applicationId}/request-changes`,
    { remarks },
  ));

export const verifyInstructorApplicationDocument = async (applicationId, documentId, adminRemarks) =>
  unwrapData(await Axios.patch(
    `${ADMIN_INSTRUCTOR_APPLICATIONS}/${applicationId}/documents/${documentId}/verify`,
    { adminRemarks },
  ));

export const rejectInstructorApplicationDocument = async (applicationId, documentId, rejectionReason) =>
  unwrapData(await Axios.patch(
    `${ADMIN_INSTRUCTOR_APPLICATIONS}/${applicationId}/documents/${documentId}/reject`,
    { rejectionReason },
  ));
