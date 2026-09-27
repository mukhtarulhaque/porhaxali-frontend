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
