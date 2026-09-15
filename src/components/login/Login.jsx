import {useState, useEffect} from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
//import { SlBookOpen } from "react-icons/sl";
import Label from "../pages/commom/Label";
import Input from "../pages/commom/Input";
import {VALID_EMAIL, VALID_PASSWORD} from "../pages/commom/ValidationConstants";
import { LOGIN } from "../../api/Urls";
import { BarLoader } from "react-spinners";
import Footer from "../pages/footer";
import Axios from "../../api/Axios";
import useAuth from '../Hooks/UseAuth';
import { GraduationCap, Mail, LockKeyhole,Eye, EyeClosed } from 'lucide-react';

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
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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
        setIsLoading(true);
        if (validEmail && validPassword ) {
            const data = {
                email: email,
                password: password,
            }
            try {  
                    const response = await Axios.post(LOGIN, data, { skipAuth: true });
                    console.log(response);
                    setIsLoading(false);
                    const jwtToken = response.data.data.accessToken ?? response.data.data.token;
                    const accessToken = jwtToken;
                    const refreshToken = response.data.data.refreshToken;
                    const userEmail = response.data.data.email;
                    const userName = response.data.data.name;
                    const userRole = response.data.data.role;
                    setAuth({accessToken, jwtToken, refreshToken, userEmail, userName, userRole})
                    //navigate(from, { replace: true });
                    //<Navigate to="/landing" state={{ from: location }} replace />
                    if(userRole === 'STUDENT') {
                        const currentAuth = await refreshCurrentUser(jwtToken, { accessToken, jwtToken, refreshToken });
                        const isProfileCompleted = currentAuth?.studentProfileCompletion?.profileCompleted;
                        navigate(isProfileCompleted ? '/dashboard' : '/profileSetting', { state: { from: location}, replace: true});
                    } else if(userRole === 'ADMIN') {
                        navigate('/adminDashboard', { state: { from: location}, replace: true});
                    }
                   
                    //navigate('/authPage');
                
            } catch (error) {
                console.log(error);
                console.log(error.response?.data);
                setIsVisible(true);
                setError(getErrorMessage(error))
                setIsLoading(false);
                //setRefershPage(false);
            }
        } else {
            setError("All fields are mandatory");
            setIsVisible(true);
            setIsLoading(false);
            }
    };

    return(
        <>
         {isLoading ? 
            <div className="flex items-center justify-center h-screen font-montserrat">
                <BarLoader 
                    color="#36d7b7" 
                    loading={isLoading} 
                    width={200}
                    aria-label="Loading Bar"
                />
        </div> : 
            <div className="flex h-screen items-center justify-center font-montserrat"> 
                <div className="flex flex-wrap grap-4 bg-white w-[30%] border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="w-full pl-4 pr-4 pt-4">
                        <div className="flex items-center gap-2 font-black text-2xl pb-4 border-b border-[rgba(244,87,128)]">
                        <GraduationCap className="h-8 w-8 -ml-3.5 text-[rgba(244,87,128)]" />
                            <span className="text-2xl font-bold tracking-tight text-gray-800">Porhaxali</span>
                            {isVisible && 
                            <span className="animate-disappear ml-7 p-2 bg-[rgba(244,87,128,5)] text-white shadow-lg text-xs font-bold">{error}</span>
                            }
                        </div>
                    </div>
                    <div className="relative w-full p-4">
                        <Label htmlFor="email" nameOfLabel="Email" validRule={validEmail} nameOfState={email} />
                        <Mail className="absolute left-6 top-14 -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                    <div className="relative w-full pl-4 pr-4">
                        <Label htmlFor="password" nameOfLabel="Password" validRule={validPassword} nameOfState={password} />
                        <LockKeyhole className="absolute left-6 top-10 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input id="password" value={password} autoComplete="off" type={showPassword ? "text" : "password"}
                            onChange={(e) => setPassword(e.target.value)}
                            aria_invalid={validPassword ? "false" : "true"}
                            aria_describedby="passwordNote"
                            onFocus={() => setPasswordFocus(true)}
                            onBlur={() => setPasswordFocus(false)}
                            focusValue={passwordFocus}
                            validValue={validPassword}
                            errorMesg="Follow the password policy rules"
                        />
                        <p className={`absolute right-6 top-10 -translate-y-1/2 cursor-pointer text-lg text-slate-400 transition hover:text-indigo-700`} onClick={handleShowPassword}>
                                {!showPassword ? <EyeClosed className="w-5 h-5" /> :
                                    <Eye className="w-5 h-5" />}
                        </p>
                    </div>
                    <div className="w-full p-4">
                        <Link to='/forgottenPassword' className="text-sm text-stone-600" >Forgotten password ?</Link>
                        <Link to="/" className="text-sm text-stone-600 float-right">Back to Home page</Link>
                    </div>
                    <div className="w-full pl-4 pr-4 pb-4">
                        <button 
                            className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer" onClick={handleLogin}>
                                Login
                        </button>
                    </div>
                </div>
            </div>
            }
            <Footer/>
        </>
    );
}   

export default Login;
