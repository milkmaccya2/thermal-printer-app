import React, { useEffect, useState } from 'react';
import { actions } from 'astro:actions';
import { PrinterStatusCard } from './PrinterStatusCard';
import { PrintQueueCard } from './PrintQueueCard';
import type { PrintJob } from './types';

export const PrinterManager = () => {
    const [jobs, setJobs] = useState<PrintJob[]>([]);
    const [status, setStatus] = useState<string>('Checking...');
    const [isPaused, setIsPaused] = useState<boolean>(false);

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

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const handleClearQueue = async () => {
        if (!confirm('Are you sure you want to clear all jobs?')) return;
        try {
            await actions.clearQueue({});
            fetchStatus();
        } catch (e) {
            console.error("Failed to clear queue", e);
        }
    };

    const handleCancelJob = async (jobId: string) => {
        if (!confirm(`Cancel job ${jobId}?`)) return;
        try {
            await actions.cancelJob({ jobId });
            fetchStatus();
        } catch (e) {
            console.error("Failed to cancel job", e);
        }
    };

    return (
        <div className="space-y-6">
            <PrinterStatusCard 
                status={status} 
                isPaused={isPaused} 
                onStatusUpdate={fetchStatus} 
            />
            <PrintQueueCard 
                jobs={jobs} 
                onClearQueue={handleClearQueue}
                onCancelJob={handleCancelJob}
            />
        </div>
    );
};

