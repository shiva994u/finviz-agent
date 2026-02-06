import React, { useState, useEffect } from 'react';

interface MarketData {
    symbol: string;
    price: number;
    change: number;
}

const Footer: React.FC = () => {
    // Mock data for initial render
    const [marketData, setMarketData] = useState<MarketData[]>([]);

    // Simulate live updates
    useEffect(() => {
        const interval = setInterval(() => {
            setMarketData(prevData =>
                prevData.map(item => ({
                    ...item,
                    price: item.price * (1 + (Math.random() - 0.5) * 0.001),
                    // Occasionally flip the change direction for dynamic effect
                    // change: item.change + (Math.random() - 0.5) * 0.05
                }))
            );
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const formatPrice = (val: number, symbol: string) => {
        if (symbol.includes("USD") && !symbol.includes("BTC")) return val.toFixed(4); // Forex
        if (symbol === 'BTCUSD') return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
        return val.toFixed(2);
    };

    const getChangeColor = (change: number) => {
        return change >= 0 ? 'text-electric-lime' : 'text-crimson-pulse';
    };

    return (
        <footer className="fixed bottom-0 w-full glass-header h-10 flex items-center px-6 z-50 text-sm font-mono border-t border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md">
            <div className="flex space-x-8 overflow-hidden whitespace-nowrap w-full">
                {marketData.map((item) => (
                    <div key={item.symbol} className="flex items-center space-x-2">
                        <span className="text-gray-400 font-semibold">{item.symbol}</span>
                        <span className="text-white">{formatPrice(item.price, item.symbol)}</span>
                        <span className={`${getChangeColor(item.change)} font-bold`}>
                            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
        </footer>
    );
};

export default Footer;
