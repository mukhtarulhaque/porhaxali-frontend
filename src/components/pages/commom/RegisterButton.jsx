import { Link } from 'react-router-dom';

const RegisterButton = () => {
    return(
        <>
            <Link className="rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-700/20 transition-colors hover:bg-indigo-800" to="/register">Sign Up</Link>
        </>
    )
}

export default RegisterButton
