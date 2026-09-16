import UseOnlineStatus from "../Hooks/UseOnlineStatus";
import { 
  GraduationCap,
  Award,  
  Users,  
  CheckCircle2, 
  Sparkles, 
  PhoneCall, 
} from 'lucide-react';
import Carousel from "../pages/unauthHome/Carousel";
import LoginButton from "../pages/commom/LoginButton";
import RegisterButton from '../pages/commom/RegisterButton';
import Footer from "../pages/footer";
import CoursesCarousel from "../pages/unauthHome/CoursesCarousel";
import TeacherApply from "./landingComponents/TeacherApply";

const Landing = () => {

  const isOnline = UseOnlineStatus();
  
  
  const teachers = [
    { id: 1, name: "Dr. Ananya Baruah", role: "Head of Mathematics", bio: "10+ years coaching state rankers and Olympiad achievers.", initials: "AB" },
    { id: 2, name: "Rahul Sharma", role: "Physics Lead", bio: "Ex-FIITJEE faculty specializing in conceptual visual mechanics.", initials: "RS" },
    { id: 3, name: "Priya Das", role: "Chemistry Expert", bio: "Organic Chemistry specialist with a focus on competitive foundations.", initials: "PD" }
  ];
  
  const students = [
    { id: 1, name: "Rahul Kalita", achievement: "98% in State Boards", text: "The structured live bootcamps completely changed how I approach math problems.", initials: "RK" },
    { id: 2, name: "Sneha Sarma", achievement: "Olympiad Rank 14", text: "The special Olympiad practice modules are flawless and challenging.", initials: "SS" }
  ];


    return(
        <>
        {isOnline ? (
          <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-rose-500 selection:text-white font-montserrat">
      
          {/* 🌐 TOP GLOBAL NAVBAR */}
          <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 h-20 flex items-center justify-between shadow-sm shadow-slate-900/5">
            <div className="flex items-center gap-8">
            <a href="#main">
              <div className="flex">
               
                <GraduationCap className="h-8 w-10 -ml-3.5 text-indigo-700" />
              <span className="font-montserrat text-2xl font-black tracking-tight text-slate-950">Porhaxali</span>
               
              </div>
              </a>
              <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
                <a href="#courses" className="hover:text-indigo-700 transition">Explore Courses</a>
                <a href="#olympiad" className="hover:text-indigo-700 transition flex items-center gap-1">
                  Math Olympiad <span className="bg-rose-50 text-rose-700 text-[10px] px-1.5 py-0.5 rounded-md font-bold ring-1 ring-rose-100">Special</span>
                </a>
                <a href="#counseling" className="hover:text-indigo-700 transition">Career Counseling</a>
                <a href="#team" className="hover:text-indigo-700 transition">Our Faculty</a>
                <a href="#apply" className="hover:text-indigo-700 transition">Become a Faculty</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <LoginButton/>
              <RegisterButton/>
            </div>
          </header>
    
          {/* 🚀 HERO HERO HERO SECTION */}
          <section id="main" className="max-w-7xl mx-auto px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 col-span-12 space-y-6">
              <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <Sparkles size={14} /> Admissions Open for 2026 - 2027 Academic Batch
              </div>
              <h1 className="font-montserrat text-4xl md:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
                Empowering Regional Minds for <span className="text-indigo-700">Global Excellence</span>
              </h1>
              <p className="text-slate-600 text-base md:text-lg max-w-xl leading-relaxed">
                High-quality interactive school curriculum coaching, specialized competitive math modules, and personalized professional career charting.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a href="#courses" className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-700/20 transition transform hover:-translate-y-0.5 text-center">
                  Browse Best Courses
                </a>
                <a href="#counseling" className="bg-white hover:bg-rose-50 text-slate-800 border border-slate-200 hover:border-rose-200 font-bold px-8 py-3.5 rounded-xl shadow-sm transition text-center">
                  Book Counseling Slot
                </a>
              </div>
            </div>
            <div className="lg:col-span-5 col-span-12 lg:block relative">
            <Carousel/>
            </div>
          </section>
    
          {/* 🎓 SECTION 1: BESTSELLING COURSES */}
          <CoursesCarousel/>
    
          {/* 📐 SECTION 2: THE MATHEMATICS OLYMPIAD WING */}
          <section id="olympiad" className="max-w-7xl mx-auto py-20 px-6 scroll-mt-24">
            <div className="bg-linear-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl p-8 md:p-14 shadow-2xl shadow-indigo-950/20 relative overflow-hidden">
              <div className="max-w-3xl relative z-10 space-y-6">
                <span className="bg-indigo-400/15 border border-indigo-300/20 text-indigo-200 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider inline-block">
                  Advanced Mathematics Division
                </span>
                <h2 className="font-montserrat text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  Cracking Regional & National Math Olympiads
                </h2>
                <p className="text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed">
                  We specialize in preparing young talent for prestigious math competitions. Our customized curriculum breaks away from rote school calculations to hone logical depth, proof construction, and number theory.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3">
                    <Award className="text-amber-400 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-200"><span className="font-bold text-white">Targeted Problem Sets:</span> Non-routine conceptual frameworks across Combinatorics & Geometry.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="text-indigo-400 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-200"><span className="font-bold text-white">Peer Elite Cohorts:</span> Train directly alongside top state minds with daily mock testing feedback loops.</p>
                  </div>
                </div>
    
                <div className="pt-6 flex flex-wrap gap-4">
                  <button className="bg-white text-indigo-950 font-black px-6 py-3.5 rounded-xl shadow-md hover:bg-indigo-50 transition text-sm">
                    Download Olympiad Syllabus PDF
                  </button>
                  <button className="bg-indigo-700 hover:bg-indigo-600 text-white font-bold px-6 py-3.5 rounded-xl border border-indigo-400/30 transition text-sm">
                    View Past Selections
                  </button>
                </div>
              </div>
              {/* Subtle math geometry accent background */}
              <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-linear-to-l from-indigo-500/10 to-transparent pointer-events-none hidden lg:block"></div>
            </div>
          </section>
    
          {/* 🧭 SECTION 3: CAREER COUNSELING HUB */}
          <section id="counseling" className="bg-slate-950 text-white py-20 px-6 relative overflow-hidden scroll-mt-24">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              <div className="lg:col-span-5 space-y-6">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                  Personal Growth Map
                </span>
                <h2 className="font-montserrat text-3xl md:text-4xl font-black tracking-tight">
                  Confused About Streams? Meet Our Guidance Mentors
                </h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  Choosing the right balance of courses between Arts, Science, Commerce, or competitive exam preparation dictates long-term success. Get detailed path diagnostics directly from top academic psychologists.
                </p>
                <div className="space-y-3 pt-2">
                  {["1-on-1 Dedicated Video Consultation Slots", "Psychometric Stream Assessment Assays", "Long-term University Roadmap Scopes"].map((perk, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="text-emerald-400 shrink-0" size={18} /> {perk}
                    </div>
                  ))}
                </div>
              </div>
    
              {/* Dynamic Booking Card UI Form */}
              <div className="lg:col-span-7 bg-white text-slate-900 rounded-2xl p-6 md:p-10 shadow-2xl shadow-slate-950/20 border border-slate-100">
                <h3 className="font-montserrat text-xl md:text-2xl font-black text-slate-950 mb-2">Book Your Strategy Session</h3>
                <p className="text-slate-500 text-xs md:text-sm mb-6">Select your academic group to claim a highly personalized initial advice session completely free.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Student Name</span>
                    <input type="text" placeholder="e.g. Rahul" className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Current Standard/Class</span>
                    <select className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition">
                      <option>Class 9 - 10</option>
                      <option>Class 11 - 12</option>
                      <option>Olympiad Aspirant</option>
                    </select>
                  </label>
                </div>
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl text-center shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2">
                  <PhoneCall size={18} /> Confirm Call Back Appointment
                </button>
              </div>
            </div>
          </section>
    
          {/* 👨‍🏫 SECTION 4: BEST TEACHERS & STUDENTS */}
          <section id="team" className="max-w-7xl mx-auto py-20 px-6 space-y-20 scroll-mt-24">
            
            {/* Teachers List */}
            <div>
              <div className="text-center md:text-left mb-10">
                <h2 className="font-montserrat text-3xl font-black text-slate-950 tracking-tight">Learn From Academic Pillars</h2>
                <p className="text-slate-500 text-sm mt-1">Our certified subject experts break down intricate competitive parameters step-by-step.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {teachers.map((t) => (
                  <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-200 hover:shadow-md transition">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-inner">
                        {t.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{t.name}</h3>
                        <p className="text-xs font-bold text-rose-600 mt-0.5">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{t.bio}</p>
                  </div>
                ))}
              </div>
            </div>
    
            {/* Student Testimonials Wall */}
            <div>
              <div className="text-center md:text-left mb-10">
                <h2 className="font-montserrat text-3xl font-black text-slate-950 tracking-tight">Our Student Wall of Fame</h2>
                <p className="text-slate-500 text-sm mt-1">Real reviews and structural milestones documented by our learners.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {students.map((s) => (
                  <div key={s.id} className="bg-linear-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-md shadow-indigo-950/15">
                    <p className="italic text-slate-300 text-sm mb-6 leading-relaxed relative z-10">"{s.text}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-rose-500 text-white font-black flex items-center justify-center text-sm shadow-md">
                        {s.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">{s.name}</h4>
                        <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">{s.achievement}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section id="apply" aria-labelledby="faculty-heading" className="relative scroll-mt-20 overflow-hidden bg-slate-950 px-6 py-16 text-white font-montserrat md:py-20">
            <TeacherApply/>
          </section>
          <Footer/>
    
        </div>
        ): (
          <div>Disconnected: Please check your internet connection</div>
        )}
      
     
     </> 
     
  );
}
   
export default Landing;
