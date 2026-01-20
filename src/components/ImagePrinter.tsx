import React, { useState, useRef } from 'react';
import { actions } from 'astro:actions';
import { Image, Upload, Printer, Loader2 } from 'lucide-react';

export const ImagePrinter = () => {
    const [original, setOriginal] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [viewMode, setViewMode] = useState<'original' | 'preview'>('preview');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (existing code, ensure it aligns with file context)
        const file = e.target.files?.[0];
        if (file) {
            setProcessing(true);
            setStatus('Generating preview...');
            setViewMode('preview');
            try {
                const reader = new FileReader();
                reader.onloadend = () => { setOriginal(reader.result as string); };
                reader.readAsDataURL(file);

                const { processImagePreview } = await import('../utils/ditheringClient');
                const ditheredDataUrl = await processImagePreview(file);
                setPreview(ditheredDataUrl);
                setStatus('Preview ready.');
            } catch (err) {
                console.error(err);
                setStatus('Failed to generate preview');
            } finally {
                setProcessing(false);
            }
        }
    };

    const handlePrint = async () => {
        if (!original) return;
        setLoading(true);
        setStatus('Sending...');
        try {
            const result = await actions.printImage({ image: original });
            if (result.data?.success) {
                setStatus('✅ Sent to printer!');
            } else {
                setStatus(`❌ Error: ${result.error?.message || result.data?.message}`);
            }
        } catch (e: any) {
            setStatus(`❌ System Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Image className="w-6 h-6 text-indigo-600" />
                Image Printer
            </h2>
            
            {/* Image Display Area */}
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

            {/* Actions Area */}
            <div className="mt-4 flex flex-col gap-4">
                 
                 {/* Status & Clear */}
                 <div className="flex justify-between items-start min-h-[24px]">
                    <p className="text-sm text-gray-600 font-medium break-words pr-2 flex-1 leading-tight">
                        {status}
                    </p>
                    {preview && (
                        <button 
                            onClick={() => {
                                setPreview(null); 
                                setOriginal(null); 
                                setStatus('');
                            }} 
                            className="text-xs text-red-500 font-bold px-2 py-1 bg-red-50 rounded hover:bg-red-100 whitespace-nowrap ml-2"
                        >
                            CLEAR
                        </button>
                    )}
                 </div>

                {/* Big Print Button */}
                <button
                    onClick={handlePrint}
                    disabled={loading || !preview}
                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 ${
                        loading || !preview
                        ? 'bg-gray-300 cursor-not-allowed shadow-none text-gray-500' 
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'
                    }`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Printer className="w-6 h-6" />
                            PRINT IMAGE
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
