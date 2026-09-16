import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Check, LoaderCircle, LockKeyhole, Mail, MonitorPlay } from "lucide-react";
import Axios from "../../../api/Axios";
import { FACULTY_REGISTRATION } from "../../../api/Urls";

// Match the backend's existing instructor phone validation convention.
const PHONE_PATTERN = /^[+]?[0-9][0-9\s().-]{7,24}$/;
const INPUT_STYLE = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:bg-slate-50";

const TeacherApply = () => {
    const [details, setDetails] = useState({ name: "", email: "", phone: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");
    const [error, setError] = useState("");
    const successHeading = useRef(null);
    const nameInput = useRef(null);

    useEffect(() => {
        if (submittedEmail) successHeading.current?.focus();
    }, [submittedEmail]);

    const updateDetail = (event) => {
        setDetails((current) => ({ ...current, [event.target.name]: event.target.value }));
        setError("");
    };

    const sendSetupLink = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;
        const payload = Object.fromEntries(Object.entries(details).map(([key, value]) => [key, value.trim()]));
        if (!payload.name) {
            setError("Please enter your full name.");
            nameInput.current?.focus();
            return;
        }
        if (!PHONE_PATTERN.test(payload.phone)) {
            setError("Please enter a valid phone number, including your country code if needed.");
            return;
        }
        setError("");
        setIsSubmitting(true);
        try {
            await Axios.post(FACULTY_REGISTRATION, payload, { skipAuth: true, timeout: 20000 });
            setSubmittedEmail(payload.email);
        } catch (requestError) {
            setError(requestError.response?.data?.message
                ?? "We couldn't send your setup link. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative mx-auto max-w-7xl">
            <div className="mb-10 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300 md:mb-14">
                <span aria-hidden="true" className="h-px w-8 bg-emerald-400" />
                Become a Faculty
            </div>
            <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-20">
                <div className="lg:col-span-6 lg:pt-3">
                    <h2 id="faculty-heading" className="max-w-xl text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                        Your knowledge.<br />
                        Their next <span className="text-emerald-300">breakthrough.</span>
                    </h2>
                    <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                        Help learners build confidence, ask better questions, and understand more.
                        Start your teaching journey with Porhaxali.
                    </p>
                    <div className="mt-9 space-y-5">
                        <div className="flex gap-4">
                            <BookOpen aria-hidden="true" size={21} className="mt-0.5 shrink-0 text-emerald-300" />
                            <div>
                                <h3 className="text-sm font-bold text-white">Make room for real understanding</h3>
                                <p className="mt-1 text-sm leading-6 text-slate-400">Bring concepts to life for SEBA and CBSE learners.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <MonitorPlay aria-hidden="true" size={21} className="mt-0.5 shrink-0 text-emerald-300" />
                            <div>
                                <h3 className="text-sm font-bold text-white">Connect through live learning</h3>
                                <p className="mt-1 text-sm leading-6 text-slate-400">Teach, discuss, and guide students in interactive classes.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 border-t border-white/15 pt-6 lg:mt-12">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Getting started is simple</p>
                        <ol className="mt-4 grid grid-cols-3 gap-3 text-xs leading-5 text-slate-200 sm:text-sm">
                            {["Share your details", "Check your email", "Set your password"].map((step, index) => (
                                <li key={step}>
                                    <span className="mb-2 block font-semibold text-emerald-300" aria-hidden="true">0{index + 1}</span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                <div className="min-w-0 rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl shadow-black/20 sm:p-9 lg:col-span-6">
                    {submittedEmail ? (
                        <div className="py-5" aria-live="polite">
                            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                <Mail size={27} aria-hidden="true" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Your next step</p>
                            <h3 ref={successHeading} tabIndex={-1} className="mt-3 text-3xl font-extrabold tracking-tight outline-none">Check your inbox</h3>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                We’ve sent a secure account setup link to <strong className="break-all text-slate-950">{submittedEmail}</strong>.
                                Open it to set your password and create your faculty-applicant account.
                            </p>
                            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                Can’t find the email? Check your spam folder. If you request another link, use the most recent email.
                            </p>
                            {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm leading-6 text-rose-700">{error}</p>}
                            <button type="button" onClick={sendSetupLink} disabled={isSubmitting}
                                className="mt-7 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-4 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 disabled:cursor-wait disabled:opacity-60">
                                {isSubmitting ? <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Mail size={18} aria-hidden="true" />}
                                {isSubmitting ? "Sending your link…" : "Send a new setup link"}
                            </button>
                            <button type="button" disabled={isSubmitting} onClick={() => { setSubmittedEmail(""); setError(""); }}
                                className="mt-4 w-full cursor-pointer rounded-lg py-2 text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-60">
                                Use different details
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={sendSetupLink} aria-labelledby="faculty-form-heading" aria-busy={isSubmitting}>
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700">Start with the basics</p>
                                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800"><Check size={12} aria-hidden="true" /> Step 1</span>
                            </div>
                            <h3 id="faculty-form-heading" className="mt-4 text-2xl font-extrabold tracking-tight sm:text-[1.7rem]">Let’s get to know you.</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">We’ll email you a secure link to set up your account.</p>
                            <fieldset disabled={isSubmitting} className="mt-7 space-y-5">
                                <legend className="sr-only">Your contact details — all fields are required</legend>
                                <div>
                                    <label htmlFor="faculty-name" className="text-sm font-semibold text-slate-700">Full name</label>
                                    <input ref={nameInput} id="faculty-name" name="name" type="text" autoComplete="name" required maxLength={255}
                                        placeholder="Your full name" value={details.name} onChange={updateDetail} className={INPUT_STYLE} />
                                </div>
                                <div>
                                    <label htmlFor="faculty-email" className="text-sm font-semibold text-slate-700">Email address</label>
                                    <input id="faculty-email" name="email" type="email" autoComplete="email" required maxLength={255}
                                        placeholder="you@example.com" value={details.email} onChange={updateDetail} className={INPUT_STYLE} />
                                </div>
                                <div>
                                    <label htmlFor="faculty-phone" className="text-sm font-semibold text-slate-700">Phone number</label>
                                    <input id="faculty-phone" name="phone" type="tel" autoComplete="tel" required maxLength={26}
                                        placeholder="e.g. 9876543210" value={details.phone} onChange={updateDetail} className={INPUT_STYLE} />
                                </div>
                            </fieldset>
                            {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm leading-6 text-rose-700">{error}</p>}
                            <button type="submit" disabled={isSubmitting}
                                className="mt-7 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-emerald-700 px-4 py-4 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 disabled:cursor-wait disabled:opacity-60">
                                {isSubmitting ? "Sending your link…" : "Email me a setup link"}
                                {isSubmitting ? <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
                            </button>
                            <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-slate-500">
                                <LockKeyhole size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                                Set your password securely from your email.
                            </p>
                        </form>
                    )}
                    <p className="mt-6 border-t border-slate-100 pt-5 text-center text-xs leading-6 text-slate-500">
                        Already have an account? <Link to="/login" className="rounded font-bold text-emerald-700 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-600">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TeacherApply;
