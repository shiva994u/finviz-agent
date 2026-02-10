import React, { useEffect, useState } from 'react';
import { fetchEarnings, fetch5MinData, type FiveMinData, type MoverData } from '../../services/api';
import { Loader2 } from 'lucide-react';
import StockCard from './StockCard';

const FiveMinEarningsPanel: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [earningsData, setEarningsData] = useState<MoverData[]>([]);
    const [fiveMinData, setFiveMinData] = useState<FiveMinData[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [inputTickers, setInputTickers] = useState<string>('');

    const loadData = async (customTickers: string[] | null = null) => {
        setLoading(true);
        try {
            let targetTickers: string[] = [];
            let displayData: MoverData[] = [];

            if (customTickers && customTickers.length > 0) {
                // User entered tickers
                targetTickers = customTickers;
                // Basic placeholder MoverData construction
                displayData = targetTickers.map(t => ({
                    ticker: t,
                    company: '',
                    price: 0,
                    changePercent: 0,
                    volume: 0,
                    sector: '',
                    industry: '',
                    open: 0,
                    prevClose: 0,
                    volatilityWeek: 0,
                    relativeVolume: 0,
                    averageVolume: 0,
                    newsTime: '',
                    newsTitle: ''
                }));
            }
            //else {
            //     // Default: Fetch Earnings Tickers
            //     const earnings = await fetchEarnings();
            //     // Take top 12
            //     const top12 = earnings.slice(0, 12);
            //     displayData = top12;
            //     targetTickers = top12.map(d => d.ticker);
            // }

            setEarningsData(displayData);

            if (targetTickers.length > 0) {
                // Fetch 5min data for these tickers
                const fiveMin = await fetch5MinData(targetTickers);
                setFiveMinData(fiveMin);

                // Update displayData with latest price/change from 5min data if it was custom
                if (customTickers) {
                    const updatedDisplayData = displayData.map(d => {
                        const fm = fiveMin.find(f => f.ticker === d.ticker);
                        if (fm && fm.market_hours.length > 0) {
                            const lastClose = fm.market_hours[fm.market_hours.length - 1].close;
                            const firstOpen = fm.market_hours[0].open; // or premarket?
                            const change = ((lastClose - firstOpen) / firstOpen) * 100;
                            const volume = fm.market_hours.reduce((acc, curr) => acc + curr.volume, 0);
                            return {
                                ...d,
                                price: lastClose,
                                changePercent: change,
                                volume: volume
                            };
                        }
                        return d;
                    });
                    setEarningsData(updatedDisplayData);
                }
            }
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to load 5min earnings data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(() => {
            // If user has input, refresh that, otherwise refresh default
            if (inputTickers.trim().length > 0) {
                handleFetch(); // Refresh custom
            } else {
                loadData(); // Refresh default
            }
        }, 60000 * 5); // Refresh every 5 mins
        return () => clearInterval(interval);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleFetch = () => {
        if (!inputTickers.trim()) {
            loadData(null); // Reset to earnings
            return;
        }
        const tickers = inputTickers.split(',').map(t => t.trim().toUpperCase()).filter(t => t.length > 0);
        loadData(tickers);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFetch();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Market-Hour Focus
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Displaying 5-minute intervals • {lastUpdated.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Enter tickers (e.g., NVDA, TSLA)"
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                            value={inputTickers}
                            onChange={(e) => setInputTickers(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <button
                        onClick={handleFetch}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Fetch
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && earningsData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 space-y-4">
                    <Loader2 className="w-12 h-12 text-[#00E5FF] animate-spin" />
                    <div className="text-gray-400 animate-pulse">Scanning Market Data...</div>
                </div>
            ) : (
                /* List View - Single Column for compact rows */
                <div className="flex flex-col gap-2">
                    {earningsData.map((stock) => {
                        const stock5Min = fiveMinData.find(d => d.ticker === stock.ticker);

                        return (
                            <StockCard
                                key={stock.ticker}
                                data={stock5Min}
                                moverData={stock}
                            />
                        );
                    })}
                </div>
            )}

            {earningsData.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <p>No data available for display.</p>
                </div>
            )}
        </div>
    );
};

export default FiveMinEarningsPanel;
