import {useState, useEffect, useRef} from "react";
import { useNavigate, useLocation } from 'react-router-dom';
//import { VALID_OTP } from "../pages/commom/ValidationConstants";
import { VERIFYOTP,RESENDOTP } from "../../api/Urls";
import Axios from "../../api/Axios";
import useAuth from '../Hooks/UseAuth';
//import { CircleLoader } from "react-spinners";
// import Label from "../pages/commom/Label";
// import Input from "../pages/commom/Input";

const VerifyOtp = ({userEmail, setIsLoading, setIsVisible, setError}) => {

   

    // const [verifyOtp, setVerifyOtp] = useState('');
    // const [verifyOtpFocus, setVerifyOtpFocus] = useState(false);
    // const [validVerifyOtp, setValidVerifyOtp] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { setAuth, refreshCurrentUser } = useAuth();

    const [otp, setOtp] = useState(new Array(6).fill(""));
    const inputRefs = useRef([]);
    
    const handleChange = (element, index) => {
        const value = element.value;
        if (isNaN(Number(value))) return; // Allow numeric values only
    
        const newOtp = [...otp];
        // Take only the last character if multiple are entered
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
    
        // Focus on the next input box if a number was typed
        if (value && index < 5) {
          inputRefs.current[index + 1].focus();
        }
      };
      const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
          if (!otp[index] && index > 0) {
            // If current field is already empty, clear the previous field and focus it
            const newOtp = [...otp];
            newOtp[index - 1] = "";
            setOtp(newOtp);
            inputRefs.current[index - 1].focus();
          } else {
            // Clear the current field
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
          }
        } else if (e.key === "ArrowLeft" && index > 0) {
          inputRefs.current[index - 1].focus();
        } else if (e.key === "ArrowRight" && index < 5) {
          inputRefs.current[index + 1].focus();
        }
      };
      const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").trim();
        
        // Check if the pasted string is numeric and exactly 6 digits
        if (/^\d{6}$/.test(pasteData)) {
          const pasteArray = pasteData.split("");
          setOtp(pasteArray);
          // Place focus on the very last box
          inputRefs.current[5].focus();
        }
      };

    const [seconds, setSeconds] = useState(60);
    useEffect(() => {
        // Exit if the timer hits 0
        if (seconds <= 0) return;
    
        // Set up a 1-second interval
        const intervalId = setInterval(() => {
          setSeconds((prevSeconds) => prevSeconds - 1);
        }, 1000);
    
        // Clean up the interval on unmount or state change
        return () => clearInterval(intervalId);
      }, [seconds]);

    // useEffect(()=>{
    //     const result = VALID_OTP.test(verifyOtp);
    //     setValidVerifyOtp(result);
    // },[verifyOtp]);

    const handleSubmitOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const finalOtp = otp.join("");
        if (finalOtp) {

            const data = {
                email: userEmail,
                otp: finalOtp,
            }
        try {
            
                const response = await Axios.post(VERIFYOTP, data);
                const jwtToken = response.data.data.token; 
                const userEmail = response.data.data.email;
                const userName = response.data.data.name;
                const userRole = response.data.data.role;
                setAuth({jwtToken,userEmail, userName, userRole})
                console.log(response);
                if (response.data.data.role === "ADMIN") {
                    setIsLoading(false);
                    navigate('/adminDashboard',{ state: { from: location}, replace: true });
                  } else {
                    const currentAuth = await refreshCurrentUser(jwtToken);
                    const isProfileCompleted = currentAuth?.studentProfileCompletion?.profileCompleted;
                    setIsLoading(false);
                    navigate(isProfileCompleted ? '/dashboard' : '/profileSetting',{ state: { from: location}, replace: true });
                  }

                
                
               
            //setSuccessAlert(true);
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
const handleResendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
            const data = {
                email: userEmail, 
            }
        try {
            
                const response = await Axios.post(RESENDOTP, data);
                console.log(response);
                setIsLoading(false);
               
            //setSuccessAlert(true);
        } catch (error) {
            console.log(error.response.data);
            setIsVisible(true);
            setError(error.response.data.message)
            setIsLoading(false);
            //setRefershPage(false);
        }
};
    return(
        <>
                    {/* <div className="w-full p-4">
                        <Label htmlFor="verifyOtp" nameOfLabel="Verify Otp" validRule={validVerifyOtp} nameOfState={verifyOtp} />
                        <Input id="verifyOtp" value={verifyOtp} autoComplete="off" type="text"
                            onChange={(e) => setVerifyOtp(e.target.value)}
                            aria_invalid={validVerifyOtp ? "false" : "true"}
                            aria_describedby="verifyOtpNote"
                            onFocus={() => setVerifyOtpFocus(true)}
                            onBlur={() => setVerifyOtpFocus(false)}
                            focusValue={verifyOtpFocus}
                            validValue={validVerifyOtp}
                            errorMesg="Six digit number"
                        />
                    </div> */}
                    <div className="flex items-center justify-center w-full gap-2.5 p-4" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                className="w-11.25 h-11.25 text-center text-[20px] border border-pink-500 outline-0 rounded-lg"
                                key={index}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                ref={(el) => (inputRefs.current[index] = el)}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                            />
                        ))}
                    </div>
                    <div className="w-full flex items-center justify-center pl-4 pr-4 pb-4">
                        <p className="text-sm">{seconds > 0 ? `OTP valid for: ${seconds} sec` : 
                            <button 
                                className="text-sm text-stone-600 hover:text-amber-700 cursor-pointer"
                                onClick={handleResendOtp}
                            >Resend OTP</button>
                        }</p>
                        
                    </div>
                    <div className="w-full flex items-center justify-center pl-4 pr-4 pb-4">
                        {/* <button 
                            className="text-sm border border-[rgba(244,87,128)] cursor-pointer
                            hover:text-white hover:bg-[rgba(244,87,128,1)]
                            text-stone-600 px-2.5 py-1.5 rounded-[5px]" onClick={handleSubmitOtp}>
                                Submit Otp
                        </button> */}
                        <button 
                            //onClick={handleSubmit} 
                            disabled={otp.includes("")} 
                            className="text-sm border border-[rgba(244,87,128)] cursor-pointer
                            hover:text-white hover:bg-[rgba(244,87,128,1)]
                            text-stone-600 px-2.5 py-1.5 rounded-[5px]"
                            onClick={handleSubmitOtp}
                            style={{ opacity: otp.includes("") ? 0.5 : 1 }}
                        >
                            Verify OTP
                        </button>
                    </div>
                

        </>
    );
}

export default VerifyOtp;
