import React, { useEffect, useState } from 'react';
import { actions } from 'astro:actions';
import { Printer, CheckCircle, AlertCircle, List, FileText, RefreshCcw } from 'lucide-react';

interface PrintJob {
    id: string;
    name: string;
    file: string;
    size: string;
    time: string;
}

export const PrinterManager = () => {
    const [jobs, setJobs] = useState<PrintJob[]>([]);
    const [status, setStatus] = useState<string>('Checking...');
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [enabling, setEnabling] = useState(false);

    const fetchStatus = async () => {
        try {
            const result = await actions.getPrinterStatus({});
            if (result.data) {
                setJobs(result.data.jobs || []);
                const currentStatus = result.data.status || 'Unknown';
                setStatus(currentStatus);
                // Simple heuristic: if status contains "paused", show enable button
                setIsPaused(currentStatus.toLowerCase().includes('paused'));
            }
        } catch (e) {
            console.error("Failed to fetch status", e);
            setStatus('Error fetching status');
        }
    };

    const handleEnablePrinter = async () => {
        setEnabling(true);
        try {
            await actions.enablePrinter({});
            // Wait a bit before refreshing
            setTimeout(fetchStatus, 2000);
        } catch (error) {
            console.error("Failed to enable printer", error);
        } finally {
            setEnabling(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const isOnline = status.includes('idle') || status.includes('printing');

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Printer className="w-6 h-6 text-indigo-600" />
                        Printer Status
                    </h2>
                    {isPaused && (
                         <button
                            onClick={handleEnablePrinter}
                            disabled={enabling}
                            className={`flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                                enabling 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }`}
                        >
                            <RefreshCcw className={`w-4 h-4 ${enabling ? 'animate-spin' : ''}`} />
                            {enabling ? 'Enabling...' : 'Enable Printer'}
                        </button>
                    )}
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
            </div>

            {/* Print Queue */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <List className="w-5 h-5 text-gray-500" />
                        Print Queue
                    </h2>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                        {jobs.length} jobs
                    </span>
                </div>

                {jobs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <Printer className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No active print jobs</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {jobs.map((job) => (
                            <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:bg-gray-100">
                                <div className="flex items-center gap-3 mb-2 sm:mb-0 w-full sm:w-auto overflow-hidden">
                                    <div className="bg-white p-2 rounded-lg border border-gray-200 shrink-0">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-800 truncate">{job.id}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{job.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 pl-12 sm:pl-0 shrink-0 whitespace-nowrap">
                                    <span>{job.size}</span>
                                    <span>{job.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
