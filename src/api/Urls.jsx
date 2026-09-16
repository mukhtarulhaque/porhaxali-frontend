const REGISTER = 'api/auth/register';
const FACULTY_REGISTRATION = 'api/auth/faculty-registration';
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


export {
    FACULTY_REGISTRATION,REGISTER,VERIFYOTP,RESENDOTP,LOGIN,REFRESH,LOGOUT,FORCE_LOGOUT,GET_SUBJECTS,POST_SUBJECTS,
    GET_CURRENT_USER,GET_MY_STUDENT_PROFILE,SAVE_MY_STUDENT_PROFILE,GET_FORCE_LOGOUT_REQUEST,GET_STUDENTS
}
