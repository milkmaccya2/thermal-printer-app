export interface PrintJob {
    id: string;
    name: string;
    file: string;
    size: string;
    time: string;
}

export interface PrinterStatusData {
    status: string;
    jobs: PrintJob[];
}

export interface ActionResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}
