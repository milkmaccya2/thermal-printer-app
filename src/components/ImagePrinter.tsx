import React, { useState, useRef } from 'react';
import { actions } from 'astro:actions';

export const ImagePrinter = () => {
    const [preview, setPreview] = useState<string | null>(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setStatus('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePrint = async () => {
        if (!preview) return;
        setLoading(true);
        setStatus('Sending...');
        try {
            const result = await actions.printImage({ image: preview });
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
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
            >
                {preview ? (
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto object-contain rounded-lg shadow-sm" />
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
                    {preview && <button onClick={() => {setPreview(null); setStatus('');}} className="text-xs text-red-500 underline text-left mt-1">Clear</button>}
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
