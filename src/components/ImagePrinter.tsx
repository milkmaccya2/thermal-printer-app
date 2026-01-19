import React, { useState, useRef } from 'react';
import { actions } from 'astro:actions';

export const ImagePrinter = () => {
    const [original, setOriginal] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Show loading state
            setProcessing(true);
            setStatus('Generating preview...');
            
            try {
                // 1. Read original for sending to server
                const reader = new FileReader();
                reader.onloadend = () => {
                   setOriginal(reader.result as string);
                };
                reader.readAsDataURL(file);

                // 2. Generate Dithered Preview
                const { processImagePreview } = await import('../utils/ditheringClient');
                const ditheredDataUrl = await processImagePreview(file);
                setPreview(ditheredDataUrl);
                setStatus('Preview ready. This is how it will look printed.');
                
            } catch (err) {
                console.error(err);
                setStatus('Failed to generate preview');
            } finally {
                setProcessing(false);
            }
        }
    };

    const handlePrint = async () => {
        // Send ORIGINAL to server to let sharp handle the high-quality processing
        // (Server and client algorithms are aligned now)
        if (!original) return;
        setLoading(true);
        setStatus('Sending...');
        try {
            const result = await actions.printImage({ image: original });
            if (result.data?.success) {
                setStatus('✅ Printed successfully!');
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <span>🖼️</span> Image Printer
            </h2>
            
            <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden min-h-[200px] flex flex-col items-center justify-center"
                onClick={() => !processing && fileInputRef.current?.click()}
            >
                {processing ? (
                   <div className="text-gray-500 animate-pulse">Generating Monochrome Preview...</div>
                ) : preview ? (
                    <div className="w-full">
                        <p className="text-xs text-gray-400 mb-2">Print Preview (1-bit Dithered)</p>
                        <img src={preview} alt="Preview" className="w-full max-w-[576px] mx-auto object-contain shadow-sm border border-gray-100" style={{imageRendering: 'pixelated'}} />
                    </div>
                ) : (
                    <div className="py-8">
                        <p className="text-gray-400 text-4xl mb-2">📁</p>
                        <p className="text-gray-500 font-medium">Click to upload image</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG supported</p>
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

            <div className="mt-4 flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-sm text-gray-500 font-medium h-5">{status}</span>
                <button 
                    onClick={() => {
                        setPreview(null); 
                        setOriginal(null); 
                        setStatus('');
                    }} 
                    className="text-xs text-red-500 underline text-left mt-1"
                >
                    Clear
                </button>
                 </div>
                <button
                    onClick={handlePrint}
                    disabled={loading || !preview}
                    className={`px-6 py-2 rounded-lg font-bold text-white transition-all active:scale-95 ${
                        loading || !preview
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }`}
                >
                    {loading ? 'Printing...' : 'Print Image'}
                </button>
            </div>
        </div>
    );
};
