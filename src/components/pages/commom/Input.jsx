import { FaInfoCircle } from "react-icons/fa";

const Input = ({ id, type, value, placeHolder, autoComplete, onChange, aria_invalid, aria_describedby, onFocus, onBlur, disabled, focusValue, validValue, errorMesg }) => {
    return (
        <>
            <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                type={type}
                id={id}
                value={value}
                placeholder={placeHolder}
                autoComplete={autoComplete}
                onChange={onChange}
                required
                aria-invalid={aria_invalid}
                aria-describedby={aria_describedby}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={disabled}
            />{
                errorMesg && <p id={aria_describedby} className={`${focusValue && !validValue
                    ? "mt-1.5 text-rose-600 duration-300" : "hidden duration-300"}`}>
                    <span className="flex flex-wrap items-center gap-1 text-xs font-medium"><FaInfoCircle />{errorMesg}</span>
                </p>
            }
            
        </>
    );
}
export default Input;
