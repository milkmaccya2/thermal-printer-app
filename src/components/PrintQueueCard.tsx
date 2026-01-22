import React from 'react';
import { Printer, List, FileText, Trash2, XCircle } from 'lucide-react';
import { Card } from './ui/Card';
import type { PrintJob } from './types';

interface PrintQueueCardProps {
    /** List of active print jobs */
    jobs: PrintJob[];
    /** Callback to cancel all jobs */
    onClearQueue: () => void;
    /** Callback to cancel a specific job */
    onCancelJob: (jobId: string) => void;
}

/**
 * Visualizes the current print queue.
 * Allows cancelling individual or all jobs.
 */
export const PrintQueueCard = ({ jobs, onClearQueue, onCancelJob }: PrintQueueCardProps) => {
    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <List className="w-5 h-5 text-gray-500" />
                    Print Queue
                </h2>
                <div className="flex gap-2 items-center">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                        {jobs.length} jobs
                    </span>
                    {jobs.length > 0 && (
                        <button 
                            onClick={onClearQueue}
                            className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                    <Printer className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No active print jobs</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {jobs.map((job) => (
                        <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:bg-gray-100 group">
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
                                <button
                                    onClick={() => onCancelJob(job.id)}
                                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                    title="Cancel Job"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

