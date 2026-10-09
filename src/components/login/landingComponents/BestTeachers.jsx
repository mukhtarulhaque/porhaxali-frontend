import { useEffect, useState } from "react";
import Axios from "../../../api/Axios";

const PUBLIC_INSTRUCTORS_URL = "api/public/instructors";
const INSTRUCTOR_PAGE_SIZE = 6;

const getInitials = (name = "") => {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "?";
};

const FacultyAvatar = ({ instructor }) => {
  const [imageFailed, setImageFailed] = useState(false);

  const showPhoto = instructor.profilePhotoUrl && !imageFailed;

  return (
    <div className="relative shrink-0">
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 to-indigo-950 font-black text-base text-white shadow-md shadow-indigo-950/20 ring-4 ring-slate-100 transition-all duration-300 group-hover:ring-emerald-100">
        {showPhoto ? (
          <img
            src={instructor.profilePhotoUrl}
            alt={`${instructor.displayName} profile`}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span aria-label={`${instructor.displayName} avatar`}>
            {getInitials(instructor.displayName)}
          </span>
        )}
      </div>
      <div
        title="Verified Faculty"
        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white ring-2 ring-white"
      >
        <svg className="h-3 w-3 stroke-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );
};

const LoadingCards = () => (
  <div
    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
    aria-label="Loading faculty profiles"
    aria-busy="true"
  >
    {Array.from({ length: 3 }, (_, index) => (
      <div
        key={index}
        className="animate-pulse rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs"
      >
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-200" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-5 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <div className="h-3 rounded bg-slate-100" />
          <div className="h-3 w-5/6 rounded bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

const BestTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const getFaculty = async () => {
      try {
        const response = await Axios.get(PUBLIC_INSTRUCTORS_URL, {
          params: { page: 0, size: INSTRUCTOR_PAGE_SIZE },
          signal: controller.signal,
          skipAuth: true,
        });
        const page = response.data?.data;

        if (!Array.isArray(page?.content)) {
          throw new Error("Invalid public instructor response");
        }

        if (isMounted) {
          setTeachers(page.content);
          setTotalTeachers(page.totalElements ?? page.content.length);
        }
      } catch (error) {
        if (isMounted && error.code !== "ERR_CANCELED") {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getFaculty();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <section
      id="team"
      className="relative mx-auto max-w-7xl overflow-hidden px-4 py-20 font-montserrat scroll-mt-24 sm:px-6 sm:py-28 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[24px_24px] opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-96 w-3xl -translate-x-1/2 rounded-full bg-linear-to-tr from-emerald-100/40 via-indigo-100/30 to-slate-100/50 blur-3xl"
      />

      <div className="relative sm:mb-20">
        <div className="flex flex-col justify-between gap-6 border-b border-slate-200/80 pb-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1 text-xs font-semibold text-emerald-800 backdrop-blur-xs">
              <span className="flex h-2 w-2 animate-ping rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold tracking-wide uppercase">Academic Council & Chairs</span>
            </div>

            <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Learn From{" "}
              <span className="bg-linear-to-r from-indigo-700 via-indigo-800 to-slate-900 bg-clip-text text-transparent">
                Academic Pillars
              </span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed font-normal text-slate-600 sm:text-base">
              Our tenured research scholars and competitive examiners deconstruct intricate syllabus parameters into actionable academic pathways.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start rounded-2xl border border-slate-200/90 bg-white/80 p-3 px-4 shadow-xs backdrop-blur-md md:self-auto">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white shadow-xs">
              {isLoading ? "–" : totalTeachers}
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Accredited</p>
              <p className="text-xs font-bold text-slate-800">Faculty Members</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingCards />
      ) : hasError ? (
        <div className="rounded-3xl border border-slate-200/90 bg-white px-6 py-12 text-center shadow-xs">
          <p className="text-sm font-medium text-slate-600">
            Faculty profiles are temporarily unavailable. Please try again later.
          </p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/90 bg-white px-6 py-12 text-center shadow-xs">
          <p className="text-sm font-medium text-slate-600">Our faculty profiles are coming soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {teachers.map((teacher) => (
            <article
              key={teacher.id}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-8 -top-px h-0.5 bg-linear-to-r from-transparent via-emerald-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <div>
                <div className="mb-5 flex items-start gap-4">
                  <FacultyAvatar instructor={teacher} />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600">
                      {teacher.displayName}
                    </h3>

                    {teacher.subjects?.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {teacher.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-slate-700"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {teacher.bio && (
                  <p className="line-clamp-3 text-xs leading-relaxed text-slate-500 sm:text-sm">
                    {teacher.bio}
                  </p>
                )}
              </div>

              {teacher.teachingExperienceYears != null && (
                <div className="mt-7 flex items-center border-t border-slate-100 pt-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {teacher.teachingExperienceYears} {teacher.teachingExperienceYears === 1 ? "year" : "years"} teaching experience
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default BestTeachers;
