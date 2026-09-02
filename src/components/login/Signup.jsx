import React, {useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { SlBookOpen } from "react-icons/sl";
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
                
                    const response = await Axios.post(REGISTER, data);
                    console.log(response);
                    setOpenVerifyOtp(true);
                    setIsLoading(false);
                
            } catch (error) {
                console.log(error.response.data);
                setIsVisible(true);
                setError(error.response.data.message)
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
         {isLoading ? <div className="flex items-center justify-center h-screen">
                {/* <CircleLoader color={'#D0021B'} loading={isLoading} size={100} /> */}
                <BarLoader 
        color="#36d7b7" 
        loading={isLoading} 
        width={200}
        aria-label="Loading Bar"
      />
            </div> :
           <div className="flex h-screen items-center justify-center"> 
                <div className="flex flex-wrap grap-4 bg-[#fef5f7] w-[30%] rounded-[5px]">
                    <div className="w-full pl-4 pr-4 pt-4">
                        <div className="text-[rgba(244,87,128)] flex items-center gap-2 font-black text-2xl pb-4 border-b border-[rgba(244,87,128)]">
                            <span><SlBookOpen/></span>
                            <span>Porhaxali</span>
                            {isVisible && 
                            <span className="animate-disappear ml-7 p-2 bg-[rgba(244,87,128,5)] text-white shadow-lg text-xs font-bold">{error}</span>
                            }
                            
                        </div>
                    </div>

                    {openVerifyOtp ? 
                    <>
                    <VerifyOtp userEmail={email} setIsLoading={setIsLoading} setIsVisible={setIsVisible} setError={setError}/>
                    </> :
                    // <div className="w-full animate-rotate-border rounded-lg bg-conic/[from_var(--border-angle)] from-[#ff0080] via-[#7928ca] to-[#ff0080] from-80% via-90% to-100% p-px">
                    //     <div className="p-10 rounded-lg bg-black">Assam</div>
                    <>
                    <div className="w-full p-4">
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
                    <div className="w-full pl-4 pr-4">
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
                    <div className="w-full pl-4 pr-4 pt-4">
                        <Label htmlFor="password" nameOfLabel="Password" validRule={validPassword} nameOfState={password} />
                        <div className="flex items-center justify-between">
                        <Input id="password" value={password} autoComplete="off" type={showPassword ? "text" : "password"}
                            onChange={(e) => setPassword(e.target.value)}
                            aria_invalid={validPassword ? "false" : "true"}
                            aria_describedby="passwordNote"
                            onFocus={() => setPasswordFocus(true)}
                            onBlur={() => setPasswordFocus(false)}
                            focusValue={passwordFocus}
                            validValue={validPassword}  
                        />
                        
                        <p className={`ml-[-4vh] pr-2 text-xl cursor-pointer hover:text-orange-400 duration-300`} onClick={handleShowPassword}>
                                {!showPassword ? <FaEyeSlash /> :
                                    <FaEye />}
                        </p>
                            </div>
                            <p id="passwordNote" className={passwordFocus && !validPassword
                        ? "text-red-400 duration-300" : "hidden duration-300"}>
                       <span className="flex flex-wrap text-sm">
                       <FaInfoCircle />One special, one Caps, one number and in total 8 or more characters
                        Letters, numbers, underscores, hyphens allowed.
                       </span>
                    </p>
                    </div>
                    <div className="w-full pt-4 pl-4 pr-4">
                        <Label htmlFor="confirmPassword" nameOfLabel="Confirm Password"  validRule={validConfirmPassword} nameOfState={confirmPassword}/>
                        <Input id="confirmPassword" value={confirmPassword} autoComplete="off" type="text"
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
                    <div className="w-full p-4">
                        <Link to="/" className="text-sm text-stone-600">Back to Home page</Link>
                    </div>
                    <div className="w-full pl-4 pr-4 pb-4">
                        <button 
                            className="text-sm border border-[rgba(244,87,128)] cursor-pointer
                            hover:text-white hover:bg-[rgba(244,87,128,1)]
                            text-stone-600 px-2.5 py-1.5 rounded-[5px]" onClick={handleSignUp}>
                                Submit
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