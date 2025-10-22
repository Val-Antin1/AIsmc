import { Upload, X } from 'lucide-react';
import { ChartUpload } from '../types/trading';

interface ChartUploaderProps {
  timeframe: '4H' | '15M';
  upload: ChartUpload | null;
  onUpload: (upload: ChartUpload) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function ChartUploader({ timeframe, upload, onUpload, onRemove, disabled }: ChartUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, JPEG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onUpload({
        file,
        preview: event.target?.result as string,
        timeframe
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">{timeframe} Chart</h3>
        {upload && (
          <button
            onClick={onRemove}
            disabled={disabled}
            className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {upload ? (
        <div className="relative rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-800">
          <img
            src={upload.preview}
            alt={`${timeframe} chart preview`}
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="text-xs text-gray-300 truncate">{upload.file.name}</p>
          </div>
        </div>
      ) : (
        <label className={`relative flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
          disabled
            ? 'border-gray-700 bg-gray-800/50 cursor-not-allowed'
            : 'border-gray-600 bg-gray-800/30 hover:border-blue-500 hover:bg-gray-800/50'
        }`}>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
          <Upload className={`w-12 h-12 mb-3 ${disabled ? 'text-gray-600' : 'text-gray-500'}`} />
          <p className={`text-sm ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>
            Upload {timeframe} Chart
          </p>
          <p className={`text-xs mt-1 ${disabled ? 'text-gray-700' : 'text-gray-500'}`}>
            JPG, PNG, JPEG
          </p>
        </label>
      )}
    </div>
  );
}
