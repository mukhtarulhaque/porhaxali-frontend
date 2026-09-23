import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowRight,
    Check,
    CheckCircle2,
    Eye,
    EyeOff,
    GraduationCap,
    KeyRound,
    LoaderCircle,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";
import Axios from "../../api/Axios";
import { FACULTY_ACCOUNT_SETUP } from "../../api/Urls";

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const INPUT_STYLE = "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-wait disabled:opacity-70";

const FacultyAccountSetup = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") ?? "";
    const hasValidToken = TOKEN_PATTERN.test(token);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    const passwordChecks = useMemo(() => ({
        longEnough: password.length >= 8,
        withinByteLimit: new TextEncoder().encode(password).length <= 72,
        matches: password.length > 0 && password === confirmPassword,
    }), [password, confirmPassword]);

    const updatePassword = (setter) => (event) => {
        setter(event.target.value);
        setError("");
    };

    const submitPassword = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        if (!passwordChecks.longEnough) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (!passwordChecks.withinByteLimit) {
            setError("Password is too long. Please use a shorter password.");
            return;
        }
        if (!passwordChecks.matches) {
            setError("Password and confirmation do not match.");
            return;
        }

        setError("");
        setIsSubmitting(true);
        try {
            await Axios.post(FACULTY_ACCOUNT_SETUP, {
                token,
                password,
                confirmPassword,
            }, { skipAuth: true, timeout: 20000 });
            setPassword("");
            setConfirmPassword("");
            setIsComplete(true);
            navigate("/faculty/setup-account", { replace: true });
        } catch (requestError) {
            setError(requestError.response?.data?.message
                ?? "We couldn't create your account. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 px-5 py-8 font-montserrat text-slate-900 sm:px-8 lg:flex lg:items-center lg:py-12">
            <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/30 lg:grid-cols-[0.9fr_1.1fr]">
                <section className="relative overflow-hidden bg-linear-to-br from-emerald-800 via-emerald-900 to-slate-950 px-7 py-10 text-white sm:px-12 sm:py-14 lg:min-h-162.5 lg:px-14 lg:py-16">
                    <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full border border-white/10" aria-hidden="true" />
                    <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" />
                    <div className="relative flex h-full flex-col">
                        <Link to="/" className="flex w-fit items-center gap-2 rounded-lg text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300">
                            <GraduationCap size={34} className="text-emerald-300" aria-hidden="true" />
                            <span className="text-xl font-black tracking-tight">Porhaxali</span>
                        </Link>
                        <div className="my-auto py-14 lg:py-8">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Faculty application</p>
                            <h1 className="mt-5 max-w-md text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                                One last step before your teaching journey begins.
                            </h1>
                            <p className="mt-5 max-w-md text-sm leading-7 text-emerald-50/75">
                                Create a secure password for your faculty-applicant account. You’ll use your email and this password to sign in.
                            </p>
                            <div className="mt-9 flex items-center gap-3 text-sm font-semibold text-emerald-50">
                                <ShieldCheck size={20} className="text-emerald-300" aria-hidden="true" />
                                Your setup link is single-use and time-limited.
                            </div>
                        </div>
                        <p className="text-xs leading-5 text-emerald-100/55">
                            Creating an account submits your faculty application; it does not confirm teaching approval.
                        </p>
                    </div>
                </section>

                <section className="flex items-center px-7 py-10 sm:px-12 sm:py-14 lg:px-16">
                    <div className="w-full">
                        {isComplete ? (
                            <div role="status" aria-live="polite">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                    <CheckCircle2 size={28} aria-hidden="true" />
                                </div>
                                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Account created</p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">You’re ready to sign in.</h2>
                                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
                                    Your faculty-applicant account is active. Sign in with your email address and the password you just created.
                                </p>
                                <Link to="/login" className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
                                    Continue to login <ArrowRight size={18} aria-hidden="true" />
                                </Link>
                            </div>
                        ) : !hasValidToken ? (
                            <div role="alert">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                                    <KeyRound size={27} aria-hidden="true" />
                                </div>
                                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-rose-700">Invalid setup link</p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">This link can’t be used.</h2>
                                <p className="mt-4 text-sm leading-7 text-slate-600">
                                    The setup token is missing or incomplete. Open the full link from your most recent Porhaxali email, or request a new one.
                                </p>
                                <Link to="/#apply" className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
                                    Request a new setup link <ArrowRight size={18} aria-hidden="true" />
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={submitPassword} aria-busy={isSubmitting}>
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Secure your account</p>
                                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                                        <Check size={13} aria-hidden="true" /> Step 2
                                    </span>
                                </div>
                                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Create your password</h2>
                                <p className="mt-3 text-sm leading-6 text-slate-500">Choose a password you don’t use on another account.</p>

                                <fieldset disabled={isSubmitting} className="mt-8 space-y-5">
                                    <div>
                                        <label htmlFor="faculty-password" className="text-sm font-semibold text-slate-700">Password</label>
                                        <div className="relative">
                                            <input
                                                id="faculty-password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                required
                                                minLength={8}
                                                maxLength={100}
                                                value={password}
                                                onChange={updatePassword(setPassword)}
                                                className={INPUT_STYLE}
                                                aria-describedby="password-guidance"
                                            />
                                            <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 mt-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-600" aria-label={showPassword ? "Hide password" : "Show password"}>
                                                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="faculty-password-confirmation" className="text-sm font-semibold text-slate-700">Confirm password</label>
                                        <div className="relative">
                                            <input
                                                id="faculty-password-confirmation"
                                                type={showConfirmation ? "text" : "password"}
                                                autoComplete="new-password"
                                                required
                                                minLength={8}
                                                maxLength={100}
                                                value={confirmPassword}
                                                onChange={updatePassword(setConfirmPassword)}
                                                className={INPUT_STYLE}
                                            />
                                            <button type="button" onClick={() => setShowConfirmation((current) => !current)} className="absolute right-3 top-1/2 mt-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-600" aria-label={showConfirmation ? "Hide password confirmation" : "Show password confirmation"}>
                                                {showConfirmation ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                                            </button>
                                        </div>
                                    </div>
                                </fieldset>

                                <div id="password-guidance" className="mt-5 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                                    <p className={`flex items-center gap-2 ${passwordChecks.longEnough ? "text-emerald-700" : ""}`}>
                                        <Check size={14} aria-hidden="true" /> At least 8 characters
                                    </p>
                                    <p className={`flex items-center gap-2 ${passwordChecks.matches ? "text-emerald-700" : ""}`}>
                                        <Check size={14} aria-hidden="true" /> Passwords match
                                    </p>
                                </div>

                                {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm leading-6 text-rose-700">{error}</p>}

                                <button type="submit" disabled={isSubmitting} className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-60">
                                    {isSubmitting ? "Creating your account…" : "Create faculty account"}
                                    {isSubmitting ? <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
                                </button>
                                <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-slate-500">
                                    <LockKeyhole size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                                    Your setup link will be used after account creation.
                                </p>
                            </form>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default FacultyAccountSetup;
