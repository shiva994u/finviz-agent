import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-transparent text-white relative">
            <div className="absolute inset-0 bg-[#121212] -z-20"></div>
            {/* Subtle background glow/noise could go here */}

            <Navbar />

            <main className="flex-1 pt-20 pb-14 px-6 overflow-y-auto custom-scrollbar">
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
