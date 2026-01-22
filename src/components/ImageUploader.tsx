import React, { useRef, useState } from 'react';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
    /** Async handler when a file is selected */
    onImageSelect: (file: File) => Promise<void>;
    /** Clear the current selection */
    onClear: () => void;
    /** Original image data URL */
    original: string | null;
    /** Processed/Dithered image data URL for preview */
    preview: string | null;
    /** Loading state during image processing */
    processing: boolean;
}

/**
 * Handles file selection and preview display for image printing.
 * Toggles between Original and Dithered preview modes.
 */
export const ImageUploader = ({ onImageSelect, onClear, original, preview, processing }: ImageUploaderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'original' | 'preview'>('preview');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageSelect(file);
        }
    };

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden relative min-h-[200px] flex flex-col">
            {preview ? (
                <div className="flex flex-col w-full h-full">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 bg-white">
                        <button 
                            onClick={() => setViewMode('preview')}
                            className={`flex-1 py-2 text-sm font-medium transition-colors ${viewMode === 'preview' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Preview (Print)
                        </button>
                        <button 
                            onClick={() => setViewMode('original')}
                            className={`flex-1 py-2 text-sm font-medium transition-colors ${viewMode === 'original' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Original
                        </button>
                    </div>

                    {/* Image Canvas */}
                    <div 
                        className="flex-1 p-4 flex items-center justify-center cursor-pointer min-h-[250px]"
                        onClick={() => fileInputRef.current?.click()}
                    >
                         {viewMode === 'preview' ? (
                            <img src={preview} alt="Preview" className="w-full max-w-[576px] object-contain shadow-sm border border-gray-200 bg-white" style={{imageRendering: 'pixelated'}} />
                         ) : (
                            <img src={original || ''} alt="Original" className="max-h-64 object-contain shadow-sm rounded border border-gray-200 bg-white" />
                         )}
                    </div>
                     
                    <div className="text-center pb-2 text-xs text-gray-400">
                        Tap image to change
                    </div>
                </div>
            ) : (
                <div 
                    className="flex-1 flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => !processing && fileInputRef.current?.click()}
                >
                     {processing ? (
                        <div className="text-gray-500 font-medium flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            Processing...
                        </div>
                     ) : (
                        <>
                            <Upload className="w-12 h-12 text-gray-300 mb-2" />
                            <p className="text-gray-500 font-medium">Tap to upload image</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG supported</p>
                        </>
                    )}
                </div>
            )}
            
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
            />
        </div>
    );
};
