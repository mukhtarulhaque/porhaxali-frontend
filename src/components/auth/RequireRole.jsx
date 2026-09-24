import { Link, Outlet } from 'react-router-dom';
import UseAuth from '../Hooks/UseAuth';

export default function RequireRole({ role }) {
    const { auth } = UseAuth();
    const allowedRoles = Array.isArray(role) ? role : [role];

    if (allowedRoles.includes(auth?.userRole)) return <Outlet />;

    return <main className="mx-auto max-w-lg p-8 text-center font-montserrat">
        <h1 className="text-2xl font-bold text-slate-900">Access restricted</h1>
        <p className="my-4 text-slate-600">You do not have permission to view this page.</p>
        <Link className="font-semibold text-emerald-700 underline" to="/authUser">Return to your dashboard</Link>
    </main>;
}
