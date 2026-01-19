import React, { useState } from 'react';
import { actions } from 'astro:actions';

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
                <span>📝</span> Text Printer
            </h2>
            <textarea
                className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
                placeholder="Enter text here...&#10;(You may need to configure system fonts for Japanese)"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium h-5">{status}</span>
                <button
                    onClick={handlePrint}
                    disabled={loading || !text.trim()}
                    className={`px-6 py-2 rounded-lg font-bold text-white transition-all active:scale-95 ${
                        loading || !text.trim() 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }`}
                >
                    {loading ? 'Printing...' : 'Print Text'}
                </button>
            </div>
        </div>
    );
};
