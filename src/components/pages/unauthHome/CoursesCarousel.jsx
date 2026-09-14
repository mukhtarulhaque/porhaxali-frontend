import {useState,useRef, useEffect} from "react";
import { Star, ArrowRight, ArrowLeft } from 'lucide-react';
import Axios from "../../../api/Axios";
import { GET_SUBJECTS } from "../../../api/Urls";

const FALLBACK_COURSES = [
  {
    id: 'fallback-math',
    code: 'Board Exams',
    name: 'Class 10 Advanced Math Masterclass',
    description: '1,240',
  },
  {
    id: 'fallback-olympiad',
    code: 'Competitive',
    name: 'Regional & National Math Olympiad Prep',
    description: '480',
  },
  {
    id: 'fallback-science',
    code: 'Class 11-12',
    name: 'Physics & Chemistry Foundation',
    description: '850',
  },
];

const CoursesCarousel = () => {
    const carouselRef = useRef(null);
      const [canScrollLeft, setCanScrollLeft] = useState(false);
      const [canScrollRight, setCanScrollRight] = useState(true);
      const [courses, setCourses] = useState([]);
      // 2. Function to check scroll position
  const checkForScrollPosition = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      
      // If scrollLeft is greater than 0, we can scroll left
      setCanScrollLeft(scrollLeft > 0);
      
      // If scrollLeft + visible width is less than total width, we can scroll right
      // (Subtracting 1px as a safety buffer for browser rounding decimals)
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    }
  };
  // useEffect(() => {
  //   checkForScrollPosition();
  // }, []);
      const scroll = (direction) => {
        if (carouselRef.current) {
          // Scrolls by the width of one card + gap (adjust multiplier as needed)
          const scrollAmount = carouselRef.current.offsetWidth / 3; 
          carouselRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
          });
        }
      };
     
      useEffect(()=>{
            const getSubjects = async () => {
                try {
                    await Axios.get(GET_SUBJECTS)
                        .then(function (response) {
                            setCourses(response.data.data);
                            // setFetchDataSuccess(true);
                            console.log(response.data.data);
                        })
                } catch (err) {
                    console.log(err);
                }
            };
            getSubjects();
      },[]);
      useEffect(() => {
        if (courses.length > 0) {
          // requestAnimationFrame ensures DOM layout calculations are finalized
          requestAnimationFrame(() => {
            checkForScrollPosition();
          });
        }
      }, [courses]);

      const displayCourses = courses.length > 0 ? courses : FALLBACK_COURSES;

    return(<>
        <section id="courses" className="bg-white border-y border-slate-200 py-20 px-6 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="font-montserrat text-3xl font-black text-slate-950 tracking-tight">Our Curated Best-Sellers</h2>
              <p className="text-slate-500 mt-1">Structured learning paths built by curriculum experts.</p>
            </div>
            <div className="gap-2 hidden md:flex">
          <button 
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition-all shadow-sm
              ${canScrollLeft 
                ? "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95 hover:cursor-pointer" 
                : "text-slate-300 opacity-50 cursor-not-allowed"}`}
          >
            <ArrowLeft/>
          </button>
          <button 
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition-all shadow-sm
              ${canScrollRight 
                ? "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95 hover:cursor-pointer" 
                : "text-slate-300 opacity-50 cursor-not-allowed"}`}
            //className="flex h-10 w-10 items-center hover:cursor-pointer justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-95 shadow-sm"
          >
            {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg> */}
            <ArrowRight/>
          </button>
        </div>
          </div>

          {/* <div ref={carouselRef} className="grid grid-cols-1 md:grid-cols-3 gap-8"> */}
          <div ref={carouselRef}
          onScroll={checkForScrollPosition}
           className="no-scrollbar flex w-full snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4">
            {displayCourses.map((course) => (
              <div key={course.id} className="w-full shrink-0 snap-start md:w-[calc(33.333%-16px)] bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-950/10 transition-all duration-300">
                <div>
                  <span className={`inline-block px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold tracking-wide mb-4`}>
                    Featured
                  </span>
                  <p className="text-xs text-indigo-700 font-bold uppercase tracking-wider">{course.code}</p>
                  <h3 className="font-montserrat text-xl font-bold text-slate-950 mt-1 mb-4 leading-snug">{course.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <Star className="text-amber-600 fill-amber-400" size={16} />  
                    <span className="text-slate-500 font-normal">({course.description} learners)</span>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Learning Track</p>
                    <p className="text-sm font-bold text-slate-900">Guided cohort</p>
                  </div>
                  <button className="bg-indigo-700 hover:cursor-pointer hover:bg-indigo-800 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-700/20 transition">
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
    );
}

export default CoursesCarousel;
