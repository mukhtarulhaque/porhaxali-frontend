const REGISTER = 'api/auth/register';
const FACULTY_REGISTRATION = 'api/auth/faculty-registration';
const FACULTY_ACCOUNT_SETUP = 'api/auth/faculty/setup-account';
const VERIFYOTP = 'api/auth/otp/verify';
const RESENDOTP = 'api/auth/otp/resend';
const LOGIN = 'api/auth/login';
const REFRESH = 'api/auth/refresh';
const LOGOUT = 'api/auth/logout';
const FORCE_LOGOUT = 'api/auth/force-logout-requests';
const GET_CURRENT_USER = 'api/auth/me';

//admin api
const GET_SUBJECTS = 'api/subjects/';
const POST_SUBJECTS = 'api/subjects/';
const GET_FORCE_LOGOUT_REQUEST = 'api/admin/users/force-logout-requests';

//student api
const GET_MY_STUDENT_PROFILE = 'api/student-profiles/me';
const SAVE_MY_STUDENT_PROFILE = 'api/student-profiles/me';
const GET_STUDENTS = 'api/student/all';

//instructor applicant api
const MY_INSTRUCTOR_APPLICATION = 'api/instructor-applications/me';
const INSTRUCTOR_APPLICATION_SUBMIT_URL = `${MY_INSTRUCTOR_APPLICATION}/submit`;
const INSTRUCTOR_DOCUMENT_UPLOAD_URL = `${MY_INSTRUCTOR_APPLICATION}/documents/upload-url`;
const INSTRUCTOR_REQUIRED_DOCUMENT_TYPES_URL = `${MY_INSTRUCTOR_APPLICATION}/documents/required-types`;
const INSTRUCTOR_PROFILE_PHOTO_URL = `${MY_INSTRUCTOR_APPLICATION}/profile-photo`;


export {
    FACULTY_REGISTRATION,FACULTY_ACCOUNT_SETUP,REGISTER,VERIFYOTP,RESENDOTP,LOGIN,REFRESH,LOGOUT,FORCE_LOGOUT,GET_SUBJECTS,POST_SUBJECTS,
    GET_CURRENT_USER,GET_MY_STUDENT_PROFILE,SAVE_MY_STUDENT_PROFILE,GET_FORCE_LOGOUT_REQUEST,GET_STUDENTS,
    MY_INSTRUCTOR_APPLICATION,INSTRUCTOR_APPLICATION_SUBMIT_URL,INSTRUCTOR_DOCUMENT_UPLOAD_URL,INSTRUCTOR_REQUIRED_DOCUMENT_TYPES_URL,
    INSTRUCTOR_PROFILE_PHOTO_URL
}
