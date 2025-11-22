import React from 'react';

export default function DashboardGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-0 auto-rows-max">
            {children}
        </div>
    );
}
