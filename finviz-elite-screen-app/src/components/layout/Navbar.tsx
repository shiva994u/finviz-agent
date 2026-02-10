import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, MessageSquare, MonitorPlay } from 'lucide-react';

const Navbar: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const links = [
        { name: 'Top Movers', path: '/top-movers' },
        { name: 'Earnings Intelligence', path: '/earnings' },
        { name: '5Min Earnings', path: '/5min-earnings' },
        { name: 'Screener', path: '/screener' },
    ];

    return (
        <nav className="glass-header h-16 px-6 flex items-center justify-between fixed top-0 w-full z-50">
            <div className="flex items-center space-x-8">
                {/* Logo / Brand */}
                <div className="flex space-x-2">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </div>
            </div>

            <div className="flex items-center space-x-6 text-gray-300">
                <div className="text-white font-mono text-lg tracking-wider">
                    {formatTime(currentTime)}
                </div>

                <div className="h-6 w-px bg-white/10 mx-2"></div>

                <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-crimson-pulse rounded-full shadow-[0_0_8px_#FF3131]"></span>
                </button>

                <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                    <MessageSquare size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-crimson-pulse rounded-full shadow-[0_0_8px_#FF3131]"></span>
                </button>

                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <MonitorPlay size={20} /> {/* Placeholder for profile or other icon */}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
