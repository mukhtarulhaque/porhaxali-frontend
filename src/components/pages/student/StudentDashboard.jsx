import React from 'react';
//import { Link } from 'react-router-dom';
import UseAuth from "../../Hooks/UseAuth";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  GraduationCap, 
} from 'lucide-react'; // Using lucide-react for clean icons
import Sidebar from './Sidebar';
import { studentTabs } from '../commom/CommonArrays';

export default function StudentDashboard() {
  // Mock data for student profile
  const student = {
    name: "Ananya Borah",
    role: "Student",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
    grade: "Class 12 (Science)",
    stats: [
      { id: 1, label: "Enrolled Courses", value: "4", icon: BookOpen, color: "bg-blue-50 text-blue-600" },
      { id: 2, label: "Attendance", value: "92%", icon: Calendar, color: "bg-green-50 text-green-600" },
      { id: 3, label: "Study Hours", value: "48 hrs", icon: Clock, color: "bg-purple-50 text-purple-600" },
      { id: 4, label: "Avg. Score", value: "8.8 CGPA", icon: GraduationCap, color: "bg-orange-50 text-orange-600" },
    ],
    courses: [
      { id: 1, name: "Advanced Physics", instructor: "Dr. K. Das", progress: 75, totalLessons: 24, completedLessons: 18 },
      { id: 2, name: "Organic Chemistry", instructor: "Prof. Baruah", progress: 40, totalLessons: 30, completedLessons: 12 },
      { id: 3, name: "Calculus & Vectors", instructor: "Ms. R. Saikia", progress: 90, totalLessons: 20, completedLessons: 18 },
    ],
    completedCourses: [
        { id: 1, name: "Advacne Web Design", instructor: "Mr. Mehboob Alam", progress: 100, totalLessons: 24, completedLessons: 24 },
        { id: 2, name: "Database design in Springboot", instructor: "Prof. Mukhtarul Haque", progress: 100, totalLessons: 30, completedLessons: 30 },
        { id: 3, name: "Advance English", instructor: "Prof. M Haque", progress: 100, totalLessons: 20, completedLessons: 20 },
      ],
    upcomingClasses: [
      { id: 1, subject: "Organic Chemistry Live", time: "Today, 04:00 PM", platform: "Live Session" },
      { id: 2, subject: "Physics Doubt Clearing", time: "Tomorrow, 11:00 AM", platform: "Live Session" },
      { id: 3, subject: "React JS with Vue", time: "29-06-2026, 07:00 AM", platform: "Live Session"},
    ]
  };
  

  const { auth } = UseAuth();

  return (
    <div className="flex w-full font-montserrat bg-gray-50 antialiased text-gray-900">
        
        <Sidebar pageId="Dashboard" tabs={studentTabs}/>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex-col">
        {/* 3. DASHBOARD BODY */}
        <main className="flex-1 p-8 mx-auto space-y-8">
          {/* Hero Profile Banner */}
          <div className="rounded-2xl bg-linear-to-r from-pink-500 to-rose-600 p-6 md:p-8 text-white shadow-md">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img className="h-20 w-20 rounded-full border-4 border-white/20 object-cover shadow-sm" src={student.avatar} alt="" />
              <div className="text-center md:text-left space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold">{auth.userName}</h1>
                <p className="text-pink-100 font-medium text-sm md:text-base">{student.grade}</p>
                <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">ID: PX-2026-89</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400 text-emerald-950">Active Account</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {student.stats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <div key={stat.id} className="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Layout Split: Courses & Upcoming events */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Enrolled Courses */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Your Active Courses</h2>
                <a href="#" className="text-sm font-semibold text-pink-600 hover:text-pink-700">View all</a>
              </div>
              
              <div className="space-y-4">
                {student.courses.map((course) => (
                  <div key={course.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 hover:text-pink-600 transition-colors cursor-pointer">{course.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">by {course.instructor}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{course.progress}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
                      <div 
                        className="h-2 rounded-full bg-linear-to-r from-pink-500 to-rose-500 transition-all duration-500" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{course.completedLessons} of {course.totalLessons} lessons completed</span>
                      <button className="font-medium text-pink-600 hover:underline">Resume Class</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Column: Schedule & Tasks */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Live Classes</h2>
              
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                {student.upcomingClasses.map((live) => (
                  <div key={live.id} className="flex items-start gap-3 pb-4 last:pb-0 last:border-0 border-b border-gray-100">
                    <div className="mt-0.5 rounded bg-pink-50 p-2 text-pink-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{live.subject}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{live.time}</p>
                      <span className="mt-1.5 inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-2xs font-medium text-blue-700 border border-blue-100">
                        {live.platform}
                      </span>
                    </div>
                    <button className="text-xs font-semibold text-pink-600 hover:text-pink-700 bg-pink-50/50 hover:bg-pink-50 px-2.5 py-1.5 rounded-lg transition-colors">
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Your Completed Courses</h2>
                <a href="#" className="text-sm font-semibold text-pink-600 hover:text-pink-700">View all</a>
              </div>
              <div className="flex sm:grid-cols-1 space-x-4">
                {student.completedCourses.map((course) => (
                  <div key={course.id} className="w-1/3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 hover:text-pink-600 transition-colors cursor-pointer">{course.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">by {course.instructor}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{course.progress}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
                      <div 
                        className="h-2 rounded-full bg-linear-to-r from-green-500 to-lime-500 transition-all duration-500" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{course.completedLessons} of {course.totalLessons} lessons completed</span>
                      <button className="font-medium text-pink-600 hover:underline">Restart Class</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      
    </div>
  );
}