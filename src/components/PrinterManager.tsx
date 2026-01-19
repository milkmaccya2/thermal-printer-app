import { useState, useEffect, useCallback } from 'react';
import { actions } from 'astro:actions';

interface Job {
    id: string;
    user: string;
    status: string;
    raw: string;
}

export const PrinterManager = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchQueue = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await actions.getQueue();
            if (data?.success) {
                setJobs(data.jobs || []);
            }
        } catch (e) {
            console.error('Failed to fetch queue', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [fetchQueue]);

    const handleCancelJob = async (jobId: string) => {
        if (!confirm(`Cancel job ${jobId}?`)) return;
        setActionLoading(true);
        await actions.cancelJob({ jobId });
        fetchQueue();
        setActionLoading(false);
    };

    const handleClearQueue = async () => {
        if (!confirm('Cancel ALL jobs? This will stop everything.')) return;
        setActionLoading(true);
        await actions.clearQueue();
        fetchQueue();
        setActionLoading(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span>🖨️</span> Printer Queue
                </h2>
                <div className="flex gap-2">
                     <button
                        onClick={handleClearQueue}
                        disabled={actionLoading || jobs.length === 0}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={() => fetchQueue()}
                        disabled={loading}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No active jobs. Ready to print.
                </div>
            ) : (
                <div className="space-y-2">
                    {jobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <div className="text-sm">
                                <span className="font-mono font-bold text-blue-800">{job.id}</span>
                                <span className="mx-2 text-gray-400">|</span>
                                <span className="text-gray-600 truncate">{job.raw}</span>
                            </div>
                            <button
                                onClick={() => handleCancelJob(job.id)}
                                disabled={actionLoading}
                                className="text-xs bg-white border border-red-200 text-red-600 px-2 py-1 rounded hover:bg-red-50"
                            >
                                Cancel
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="mt-4 text-xs text-gray-400 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
                {loading ? 'Refreshing...' : `Auto-updates every 5s. Total Jobs: ${jobs.length}`}
            </div>
        </div>
    );
};
