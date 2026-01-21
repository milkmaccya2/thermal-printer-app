import React, { type ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 ${className}`}>
            {children}
        </div>
    );
};
