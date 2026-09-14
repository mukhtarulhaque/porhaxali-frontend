import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const carouselItems = [
  {
    id: 1,
    title: "Your Gateway to Smarter Learning",
    description: "Empowering students with structured regional education, comprehensive notes, and interactive live classes.",
    bgClass: "from-indigo-800 via-indigo-700 to-slate-900",
    badge: "Now Live"
  },
  {
    id: 2,
    title: "Interactive Live Sessions",
    description: "Clear your doubts instantly with real-time audio and chat interaction directly with top educators.",
    bgClass: "from-slate-900 via-indigo-800 to-cyan-800",
    badge: "Interactive Features"
  },
  {
    id: 3,
    title: "Handcrafted Study Notes",
    description: "Download verified high-quality PDF study guides and syllabus breakdowns anytime, anywhere.",
    bgClass: "from-teal-700 via-emerald-700 to-slate-900",
    badge: "Resources Available"
  }
];
const AUTO_PLAY_DELAY = 6000;
const Carousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (isPaused) return;
    const slideInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
    return () => clearInterval(slideInterval);
  }, [nextSlide, isPaused]);
    return(
        <section 
      className="relative w-full max-w-6xl mx-auto h-95 md:h-110 group rounded-2xl shadow-xl shadow-indigo-950/15 overflow-hidden bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* SLIDES */}
      {carouselItems.map((slide, index) => {
        const isActive = index === currentIndex;
        
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out flex flex-col justify-center p-8 md:p-14 bg-linear-to-br ${slide.bgClass}
              ${isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'}`}
          >
            <div className="max-w-2xl relative z-20 space-y-5">
              
              {/* Animated Badge */}
              <div className={`transform transition-all duration-700 delay-300 ease-out ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <span className="bg-white/15 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm ring-1 ring-white/20">
                  {slide.badge}
                </span>
              </div>
              
              {/* Animated Title */}
              <h1 className={`font-montserrat text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md transform transition-all duration-700 delay-500 ease-out ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                {slide.title}
              </h1>
              
              {/* Animated Description */}
              <p className={`text-white/95 text-base md:text-lg max-w-xl font-medium leading-relaxed transform transition-all duration-700 delay-700 ease-out ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                {slide.description}
              </p>
              
              {/* Animated Button */}
              <div className={`pt-4 transform transition-all duration-700 delay-900 ease-out ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <button className="bg-white text-indigo-900 font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300 active:scale-95">
                  Explore Now
                </button>
              </div>

            </div>

            {/* Background Decorative Circles */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-slate-950/25 to-transparent pointer-events-none"></div>
          </div>
        );
      })}

      {/* NAVIGATION CONTROLS */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-30 pointer-events-none">
        <button 
          onClick={prevSlide}
          className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 pointer-events-auto border border-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide}
          className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 pointer-events-auto border border-white/10"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* ANIMATED INDICATORS & PROGRESS BAR */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30 px-6">
        {carouselItems.map((_, index) => {
          const isActive = currentIndex === index;
          return (
            <div
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="relative h-1.5 cursor-pointer rounded-full overflow-hidden transition-all duration-500 bg-white/30"
              style={{ width: isActive ? '3rem' : '1.5rem' }}
            >
              {/* Filling progress bar for active slide */}
              {isActive && (
                <div 
                  className="absolute top-0 left-0 h-full bg-white rounded-full"
                  style={{
                    animation: isPaused ? 'none' : `progress ${AUTO_PLAY_DELAY}ms linear forwards`
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Include this custom keyframe for the progress bar animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}} />

    </section>
    );
}
export default Carousel;
