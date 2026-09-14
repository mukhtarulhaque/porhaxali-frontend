const Label = ({ htmlFor, nameOfLabel, validRule, nameOfState }) => {

    return (
        <>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600" htmlFor={htmlFor}>

                <span className={nameOfState && !validRule ? "text-rose-600 duration-300" : "text-slate-700 duration-300"}>
                    {nameOfLabel}
                </span>
            </label>
        </>
    );
}
export default Label;
