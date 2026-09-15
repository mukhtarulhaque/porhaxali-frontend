import {useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { GraduationCap } from "lucide-react";
import Label from "../pages/commom/Label";
import Input from "../pages/commom/Input";
import {VALID_NAME, VALID_EMAIL, VALID_PASSWORD} from "../pages/commom/ValidationConstants";
import Footer from "../pages/footer";
import Axios from "../../api/Axios";
import { REGISTER } from "../../api/Urls";
import { FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
//import { CircleLoader } from "react-spinners";
import VerifyOtp from "./VerifyOtp";
import { BarLoader } from "react-spinners";



const Signup = () => {


    const [fullName, setFullName] = useState('');
    const [fullNameFocus, setFullNameFocus] = useState(false);
    const [validFullName, setValidFullName] = useState(false);

    const [email, setEmail] = useState('');
    const [emailFocus, setEmailFocus] = useState(false);
    const [validEmail, setValidEmail] = useState(false);

    const [password, setPassword] = useState('');
    const [passwordFocus, setPasswordFocus] = useState(false);
    const [validPassword, setValidPassword] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
    const [validConfirmPassword, setValidConfirmPassword] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [openVerifyOtp, setOpenVerifyOtp] = useState(false);
    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const getErrorMessage = (error) => {
        return error.response?.data?.message ?? "Sign up failed. Please try again.";
    };


    useEffect(()=>{
        const result = VALID_NAME.test(fullName);
        setValidFullName(result);
    },[fullName]);
    useEffect(()=>{
        const result = VALID_EMAIL.test(email);
        setValidEmail(result);
    },[email]);
    useEffect(()=>{
        const result = VALID_PASSWORD.test(password);
        setValidPassword(result);
    },[password]);

    useEffect(() => {
        // 2. Set a timer to hide the text after 3000ms (3 seconds)
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
    
        // 3. Always clear the timeout to prevent memory leaks
        return () => clearTimeout(timer);
      }, [isVisible]);

     
        const handleConfirmPasswordChange = (value) => {
            setConfirmPassword(value)
            if(value === password){
             setValidConfirmPassword(true);
            }
             else {
                 setValidConfirmPassword(false);
             }
             
         };
         
    const handleSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (validFullName && validEmail && validPassword && validConfirmPassword) {

            const data = {
                fullName: fullName,
                email: email,
                password: password,
                role: "STUDENT",
                //role: "ADMIN",
            }
            try {
                
                    const response = await Axios.post(REGISTER, data, { skipAuth: true });
                    console.log(response);
                    setOpenVerifyOtp(true);
                    setIsLoading(false);
                
            } catch (error) {
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
    return (
        <>
         {isLoading ? <div className="flex h-screen items-center justify-center bg-slate-50">
                {/* <CircleLoader color={'#D0021B'} loading={isLoading} size={100} /> */}
                <BarLoader 
        color="#4338ca" 
        loading={isLoading} 
        width={200}
        aria-label="Loading Bar"
      />
            </div> :
           <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 font-montserrat text-slate-900"> 
                <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-indigo-950/10">
                    <div className="w-full px-6 pt-6">
                        <div className="">
                            <div className="flex items-center gap-2 text-3xl font-black text-slate-950 pb-2">
                                <GraduationCap className="h-10 w-10 text-indigo-700"/>
                                <h1 className="">Porhaxali</h1>
                            </div>
                            <h1 className="pt-2 text-xl font-black tracking-tight text-slate-950">Create your account</h1>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">Join live classes, notes, and guided learning tracks in one place.</p>
                            {isVisible && 
                            error && <div className="animate-disappear mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 shadow-sm">{error}</div>
                            }
                        </div>
                    </div>

                    {openVerifyOtp ? 
                    <>
                    <VerifyOtp userEmail={email} setIsLoading={setIsLoading} setIsVisible={setIsVisible} setError={setError}/>
                    </> :
                    <>
                    <div className="w-full px-6 pt-6">
                        <Label htmlFor="fullName" nameOfLabel="Full Name" validRule={validFullName} nameOfState={fullName} />
                        <Input id="fullName" value={fullName} autoComplete="off" type="text"
                            onChange={(e) => setFullName(e.target.value)}
                            aria_invalid={validFullName ? "false" : "true"}
                            aria_describedby="fullNameNote"
                            onFocus={() => setFullNameFocus(true)}
                            onBlur={() => setFullNameFocus(false)}
                            focusValue={fullNameFocus}
                            validValue={validFullName}
                            errorMesg="No alphenumeric or special characters are allowed"
                        />
                    </div>
                    <div className="w-full px-6 pt-4">
                        <Label htmlFor="email" nameOfLabel="Email" validRule={validEmail} nameOfState={email} />
                        <Input id="email" value={email} autoComplete="off" type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            aria_invalid={validEmail ? "false" : "true"}
                            aria_describedby="emailNote"
                            onFocus={() => setEmailFocus(true)}
                            onBlur={() => setEmailFocus(false)}
                            focusValue={emailFocus}
                            validValue={validEmail}
                            errorMesg="Valid email please"
                        />
                    </div>
                    <div className="w-full px-6 pt-4">
                        <Label htmlFor="password" nameOfLabel="Password" validRule={validPassword} nameOfState={password} />
                        <div className="relative">
                        <Input id="password" value={password} autoComplete="off" type={showPassword ? "text" : "password"}
                            onChange={(e) => setPassword(e.target.value)}
                            aria_invalid={validPassword ? "false" : "true"}
                            aria_describedby="passwordNote"
                            onFocus={() => setPasswordFocus(true)}
                            onBlur={() => setPasswordFocus(false)}
                            focusValue={passwordFocus}
                            validValue={validPassword}  
                        />
                        
                        <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-lg text-slate-400 transition hover:text-indigo-700" onClick={handleShowPassword}>
                                {!showPassword ? <FaEyeSlash /> :
                                    <FaEye />}
                        </button>
                            </div>
                            <p id="passwordNote" className={passwordFocus && !validPassword
                        ? "mt-1.5 text-rose-600 duration-300" : "hidden duration-300"}>
                       <span className="flex flex-wrap items-center gap-1 text-xs font-medium">
                       <FaInfoCircle />One special, one Caps, one number and in total 8 or more characters
                        Letters, numbers, underscores, hyphens allowed.
                       </span>
                    </p>
                    </div>
                    <div className="w-full px-6 pt-4">
                        <Label htmlFor="confirmPassword" nameOfLabel="Confirm Password"  validRule={validConfirmPassword} nameOfState={confirmPassword}/>
                        <Input id="confirmPassword" value={confirmPassword} autoComplete="off" type={showPassword ? "text" : "password"}
                            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                            aria_invalid={validConfirmPassword ? "false" : "true"}
                            aria_describedby="confirmPasswordNote"
                            onFocus={() => setConfirmPasswordFocus(true)}
                            onBlur={() => setConfirmPasswordFocus(false)}
                            focusValue={confirmPasswordFocus}
                            validValue={validConfirmPassword}
                            errorMesg="Password not Match"
                           
                        />
                    </div>
                    <div className="w-full px-6 pt-5">
                        <Link to="/" className="text-sm font-semibold text-slate-500 transition hover:text-indigo-700">Back to Home page</Link>
                    </div>
                    <div className="w-full px-6 pb-6 pt-4">
                        <button 
                            className="w-full cursor-pointer rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-700/20 transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60" onClick={handleSignUp}>
                                Create Account
                        </button>
                    </div>
                    </>
                    }
                    
                </div>
            </div>
}

            <Footer/>
        </>
    );
}

export default Signup;
