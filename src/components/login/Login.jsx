// import {useState, useEffect} from "react";
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import Label from "../pages/commom/Label";
// import Input from "../pages/commom/Input";
// import {VALID_EMAIL, VALID_PASSWORD} from "../pages/commom/ValidationConstants";
// import { LOGIN } from "../../api/Urls";
// import { BarLoader } from "react-spinners";
// import Footer from "../pages/footer";
// import Axios from "../../api/Axios";
// import useAuth from '../Hooks/UseAuth';
// import { GraduationCap, Mail, LockKeyhole,Eye, EyeClosed } from 'lucide-react';

// const Login = () => {
//     const { setAuth, refreshCurrentUser } = useAuth();

//     const navigate = useNavigate();
//     const location = useLocation();
//     const [email, setEmail] = useState('');
//     const [emailFocus, setEmailFocus] = useState(false);

//     const [password, setPassword] = useState('');
//     const [passwordFocus, setPasswordFocus] = useState(false);

//     const [isVisible, setIsVisible] = useState(false);
//     const [error, setError] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const handleShowPassword = () => {
//         setShowPassword(!showPassword);
//     }

//     const getErrorMessage = (error) => {
//         return error.response?.data?.message ?? "Login failed. Please try again.";
//     };

//     const validEmail = VALID_EMAIL.test(email);
//     const validPassword = VALID_PASSWORD.test(password);

//     useEffect(() => {
//         const timer = setTimeout(() => {
//           setIsVisible(false);
//         }, 3000);
//         return () => clearTimeout(timer);
//       }, [isVisible]);

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         if (validEmail && validPassword ) {
//             const data = {
//                 email: email,
//                 password: password,
//             }
//             try {  
//                     const response = await Axios.post(LOGIN, data, { skipAuth: true });
//                     console.log(response);
//                     setIsLoading(false);
//                     const jwtToken = response.data.data.accessToken ?? response.data.data.token;
//                     const accessToken = jwtToken;
//                     const refreshToken = response.data.data.refreshToken;
//                     const userEmail = response.data.data.email;
//                     const userName = response.data.data.name;
//                     const userRole = response.data.data.role;
//                     setAuth({accessToken, jwtToken, refreshToken, userEmail, userName, userRole})
//                     //navigate(from, { replace: true });
//                     //<Navigate to="/landing" state={{ from: location }} replace />
//                     if(userRole === 'STUDENT') {
//                         const currentAuth = await refreshCurrentUser(jwtToken, { accessToken, jwtToken, refreshToken });
//                         const isProfileCompleted = currentAuth?.studentProfileCompletion?.profileCompleted;
//                         navigate(isProfileCompleted ? '/dashboard' : '/profileSetting', { state: { from: location}, replace: true});
//                     } else if(userRole === 'ADMIN') {
//                         navigate('/adminDashboard', { state: { from: location}, replace: true});
//                     }
                   
//                     //navigate('/authPage');
                
//             } catch (error) {
//                 console.log(error);
//                 console.log(error.response?.data);
//                 setIsVisible(true);
//                 setError(getErrorMessage(error))
//                 setIsLoading(false);
//                 //setRefershPage(false);
//             }
//         } else {
//             setError("All fields are mandatory");
//             setIsVisible(true);
//             setIsLoading(false);
//             }
//     };

//     return(
//         <>
//          {isLoading ? 
//             <div className="flex items-center justify-center h-screen font-montserrat">
//                 <BarLoader 
//                     color="#36d7b7" 
//                     loading={isLoading} 
//                     width={200}
//                     aria-label="Loading Bar"
//                 />
//         </div> : 
//             <div className="flex h-screen items-center justify-center font-montserrat"> 
//                 <div className="flex flex-wrap grap-4 bg-white w-[30%] border border-gray-200 rounded-2xl p-6 shadow-sm">
//                     <div className="w-full pl-4 pr-4 pt-4">
//                         <div className="flex items-center gap-2 font-black text-2xl pb-4 border-b border-[rgba(244,87,128)]">
//                         <GraduationCap className="h-8 w-8 -ml-3.5 text-[rgba(244,87,128)]" />
//                             <span className="text-2xl font-bold tracking-tight text-gray-800">Porhaxali</span>
//                             {isVisible && 
//                             <span className="animate-disappear ml-7 p-2 bg-[rgba(244,87,128,5)] text-white shadow-lg text-xs font-bold">{error}</span>
//                             }
//                         </div>
//                     </div>
//                     <div className="relative w-full p-4">
//                         <Label htmlFor="email" nameOfLabel="Email" validRule={validEmail} nameOfState={email} />
//                         <Mail className="absolute left-6 top-14 -translate-y-1/2 text-gray-400 w-5 h-5" />
//                         <Input id="email" value={email} autoComplete="off" type="email"
//                             onChange={(e) => setEmail(e.target.value)}
//                             aria_invalid={validEmail ? "false" : "true"}
//                             aria_describedby="emailNote"
//                             onFocus={() => setEmailFocus(true)}
//                             onBlur={() => setEmailFocus(false)}
//                             focusValue={emailFocus}
//                             validValue={validEmail}
//                             errorMesg="It should be a valid Email"
//                         />
//                     </div>
//                     <div className="relative w-full pl-4 pr-4">
//                         <Label htmlFor="password" nameOfLabel="Password" validRule={validPassword} nameOfState={password} />
//                         <LockKeyhole className="absolute left-6 top-10 -translate-y-1/2 text-gray-400 w-5 h-5" />
//                         <Input id="password" value={password} autoComplete="off" type={showPassword ? "text" : "password"}
//                             onChange={(e) => setPassword(e.target.value)}
//                             aria_invalid={validPassword ? "false" : "true"}
//                             aria_describedby="passwordNote"
//                             onFocus={() => setPasswordFocus(true)}
//                             onBlur={() => setPasswordFocus(false)}
//                             focusValue={passwordFocus}
//                             validValue={validPassword}
//                             errorMesg="Follow the password policy rules"
//                         />
//                         <p className={`absolute right-6 top-10 -translate-y-1/2 cursor-pointer text-lg text-slate-400 transition hover:text-indigo-700`} onClick={handleShowPassword}>
//                                 {!showPassword ? <EyeClosed className="w-5 h-5" /> :
//                                     <Eye className="w-5 h-5" />}
//                         </p>
//                     </div>
//                     <div className="w-full p-4">
//                         <Link to='/forgottenPassword' className="text-sm text-stone-600" >Forgotten password ?</Link>
//                         <Link to="/" className="text-sm text-stone-600 float-right">Back to Home page</Link>
//                     </div>
//                     <div className="w-full pl-4 pr-4 pb-4">
//                         <button 
//                             className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer" onClick={handleLogin}>
//                                 Login
//                         </button>
//                     </div>
//                 </div>
//             </div>
//             }
//             <Footer/>
//         </>
//     );
// }   

// export default Login;
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    ArrowRight,
    Eye,
    EyeOff,
    GraduationCap,
    Home,
    LoaderCircle,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";
import Axios from "../../api/Axios";
import {VALID_EMAIL, VALID_PASSWORD} from "../pages/commom/ValidationConstants";
import useAuth from '../Hooks/UseAuth';
import { LOGIN } from "../../api/Urls";
import Label from "../pages/commom/Label";
import Input from "../pages/commom/Input";
import Footer from "../pages/footer";

const Login = () => {
    const { setAuth, refreshCurrentUser } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [emailFocus, setEmailFocus] = useState(false);

    const [password, setPassword] = useState('');
    const [passwordFocus, setPasswordFocus] = useState(false);

    const [isVisible, setIsVisible] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const getErrorMessage = (error) => {
        return error.response?.data?.message ?? "Login failed. Please try again.";
    };

    const validEmail = VALID_EMAIL.test(email);
    const validPassword = VALID_PASSWORD.test(password);

    useEffect(() => {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
        return () => clearTimeout(timer);
      }, [isVisible]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (validEmail && validPassword ) {
            const data = {
                email: email,
                password: password,
            }
            try {  
                    const response = await Axios.post(LOGIN, data, { skipAuth: true });
                    console.log(response);
                    setIsSubmitting(false);
                    const jwtToken = response.data.data.accessToken ?? response.data.data.token;
                    const accessToken = jwtToken;
                    const refreshToken = response.data.data.refreshToken;
                    const userEmail = response.data.data.email;
                    const userName = response.data.data.name;
                    const userRole = response.data.data.role;
                    const phone = response.data.data.phone;
                    setAuth({accessToken, jwtToken, refreshToken, userEmail, userName, userRole, phone})
                    //navigate(from, { replace: true });
                    //<Navigate to="/landing" state={{ from: location }} replace />
                    if(userRole === 'STUDENT') {
                        const currentAuth = await refreshCurrentUser(jwtToken, { accessToken, jwtToken, refreshToken });
                        const isProfileCompleted = currentAuth?.studentProfileCompletion?.profileCompleted;
                        navigate(isProfileCompleted ? '/dashboard' : '/profileSetting', { state: { from: location}, replace: true});
                    } else if(userRole === 'ADMIN') {
                        navigate('/adminDashboard', { state: { from: location}, replace: true});
                    } else if(userRole === 'INSTRUCTOR_APPLICANT') {
                        navigate('/completeFacultyApplication', { state: { from: location}, replace: true});
                    } else if(userRole === 'INSTRUCTOR') {
                        navigate('/facultyDashboard', { state: { from: location}, replace: true});
                    }
                   
                    //navigate('/authPage');
                
            } catch (error) {
                console.log(error);
                console.log(error.response?.data);
                setIsVisible(true);
                setError(getErrorMessage(error))
                setIsSubmitting(false);
                //setRefershPage(false);
            }
        } else {
            setError("All fields are mandatory");
            setIsVisible(true);
            setIsSubmitting(false);
            }
    };
    return (
    <>
        <main className="min-h-screen bg-gray-200 px-5 py-8 font-montserrat text-slate-900 sm:px-8 lg:flex lg:items-center lg:py-12">
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
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Login</p>
                            <h1 className="mt-5 max-w-md text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                                One last step before your journey begins.
                            </h1>
                            <p className="mt-5 max-w-md text-sm leading-7 text-emerald-50/75">
                                Create a secure password for your account. You’ll use your email and this password to sign in.
                            </p>
                            <div className="mt-9 flex items-center gap-3 text-sm font-semibold text-emerald-50">
                                <ShieldCheck size={20} className="text-emerald-300" aria-hidden="true" />
                                Ready to go.
                            </div>
                        </div>
                        <p className="text-xs leading-5 text-emerald-100/55">
                            Text here if we need
                        </p>
                    </div>
                </section>
                <section className="flex items-center px-7 py-10 sm:px-12 sm:py-14 lg:px-16">
                    <div className="w-full">
                            <form onSubmit={handleLogin} aria-busy={isSubmitting}>
                                <fieldset disabled={isSubmitting} className="mt-8 space-y-5">
                                    <div className="relative">
                                        <Label htmlFor="email" nameOfLabel="Email" validRule={validEmail} nameOfState={email} />
                                        <Input id="email" value={email} autoComplete="off" type="email"
                                            onChange={(e) => setEmail(e.target.value)}
                                            aria_invalid={validEmail ? "false" : "true"}
                                            aria_describedby="emailNote"
                                            onFocus={() => setEmailFocus(true)}
                                            onBlur={() => setEmailFocus(false)}
                                            focusValue={emailFocus}
                                            validValue={validEmail}
                                            errorMesg="It should be a valid Email"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Label htmlFor="password" nameOfLabel="Password" validRule={validPassword} nameOfState={password} />
                                        <Input id="password" value={password} autoComplete="off" type={showPassword ? "text" : "password"}
                                            onChange={(e) => setPassword(e.target.value)}
                                            aria_invalid={validPassword ? "false" : "true"}
                                            aria_describedby="passwordNote"
                                            onFocus={() => setPasswordFocus(true)}
                                            onBlur={() => setPasswordFocus(false)}
                                            focusValue={passwordFocus}
                                            validValue={validPassword}
                                            errorMesg="Follow the password policy"
                                        />
                                        <p className={`absolute right-6 top-14 -translate-y-1/2 cursor-pointer text-lg text-slate-400 transition hover:text-indigo-700`} onClick={handleShowPassword}>
                                            {!showPassword ? <EyeOff className="w-5 h-5" /> :
                                                <Eye className="w-5 h-5" />}
                                        </p>
                                    </div>
                                </fieldset>

                                {/* <div id="password-guidance" className="mt-5 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                                    <p className={`flex items-center gap-2 ${passwordChecks.lessEnough ? "text-emerald-700" : ""}`}>
                                        <Check size={14} aria-hidden="true" /> Password at least 8 characters long.
                                    </p>
                                    <p className={`flex items-center gap-2 ${passwordChecks.matches ? "text-emerald-700" : ""}`}>
                                        <Check size={14} aria-hidden="true" /> Passwords match
                                    </p>
                                </div> */}

                                {isVisible && error && <p role="alert" className="animate-disappear mt-5 rounded-xl bg-rose-50 p-4 text-sm leading-6 text-rose-700">{error}</p>}

                                <button type="submit" disabled={isSubmitting} className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-60 hover:cursor-pointer">
                                    {isSubmitting ? "Login…" : "Login"}
                                    {isSubmitting ? <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
                                </button>
                                <div className="mt-4 flex items-start justify-center gap-9 text-center text-xs leading-5 text-slate-500">
                                    <div className="flex items-start gap-2 hover:text-slate-950">
                                        <LockKeyhole size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                                        <Link to='/forgottenPassword' className="" >Forgotten password ?</Link>
                                    </div>
                                    <div className="flex items-start gap-2 hover:text-slate-950">
                                        <Home size={14} className="mt-0.5 shrink-0" aria-hidden="true"/>
                                        <Link to="/" className="">Back to Home page</Link>
                                    </div>
                                </div>
                            </form>
                       
                    </div>
                </section>
            </div>
        </main>
        <Footer/>
        </>
    );
};

export default Login;

