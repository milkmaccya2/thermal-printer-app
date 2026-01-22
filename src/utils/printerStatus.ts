import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface PrintJob {
    id: string;
    name: string;
    file: string;
    size: string;
    time: string;
    user: string;
}

export interface PrinterStatus {
    status: string;
    jobs: PrintJob[];
    isPaused: boolean;
}

export async function getPrinterStatusFromOS(): Promise<PrinterStatus> {
    try {
        // Get Printer Status
        const { stdout: statusOut } = await execAsync('lpstat -p');
        const statusLine = statusOut.split('\n')[0] || 'Unknown'; // Take first line e.g. "printer POS-80 is idle..."
        
        // Simple heuristic for paused state
        const isPaused = statusLine.toLowerCase().includes('paused') || statusLine.toLowerCase().includes('disabled');

        // Get Queue
        const { stdout: queueOut } = await execAsync('lpstat -o');
        const jobs = queueOut.split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => {
                const parts = line.split(/\s+/);
                // lpstat -o output format varies but typically:
                // POS-80-55 milkmaccya 1024 Tue 18 ...
                return {
                    id: parts[0],
                    name: parts[0], // job id as name for now
                    file: 'Raw Data',
                    size: 'Unknown',
                    time: parts.slice(3).join(' ') || 'Just now',
                    user: parts[1],
                };
            });
            
        return { status: statusLine, jobs, isPaused };
    } catch (error: any) {
        console.error("Error fetching printer status:", error);
        return { 
            status: `Error: ${error.message}`, 
            jobs: [], 
            isPaused: false 
        };
    }
}
