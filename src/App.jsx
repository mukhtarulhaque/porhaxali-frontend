import './App.css'
import { Route, Routes } from "react-router-dom";
import Login from './components/login/Login';
import Register from './components/login/Signup';
import Landing from './components/login/Landing';
import RequireAuth from './components/auth/RequireAuth';
import AuthHome from './components/pages/AuthHome';
import Layout from './components/pages/Layout';
import Missing from './components/pages/commom/Missing';
import ForgottenPassword from './components/login/ForgottenPassword';
import CoursesPage from './components/pages/student/CoursesPage';
import StudentDashboard from './components/pages/student/StudentDashboard';
import LiveSessions from './components/pages/student/LiveSessions';
import NotesPage from './components/pages/student/NotesPage';
import ProfileSettings from './components/pages/student/ProfileSettings';
import Dashboard from './components/pages/admin/Dashboard';
import AllCourses from './components/pages/admin/AllCourses';
import AllStudents from './components/pages/admin/AllStudents';

function App() {
  return (
    <>
     {/* <div className='text-8xl text-amber-900'>Mehboob</div> */}
     <Routes>
      <Route path='/' element={<Layout />}>
        {/* public routes */}
        <Route path='/login' element={<Login />}></Route>
        <Route path='/register' element={<Register />}></Route>
        <Route path='/landing' element={<Landing />}></Route>
        <Route path='/forgottenPassword' element={<ForgottenPassword />}></Route>
        
        {/* <Route path='unauthorized' element={<Unauthorized/>}></Route> */}

        {/* protected routes*/}
        <Route element={<RequireAuth />}>
          <Route path='/authUser' element={<AuthHome />}></Route>
          <Route path='/adminDashboard' element={<Dashboard/>}></Route>
          <Route path='/courses' element={<CoursesPage />}></Route>
          <Route path='/dashboard' element={<StudentDashboard />}></Route>
          <Route path='/liveSessions' element={<LiveSessions/>}></Route>
          <Route path='/notes' element={<NotesPage/>}></Route>
          <Route path='/profileSetting' element={<ProfileSettings/>}></Route>
          {/* Admin routes */}
          <Route path='/allCourses' element={<AllCourses/>}></Route>
          <Route path='/allStudents' element={<AllStudents/>}></Route>
        </Route>
        {/* catch all*/}
        <Route path='*' element={<Missing />}></Route>
      </Route>
    </Routes>
    </>
  )
}

export default App
