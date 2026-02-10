import React, { useMemo, useState } from 'react';
import { type FiveMinData, type MoverData, type IntervalData } from '../../services/api';


interface StockCardProps {
    data: FiveMinData | undefined;
    moverData: MoverData;
}

const StockCard: React.FC<StockCardProps> = ({ data, moverData }) => {
    // Basic calcs
    const change = moverData.changePercent;
    const isPositive = change >= 0;
    const priceColor = isPositive ? 'text-[#00C805]' : 'text-[#FF3131]';

    // Market Stats
    const marketData = data?.market_hours || [];
    const marketVolRaw = marketData.reduce((acc, curr) => acc + curr.volume, 0);

    // Latest Interval Data for Summary
    const lastInterval = marketData.length > 0 ? marketData[marketData.length - 1] : null;

    // Memoized calculations
    const { intervals, avgRsi, ema10, ema25 } = useMemo(() => {
        if (!marketData.length) return { intervals: [], avgRsi: 0, ema10: 0, ema25: 0 };

        // RSI Logic (Simplified for display - using last known or avg)
        const rsiVal = 55; // Placeholder for "Current RSI"

        return {
            intervals: marketData,
            avgRsi: rsiVal,
            ema10: lastInterval?.ema10 || 0,
            ema25: lastInterval?.ema25 || 0
        };
    }, [marketData, lastInterval]);

    // Volume formatting helper
    const formatVol = (v: number) => {
        if (v >= 1000000) return `${(v / 1000000).toFixed(2)}M`;
        if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
        return v.toString();
    };

    // Hover State (Defaults to last interval)
    const [hoveredData, setHoveredData] = useState<IntervalData | null>(null);

    // Effect to set initial hover data to last interval when data loads
    React.useEffect(() => {
        if (lastInterval) {
            setHoveredData(lastInterval);
        }
    }, [lastInterval]);

    // Display Data (Hovered or Last)
    const displayData = hoveredData || lastInterval;

    return (
        <div className="flex flex-col md:flex-row md:items-stretch gap-2 md:gap-4 bg-[#161616] p-2 rounded-lg border border-white/5 h-auto md:h-32 hover:border-white/20 transition-colors w-full overflow-hidden relative">

            {/* 1. LEFT CARD: Detailed Summary (Mobile: Top Header Row, Desktop: Left Column) */}
            <div className="w-full md:w-40 flex-shrink-0 flex flex-row md:flex-col justify-between items-center md:items-stretch border-b md:border-b-0 md:border-r border-white/10 pb-2 md:pb-1 md:pr-2 mb-1 md:mb-0 h-auto md:h-full">
                {/* Header */}
                <div className="flex flex-row md:justify-between items-baseline gap-3 md:gap-0">
                    <span className="text-xl font-bold text-white tracking-tight truncate">{moverData.ticker}</span>
                    <span className={`text-sm font-bold ${priceColor} flex items-center`}>{Math.abs(change).toFixed(2)}%</span>
                </div>

                {/* Key Stats Grid */}
                <div className="flex flex-row md:flex-col gap-4 md:gap-1 text-[10px] text-gray-500 font-mono mt-0 md:mt-1">
                    <div className="flex md:justify-between gap-1 md:gap-0">
                        <span>Vol</span>
                        <span className="text-cyan-400 font-bold">{formatVol(marketVolRaw)}</span>
                    </div>
                    <div className="flex md:justify-between gap-1 md:gap-0">
                        <span>RSI</span>
                        <span className="text-yellow-400 font-bold">{avgRsi}</span>
                    </div>
                    <div className="flex md:justify-between gap-1 md:gap-0">
                        <span>EMA(10)</span>
                        <span className="text-blue-400">{ema10.toFixed(2)}</span>
                    </div>
                    <div className="flex md:justify-between gap-1 md:gap-0">
                        <span>EMA(25)</span>
                        <span className="text-purple-400">{ema25.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* 2. RIGHT PANEL: Container for Header + Chart */}
            <div className="flex flex-col h-48 md:h-full md:flex-1 overflow-hidden w-full">

                {/* TOP HEADER: Horizontal Bar Details */}
                <div className="flex items-center gap-4 text-[10px] font-mono border-b border-white/5 pb-1 mb-1 px-1 h-6 shrink-0">
                    {displayData ? (
                        <>
                            <span className="text-white font-bold bg-[#222] px-1 rounded">
                                {new Date(displayData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className="flex gap-3 text-gray-400">
                                <span>O: <span className="text-white">{displayData.open.toFixed(2)}</span></span>
                                <span>H: <span className="text-white">{displayData.high.toFixed(2)}</span></span>
                                <span>L: <span className="text-white">{displayData.low.toFixed(2)}</span></span>
                                <span>C: <span className={displayData.close >= displayData.open ? "text-[#00C805] font-bold" : "text-[#FF3131] font-bold"}>{displayData.close.toFixed(2)}</span></span>
                                <span>V: <span className="text-cyan-400">{formatVol(displayData.volume)}</span></span>
                                <span>E: <span className="text-yellow-400">{displayData.ema10?.toFixed(2)}</span></span>
                            </div>
                        </>
                    ) : (
                        <span className="text-gray-600">No Data</span>
                    )}
                </div>

                {/* CHART AREA: Simple Bar Chart with EMA Buffer Logic */}
                <div className="flex-1 flex items-end gap-[2px] overflow-x-auto custom-scrollbar pb-2 pl-1 relative min-h-[100px]">
                    {/* Reference Line */}
                    <div className="absolute top-1/2 left-0 right-0 border-t border-white/5 pointer-events-none" />

                    {intervals.map((d, i) => {
                        const ema = d.ema10 || d.close;
                        const buffer = 0.0005; // 0.05%
                        let barColor = 'bg-gray-600';

                        if (d.close > ema * (1 + buffer)) barColor = 'bg-[#00C805]'; // Green
                        else if (d.close < ema * (1 - buffer)) barColor = 'bg-[#FF3131]'; // Red

                        // Height based on Price Level (normalized to day's range)
                        const minPrice = Math.min(...intervals.map(i => i.low));
                        const maxPrice = Math.max(...intervals.map(i => i.high));
                        let priceRange = maxPrice - minPrice;
                        if (isNaN(priceRange) || priceRange === 0) priceRange = 1;

                        // Scale close price to 20%-100% height
                        // Safe calculation with fallback
                        let heightPct = 20 + ((d.close - minPrice) / priceRange) * 80;
                        if (isNaN(heightPct)) heightPct = 50;
                        heightPct = Math.max(5, Math.min(100, heightPct)); // Clamp between 5% and 100%

                        // Highlight hovered bar
                        const isHovered = hoveredData === d;
                        const opacityClass = isHovered ? 'opacity-100 brightness-125' : 'opacity-80 hover:opacity-100';

                        return (
                            <div
                                key={i}
                                onMouseEnter={() => setHoveredData(d)}
                                onMouseLeave={() => setHoveredData(lastInterval)} // Revert to last interval on leave
                                className={`group relative flex flex-col justify-end h-full min-w-[3px] w-2 flex-shrink-0 cursor-pointer transition-all ${opacityClass}`}
                            >
                                {/* Bar */}
                                <div
                                    className={`${barColor} rounded-t-sm w-full relative`}
                                    style={{ height: `${heightPct}%` }}
                                >
                                    {isHovered && <div className="absolute inset-0 bg-white/20" />}
                                </div>

                                {/* Invisible hit area extends up */}
                                <div className="absolute inset-0 z-10" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StockCard;
