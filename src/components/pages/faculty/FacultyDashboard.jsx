import React, {useEffect, useState} from "react";
import Sidebar from "../student/Sidebar";
import { facultyTabs } from "../commom/CommonArrays";
// import Axios from '../../../api/Axios';
// import { GET_LOGIN_INSTRUCTOR } from "../../../api/Urls";
import { 
    Menu, 
    X, 
    Bell, 
    Search, 
    BookOpen, 
    Users, 
    Calendar, 
    CheckCircle2, 
    Clock 
  } from "lucide-react";

import UseAuth from "../../Hooks/UseAuth";
import DynamicDate from "./facultyComponents/DynamicDate";

//const TEST_API = "api/instructors/me";

const FacultyDashboard = () => {

    const {auth} = UseAuth(); 

   
return(
    <>
        <div className="min-h-screen  font-montserrat bg-gray-50  text-gray-800 flex">
            <Sidebar pageId="Dashboard" tabs={facultyTabs}/>
            <div className="w-full transition-transform duration-300 ease-in-out">
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Welcome Banner */}
          {/* <div className="bg-linear-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Welcome back, Dr. Connor!</h2>
              <p className="text-indigo-100 text-sm mt-1">
                You have 2 upcoming lectures and 14 student assignments pending review today.
              </p>
            </div>
            <button className="self-start sm:self-auto px-4 py-2 bg-white text-indigo-700 font-semibold text-sm rounded-xl shadow-sm hover:bg-indigo-50 transition-colors">
              View Schedule
            </button>
          </div> */}
          <div className="relative rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden">
  {/* Subtle Indigo Accent Left Border */}
  <div className="absolute left-0 inset-y-0 w-1.5 bg-indigo-600" />

  <div className="space-y-1 pl-2 sm:pl-0">
    <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold tracking-wide uppercase">
      <span>Dashboard Overview</span>
      <span>•</span>
      <span><DynamicDate/></span>
    </div>
    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
      Welcome back, Dr. Connor!
    </h2>
    <p className="text-slate-500 text-sm max-w-xl">
      You have <span className="font-semibold text-slate-800">2 upcoming lectures</span> and <span className="font-semibold text-slate-800">14 assignments</span> awaiting review.
    </p>
  </div>

  <div className="flex items-center gap-3 pl-2 sm:pl-0 shrink-0">
    <button className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
      Pending Tasks
    </button>
    <button className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition-all">
      View Schedule
    </button>
  </div>
</div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Active Courses"
              value="4"
              subtext="Semester 2"
              icon={<BookOpen className="w-5 h-5 text-indigo-600" />}
              iconBg="bg-indigo-50"
            />
            <StatCard
              title="Total Enrolled"
              value="248"
              subtext="+12 this semester"
              icon={<Users className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
            />
            <StatCard
              title="Pending Reviews"
              value="18"
              subtext="Assignments & exams"
              icon={<Clock className="w-5 h-5 text-amber-600" />}
              iconBg="bg-amber-50"
            />
            <StatCard
              title="Attendance Avg."
              value="92.4%"
              subtext="+1.8% from last month"
              icon={<CheckCircle2 className="w-5 h-5 text-sky-600" />}
              iconBg="bg-sky-50"
            />
          </div>

          {/* Two-Column Responsive Content Block */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Classes */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Today's Lectures</h3>
                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Full Calendar
                </button>
              </div>
              <div className="space-y-3">
                {[
                  {
                    code: "CS302",
                    name: "Data Structures & Algorithms",
                    room: "Lab 304",
                    time: "10:30 AM - 12:00 PM",
                    students: 62,
                  },
                  {
                    code: "CS410",
                    name: "Artificial Intelligence Foundations",
                    room: "Hall B",
                    time: "02:00 PM - 03:30 PM",
                    students: 54,
                  },
                ].map((cls, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700">
                          {cls.code}
                        </span>
                        <h4 className="font-medium text-slate-800 text-sm">{cls.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {cls.room} • {cls.students} students enrolled
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {cls.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions / Notices */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Notice Board</h3>
                <ul className="space-y-3 text-sm">
                  <li className="pb-3 border-b border-slate-100">
                    <p className="font-medium text-xs text-indigo-600">
                      Academic Council
                    </p>
                    <p className="text-slate-600 mt-0.5 text-xs">
                      Mid-semester marks submission deadline is extended to Friday.
                    </p>
                  </li>
                  <li>
                    <p className="font-medium text-xs text-indigo-600">
                      Department Meeting
                    </p>
                    <p className="text-slate-600 mt-0.5 text-xs">
                      Curriculum review scheduled tomorrow at 4:00 PM in Conference Room A.
                    </p>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <button className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-xl transition-colors">
                  Create Announcement
                </button>
              </div>
            </div>
          </div>
        </main>
            </div>
        </div>
            
    </>
        
);

}

export default FacultyDashboard;


function StatCard({ title, value, subtext, icon, iconBg }) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
    );
  }