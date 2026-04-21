interface Props {
  message?: string;
  onDismiss: () => void;
}

export const ErrorAlert = ({ message, onDismiss }: Props) => (
  <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
    <div className="flex-shrink-0 w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-bold">
      !
    </div>
    <div className="flex-1">
      <h3 className="text-sm font-bold text-rose-900">Analysis Error</h3>
      <p className="text-sm text-rose-700 mt-1">
        {message || "An unexpected error occurred. Please check your file and try again."}
      </p>
    </div>
    <button 
      onClick={onDismiss}
      className="text-xs font-bold text-rose-400 hover:text-rose-600 underline"
    >
      Dismiss
    </button>
  </div>
);