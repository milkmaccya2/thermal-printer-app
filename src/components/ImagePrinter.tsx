import React, { useState } from 'react';
import { actions } from 'astro:actions';
import { Image, Printer, Loader2 } from 'lucide-react';
import { Card } from './ui/Card';
import { ImageUploader } from './ImageUploader';

export const ImagePrinter = () => {
    const [original, setOriginal] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleImageSelect = async (file: File) => {
        setProcessing(true);
        setStatus('Generating preview...');
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
    };

    const handleClear = () => {
        setPreview(null);
        setOriginal(null);
        setStatus('');
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
        <Card className="h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Image className="w-6 h-6 text-indigo-600" />
                Image Printer
            </h2>
            
            <ImageUploader 
                onImageSelect={handleImageSelect}
                onClear={handleClear}
                original={original}
                preview={preview}
                processing={processing}
            />

            {/* Actions Area */}
            <div className="mt-4 flex flex-col gap-4">
                 
                 {/* Status & Clear */}
                 <div className="flex justify-between items-start min-h-[24px]">
                    <p className="text-sm text-gray-600 font-medium break-words pr-2 flex-1 leading-tight">
                        {status}
                    </p>
                    {preview && (
                        <button 
                            onClick={handleClear} 
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
        </Card>
    );
};

