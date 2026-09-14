import { Link } from "react-router-dom";

const LoginButton = () => {
    return(
        <>
            {/* <Link className="bg-[rgba(244,87,128)] hover:bg-[#f23366] py-1.5 px-4 text-white text-sm rounded-[5px]" to="/login">Login</Link> */}
            <Link className="text-sm font-bold px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" to="/login">Login</Link>
        </>
    );
}

export default LoginButton;
