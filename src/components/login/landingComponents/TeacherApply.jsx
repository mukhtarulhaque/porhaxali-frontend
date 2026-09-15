import React from "react";
import { 
    GraduationCap,
    Award,  
    Users,  
    CheckCircle2, 
    Sparkles, 
    PhoneCall, 
  } from 'lucide-react';

const TeacherApply = () => {
return(
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              <div className="lg:col-span-5 space-y-6">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                  Why choose Porhaxali
                </span>
                <h2 className="font-montserrat text-3xl md:text-4xl font-black tracking-tight">
                Join Elite Educators Mentoring Regional & National Talent.
                </h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed text-justify">
                Connect with and impact dedicated learners across regional (SEBA) and national (CBSE) boards who are seeking structured, guided cohorts.
                Freedom to emphasize logic building, proof construction, and visual conceptual frameworks over rote learning methods.
                Access to an interactive digital classroom infrastructure featuring real-time audio and chat, enabling seamless doubt-clearing and direct engagement.
                </p>
                <div className="space-y-3 pt-2">
                  {["Teach High-Caliber Aspirants", "Modern Live Teaching Tools:", "Work Alongside Elite Faculty","Wide Regional Reach","Focus on Conceptual Depth"].map((perk, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="text-emerald-400 shrink-0" size={18} /> {perk}
                    </div>
                  ))}
                </div>
              </div>
    
              {/* Dynamic Booking Card UI Form */}
              <div className="lg:col-span-7 bg-white text-slate-900 rounded-2xl p-6 md:p-10 shadow-2xl shadow-slate-950/20 border border-slate-100">
                <h3 className="font-montserrat text-xl md:text-2xl font-black text-slate-950 mb-2">Apply Now. Teach Live. Inspire Always.</h3>
                <p className="text-slate-500 text-xs md:text-sm mb-6">Connect with dedicated learners and conduct high-impact interactive live sessions</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</span>
                    <input type="text" placeholder="e.g. Rahul Kumar Das" className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mobile Number</span>
                    <input type="text" placeholder="e.g. 9999999999" className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email</span>
                    <input type="text" placeholder="e.g. abc@g.com" className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Gender</span>
                    <select className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="transgender">Transgender</option>
                    </select>
                  </label>
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Teaching Experience</span>
                    <textarea type="text" placeholder="e.g. 10 years of teaching experience" className="w-full h-32 resize-none placeholder:text-gray-400 border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition"></textarea>
                  </label>
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Applied for</span>
                    <select className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition">
                      <option value="Science">Science Teacher</option>
                      <option value="Maths">Maths Teacher</option>
                      <option value="English">English Teacher</option>
                    </select>
                  </label>
                </div>
                <button className="w-full hover:cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl text-center shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2">
                  <PhoneCall size={18} /> Join as Faculty
                </button>
              </div>
            </div>
);
}
export default TeacherApply;