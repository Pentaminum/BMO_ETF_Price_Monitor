import { type ChangeEvent, useRef} from 'react';
import { logger } from '../../utils/logger';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    isPending: boolean;
}

export const FileUploadButton = ({ onFileSelect, isPending }: FileUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // file validation
    const validateAndProcessFile = (file: File | undefined) => {
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            logger.warn(`Upload blocked: Invalid file type (${file.name})`);
            alert('Invalid file format. Please upload a .csv file.');
            return;
        }

        logger.info(`Valid CSV selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        onFileSelect(file);
    }

    // file change handler
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        validateAndProcessFile(e.target.files?.[0]); // only the first file even if multiple file comes in
        if (fileInputRef.current) fileInputRef.current.value = ''; // same name != same file
    };

    return (
    <label className={`
      flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm
      ${isPending 
        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
        : 'bg-[#0078c1] text-white hover:opacity-80 active:scale-95 cursor-pointer'}
    `}>
      {isPending ? (
        <>
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <span className="text-lg">+</span>
          Upload CSV
        </>
      )}
      <input 
        type="file" 
        accept=".csv" 
        className="hidden" 
        onChange={handleFileChange} 
        disabled={isPending} 
        ref={fileInputRef}
      />
    </label>
  );
};