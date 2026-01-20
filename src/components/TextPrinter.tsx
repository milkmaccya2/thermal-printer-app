import React, { useState } from 'react';
import { actions } from 'astro:actions';
import { Type, Printer, Loader2 } from 'lucide-react';

export const TextPrinter = () => {
    const [text, setText] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePrint = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setStatus('Sending...');
        try {
            const result = await actions.printText({ text });
            if (result.data?.success) {
                setStatus('✅ Printed successfully!');
                setText('');
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
                <Type className="w-6 h-6 text-indigo-600" />
                Text Printer
            </h2>
            <textarea
                className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
                placeholder="Enter text here...&#10;(You may need to configure system fonts for Japanese)"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <div className="mt-4 flex flex-col gap-4">
                 <div className="flex justify-between items-start min-h-[24px]">
                    <p className="text-sm text-gray-600 font-medium break-words pr-2 flex-1 leading-tight">
                        {status}
                    </p>
                    {text && (
                        <button 
                            onClick={() => {
                                setText('');
                                setStatus('');
                            }} 
                            className="text-xs text-red-500 font-bold px-2 py-1 bg-red-50 rounded hover:bg-red-100 whitespace-nowrap ml-2"
                        >
                            CLEAR
                        </button>
                    )}
                 </div>

                <button
                    onClick={handlePrint}
                    disabled={loading || !text.trim()}
                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 ${
                        loading || !text.trim()
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
                            PRINT TEXT
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
