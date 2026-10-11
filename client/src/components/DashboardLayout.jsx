import React from 'react';
import TopBar from './TopBar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            {/* Main Content Area */}
            <div className="flex flex-col min-h-screen">
                <TopBar />
                <main className="flex-1 p-10 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
