import { useState } from 'react';
import { GraduationCap, KeyRound, LockKeyhole, Mail } from 'lucide-react';
import {
    requestDevelopmentAccessOtp,
    verifyDevelopmentAccessOtp,
} from '../../api/DevelopmentAccess';
import { VALID_EMAIL, VALID_OTP } from '../pages/commom/ValidationConstants';
import { useDevelopmentAccess } from '../context/DevelopmentAccessContext';
import OtpInput from './OtpInput';

const connectionError = 'Unable to connect to the server. Please try again.';

const getErrorMessage = (error, fallback) => {
    if (!error?.response) {
        return connectionError;
    }
    return error.response.data?.message ?? fallback;
};

const DevelopmentAccessPage = () => {
    const { refreshStatus } = useDevelopmentAccess();
    const [stage, setStage] = useState('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);

    const validEmail = VALID_EMAIL.test(email.trim());
    const validOtp = VALID_OTP.test(otp);

    const requestOtp = async (event) => {
        event?.preventDefault();
        setEmailTouched(true);
        setError('');
        setNotice('');
        if (!validEmail) {
            return;
        }
        setSubmitting(true);
        try {
            await requestDevelopmentAccessOtp(email.trim());
            setOtp('');
            setStage('otp');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to request an access code. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    const verifyOtp = async (event) => {
        event.preventDefault();
        setError('');
        setNotice('');
        if (!validOtp) {
            return;
        }
        setSubmitting(true);
        try {
            await verifyDevelopmentAccessOtp(otp);
            const authorized = await refreshStatus({ showLoading: false });
            if (!authorized) {
                setError('Development access could not be confirmed. Please request a new code.');
            }
        } catch (verificationError) {
            setError(getErrorMessage(verificationError, 'The verification code is incorrect.'));
        } finally {
            setSubmitting(false);
        }
    };

    const resendOtp = async () => {
        setError('');
        setNotice('');
        setSubmitting(true);
        try {
            await requestDevelopmentAccessOtp(email.trim());
            setOtp('');
            setNotice('A new access code has been sent.');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to resend the access code. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    const changeEmail = () => {
        setStage('email');
        setOtp('');
        setError('');
        setNotice('');
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-5 py-10 font-montserrat text-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.35),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.22),transparent_34%)]" aria-hidden="true" />
            <div className="absolute left-[10%] top-[12%] h-44 w-44 rounded-full border border-white/10" aria-hidden="true" />
            <div className="absolute bottom-[8%] right-[8%] h-64 w-64 rounded-full border border-white/10" aria-hidden="true" />

            <section className="relative w-full max-w-md rounded-3xl border border-white/15 bg-white p-7 shadow-2xl shadow-black/40 sm:p-10" aria-labelledby="development-access-title">
                <div className="flex items-center justify-center gap-2 text-indigo-700">
                    <GraduationCap size={34} aria-hidden="true" />
                    <span className="text-2xl font-black tracking-tight">Porhaxali</span>
                </div>

                <div className="mt-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                        {stage === 'email' ? <LockKeyhole size={23} aria-hidden="true" /> : <KeyRound size={23} aria-hidden="true" />}
                    </div>
                    <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-rose-600">Private preview</p>
                    <h1 id="development-access-title" className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                        {stage === 'email' ? 'Website Under Development' : 'Verification Code'}
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        {stage === 'email'
                            ? 'This version of Porhaxali is currently restricted to authorized users.'
                            : 'A six-digit access code has been sent to the authorized email address.'}
                    </p>
                </div>

                {stage === 'email' ? (
                    <form className="mt-8" noValidate onSubmit={requestOtp}>
                        <label className="block text-sm font-bold text-slate-700" htmlFor="development-access-email">
                            Email Address
                        </label>
                        <div className="relative mt-2">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} aria-hidden="true" />
                            <input
                                id="development-access-email"
                                autoComplete="email"
                                autoFocus
                                className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                disabled={submitting}
                                placeholder="you@example.com"
                                type="email"
                                value={email}
                                onBlur={() => setEmailTouched(true)}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>
                        {emailTouched && !validEmail && (
                            <p className="mt-2 text-sm text-rose-700">Enter a valid email address.</p>
                        )}
                        <button
                            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-indigo-700 px-5 text-sm font-extrabold text-white shadow-lg shadow-indigo-700/20 transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-55"
                            disabled={!validEmail || submitting}
                            type="submit"
                        >
                            {submitting ? 'Sending code…' : 'Continue'}
                        </button>
                    </form>
                ) : (
                    <form className="mt-8" onSubmit={verifyOtp}>
                        <OtpInput value={otp} onChange={setOtp} disabled={submitting} />
                        <button
                            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-indigo-700 px-5 text-sm font-extrabold text-white shadow-lg shadow-indigo-700/20 transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-55"
                            disabled={!validOtp || submitting}
                            type="submit"
                        >
                            {submitting ? 'Verifying…' : 'Verify'}
                        </button>
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
                            <button className="font-bold text-indigo-700 hover:text-indigo-900 disabled:opacity-50" disabled={submitting} type="button" onClick={resendOtp}>
                                Resend code
                            </button>
                            <span className="text-slate-300" aria-hidden="true">•</span>
                            <button className="font-semibold text-slate-600 hover:text-slate-950 disabled:opacity-50" disabled={submitting} type="button" onClick={changeEmail}>
                                Change email
                            </button>
                        </div>
                    </form>
                )}

                {notice && <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
                {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{error}</p>}

                <p className="mt-8 text-center text-xs leading-5 text-slate-400">
                    Development access only. Normal Porhaxali sign-in is still required inside.
                </p>
            </section>
        </main>
    );
};

export default DevelopmentAccessPage;
