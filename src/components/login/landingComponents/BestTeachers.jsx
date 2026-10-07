import React, {useState, useEffect} from "react";
import Axios from "../../../api/Axios";
import { GET_INSTRUCTOR_PROFILE_PHOTO_URL } from "../../../api/Urls";

const BestTeachers = () => {
    const [getFacultyProfilePhoto, setGetFacultyProfilePhoto] = useState('null');
    useEffect(()=> {
        const getFacultyPhoto = async () => {
          try {
              await Axios.get(GET_INSTRUCTOR_PROFILE_PHOTO_URL
                
                )
                  .then(function (response) { console.log(hi);
                      console.log(response.data.data.url)
                      //setProfilePhoto(response.data.data.url);
                  })
          } catch (err) {
              console.log(err);
          }
      }
      getFacultyPhoto();
    },[]);
    const teachers = [
        { id: 1, name: "Dr. Ananya Baruah", role: "Head of Mathematics", bio: "10+ years coaching state rankers and Olympiad achievers.", initials: "AB" },
        { id: 2, name: "Rahul Sharma", role: "Physics Lead", bio: "Ex-FIITJEE faculty specializing in conceptual visual mechanics.", initials: "RS" },
        { id: 3, name: "Priya Das", role: "Chemistry Expert", bio: "Organic Chemistry specialist with a focus on competitive foundations.", initials: "PD" }
      ];
return(
    // <section id="team" className="max-w-7xl mx-auto py-20 px-6 space-y-20 scroll-mt-24">
            
    //         {/* Teachers List */}
    //         <div>
    //           <div className="text-center md:text-left mb-10">
    //             <h2 className="font-montserrat text-3xl font-black text-slate-950 tracking-tight">Learn From Academic Pillars</h2>
    //             <p className="text-slate-500 text-sm mt-1">Our certified subject experts break down intricate competitive parameters step-by-step.</p>
    //           </div>
    //           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    //             {teachers.map((t) => (
    //               <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-200 hover:shadow-md transition">
    //                 <div className="flex items-center gap-4 mb-4">
    //                   <div className="w-14 h-14 rounded-2xl bg-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-inner">
    //                     {t.initials}
    //                   </div>
    //                   <div>
    //                     <h3 className="font-bold text-slate-900 text-lg leading-tight">{t.name}</h3>
    //                     <p className="text-xs font-bold text-rose-600 mt-0.5">{t.role}</p>
    //                   </div>
    //                 </div>
    //                 <p className="text-sm text-slate-500 leading-relaxed">{t.bio}</p>
    //               </div>
    //             ))}
    //           </div>
    //         </div>
    //         </section>
    // <section
    //   id="team"
    //   className="relative max-w-7xl mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-24 overflow-hidden"
    // >
    //   {/* Subtle Background Ambience */}
    //   <div 
    //     aria-hidden="true" 
    //     className="pointer-events-none absolute -top-24 -left-20 h-96 w-96 rounded-full bg-indigo-50/60 blur-3xl -z-10" 
    //   />
    //   <div 
    //     aria-hidden="true" 
    //     className="pointer-events-none absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-slate-100/80 blur-3xl -z-10" 
    //   />

    //   {/* Header Section */}
    //   <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16 border-b border-slate-100 pb-8">
    //     <div className="max-w-2xl text-center md:text-left">
    //       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide uppercase mb-3">
    //         <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
    //         Distinguished Faculty
    //       </div>
    //       <h2 className="font-montserrat text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
    //         Learn From Academic Pillars
    //       </h2>
    //       <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
    //         Our certified subject experts break down intricate competitive parameters step-by-step.
    //       </p>
    //     </div>

    //     {/* Faculty Count Pill */}
    //     <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl shrink-0">
    //       <span className="text-slate-900 font-bold">{teachers.length}</span> Active Mentors
    //     </div>
    //   </div>

    //   {/* Cards Grid */}
    //   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
    //     {teachers.map((t) => (
    //       <article
    //         key={t.id}
    //         className="group relative flex flex-col justify-between bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-indigo-950/5 hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1"
    //       >
    //         <div>
    //           {/* Header Info */}
    //           <div className="flex items-start gap-4 mb-5">
    //             <div className="relative shrink-0">
    //               <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-linear-to-br from-indigo-600 to-indigo-800 text-white font-black text-lg flex items-center justify-center shadow-md shadow-indigo-600/20 ring-4 ring-indigo-50 group-hover:ring-indigo-100 transition-all">
    //                 {t.initials}
    //               </div>
    //             </div>

    //             <div className="min-w-0 flex-1">
    //               <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight group-hover:text-indigo-600 transition-colors truncate">
    //                 {t.name}
    //               </h3>
    //               <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-100 text-rose-600 font-bold text-xs tracking-wide">
    //                 {t.role}
    //               </div>
    //             </div>
    //           </div>

    //           {/* Bio */}
    //           <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
    //             {t.bio}
    //           </p>
    //         </div>

    //         {/* Bottom Meta & Action */}
    //         <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
    //           <span className="text-slate-400 group-hover:text-slate-500 transition-colors">
    //             Available for Mentorship
    //           </span>
    //           <span className="text-indigo-600 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
    //             Profile 
    //             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    //               <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    //             </svg>
    //           </span>
    //         </div>
    //       </article>
    //     ))}
    //   </div>
    // </section>
    <section
      id="team"
      className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 font-montserrat scroll-mt-24 overflow-hidden"
    >
      {/* Decorative Blueprint Grid & Soft Radial Glows */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[24px_24px] opacity-60" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-96 w-3xl -translate-x-1/2 rounded-full bg-linear-to-tr from-emerald-100/40 via-indigo-100/30 to-slate-100/50 blur-3xl" 
      />

      {/* Header Container */}
      <div className="relative sm:mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200/80">
          <div className="max-w-2xl">
            {/* Academic Accreditation Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1 text-xs font-semibold text-emerald-800 backdrop-blur-xs mb-3.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold tracking-wide uppercase text-[10px]">Academic Council & Chairs</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Learn From <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-700 via-indigo-800 to-slate-900">Academic Pillars</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Our tenured research scholars and competitive examiners deconstruct intricate syllabus parameters into actionable academic pathways.
            </p>
          </div>

          {/* Institutional Metric Pill */}
          <div className="flex items-center gap-3 self-start md:self-auto rounded-2xl border border-slate-200/90 bg-white/80 p-3 px-4 shadow-xs backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-sm shadow-xs">
              {teachers.length || 0}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accredited</p>
              <p className="text-xs font-bold text-slate-800">Faculty Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {teachers.map((t) => (
          <div
            key={t.id}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5"
          >
            {/* Subtle Gradient Accent Bar on Card Top */}
            <div 
              aria-hidden="true" 
              className="absolute inset-x-8 -top-px h-0.5 bg-linear-to-r from-transparent via-emerald-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
            />

            <div>
              {/* Profile Card Header */}
              <div className="flex items-start gap-4 mb-5">
                {/* Monogram / Avatar with double ring styling */}
                <div className="relative shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-slate-900 to-indigo-950 font-black text-base text-white shadow-md shadow-indigo-950/20 ring-4 ring-slate-100 group-hover:ring-emerald-100 transition-all duration-300">
                    {t.initials}
                  </div>
                  {/* Verified Indicator Badge */}
                  <div 
                    title="Verified Faculty" 
                    className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 ring-2 ring-white text-white"
                  >
                    <svg className="h-3 w-3 stroke-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {t.name}
                  </h3>
                  
                  {/* Department / Designation Badge */}
                  <span className="mt-1 inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-slate-700">
                    {t.role}
                  </span>
                </div>
              </div>

              {/* Bio Summary with clean typography */}
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3">
                {t.bio}
              </p>
            </div>

            {/* Bottom Meta & Interactive Footer */}
            <div className="mt-7 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Office Hours Open
              </span>

              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors"
              >
                Dossier
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
);
}

export default BestTeachers;