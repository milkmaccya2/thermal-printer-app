import React, { useState } from 'react';
import { actions } from 'astro:actions';
import { Printer, CheckCircle, AlertCircle, RefreshCcw, Scissors } from 'lucide-react';
import { Card } from './ui/Card';

interface PrinterStatusCardProps {
    status: string;
    isPaused: boolean;
    onStatusUpdate: () => void;
}

export const PrinterStatusCard = ({ status, isPaused, onStatusUpdate }: PrinterStatusCardProps) => {
    const [enabling, setEnabling] = useState(false);
    const [cutting, setCutting] = useState(false);
    const isOnline = status.includes('idle') || status.includes('printing');

    const handleEnablePrinter = async () => {
        setEnabling(true);
        try {
            await actions.enablePrinter({});
            // Wait a bit before refreshing
            setTimeout(onStatusUpdate, 2000);
        } catch (error) {
            console.error("Failed to enable printer", error);
        } finally {
            setEnabling(false);
        }
    };

    const handleForceCut = async () => {
        setCutting(true);
        try {
            await actions.forceCut({});
        } catch (error) {
            console.error("Failed to cut paper", error);
        } finally {
            setTimeout(() => setCutting(false), 1000);
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Printer className="w-6 h-6 text-indigo-600" />
                    Printer Status
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleEnablePrinter}
                        disabled={enabling}
                        className={`flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                            enabling 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        }`}
                        title="Enable Printer"
                    >
                        <RefreshCcw className={`w-4 h-4 ${enabling ? 'animate-spin' : ''}`} />
                        {enabling ? 'Enabling...' : 'Enable'}
                    </button>
                    <button
                        onClick={handleForceCut}
                        disabled={cutting}
                        className={`flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                            cutting 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                        }`}
                        title="Force Cut"
                    >
                        <Scissors className="w-4 h-4" />
                        {cutting ? 'Cutting...' : 'Cut'}
                    </button>
                </div>
            </div>
            
            <div className={`flex items-center gap-3 p-4 rounded-xl ${isOnline ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
                <div className={`text-2xl ${isOnline ? 'text-green-500' : 'text-amber-500'}`}>
                    {isOnline ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>
                <div>
                    <p className={`font-bold ${isOnline ? 'text-green-800' : 'text-amber-800'}`}>
                        {isOnline ? 'Online / Ready' : 'Status Check'}
                    </p>
                    <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-amber-600'}`}>{status}</p>
                </div>
            </div>
        </Card>
    );
};
