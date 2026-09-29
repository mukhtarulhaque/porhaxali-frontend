import { GraduationCap } from 'lucide-react';
import { useDevelopmentAccess } from '../context/DevelopmentAccessContext';
import DevelopmentAccessPage from './DevelopmentAccessPage';

const FullScreenShell = ({ children }) => (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 font-montserrat text-white">
        <section className="w-full max-w-md text-center">
            <div className="mx-auto flex w-fit items-center gap-2 text-indigo-300">
                <GraduationCap size={34} aria-hidden="true" />
                <span className="text-2xl font-black tracking-tight text-white">Porhaxali</span>
            </div>
            {children}
        </section>
    </main>
);

const DevelopmentAccessGate = ({ children }) => {
    const { authorized, refreshStatus, status } = useDevelopmentAccess();

    if (status === 'checking') {
        return (
            <FullScreenShell>
                <div className="mx-auto mt-8 h-9 w-9 animate-spin rounded-full border-3 border-white/20 border-t-indigo-300" role="status" aria-label="Checking development access" />
                <p className="mt-5 text-sm text-slate-300">Checking development access…</p>
            </FullScreenShell>
        );
    }

    if (status === 'error') {
        return (
            <FullScreenShell>
                <h1 className="mt-8 text-2xl font-black">Unable to verify development access.</h1>
                <p className="mt-3 text-sm leading-6 text-slate-300">The server could not be reached. The application remains protected.</p>
                <button
                    className="mt-7 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-indigo-50"
                    type="button"
                    onClick={() => refreshStatus()}
                >
                    Try Again
                </button>
            </FullScreenShell>
        );
    }

    if (!authorized) {
        return <DevelopmentAccessPage />;
    }

    return children;
};

export default DevelopmentAccessGate;
