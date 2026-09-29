import { useEffect, useRef } from 'react';

const OTP_LENGTH = 6;

const OtpInput = ({ value, onChange, disabled = false }) => {
    const inputRefs = useRef([]);
    const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '');

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const updateDigit = (index, nextValue) => {
        const digit = nextValue.replace(/\D/g, '').slice(-1);
        const nextDigits = [...digits];
        nextDigits[index] = digit;
        onChange(nextDigits.join(''));
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (event, index) => {
        if (event.key === 'Backspace' && !digits[index] && index > 0) {
            const nextDigits = [...digits];
            nextDigits[index - 1] = '';
            onChange(nextDigits.join(''));
            inputRefs.current[index - 1]?.focus();
        }
        if (event.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (event) => {
        const pasted = event.clipboardData.getData('text').trim();
        if (!/^\d{6}$/.test(pasted)) {
            return;
        }
        event.preventDefault();
        onChange(pasted);
        inputRefs.current[OTP_LENGTH - 1]?.focus();
    };

    return (
        <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(element) => { inputRefs.current[index] = element; }}
                    aria-label={`Verification code digit ${index + 1}`}
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    className="h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white text-center text-xl font-bold text-slate-950 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100 sm:h-14"
                    disabled={disabled}
                    inputMode="numeric"
                    maxLength={1}
                    pattern="[0-9]*"
                    type="text"
                    value={digit}
                    onChange={(event) => updateDigit(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                />
            ))}
        </div>
    );
};

export default OtpInput;
