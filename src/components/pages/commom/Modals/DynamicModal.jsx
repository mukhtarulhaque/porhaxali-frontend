const DynamicModal = ({isOpen, onClose, title, children}) => {
      if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
            <div role="dialog" aria-modal="true" aria-labelledby="dynamic-modal-title" className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b">
                    <h3 id="dynamic-modal-title" className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="text-pink-600 pl-2 pr-2 bg-gray-200 rounded-full hover:cursor-pointer hover:text-gray-600 font-bold text-3xl"
                    >
                        &times;
                    </button>
                </div>
                <div className="py-4">{children}</div>
            </div>
        </div>
    );
}
export default DynamicModal;
