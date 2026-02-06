import React, { useEffect, useState } from 'react';
import { fetchTopMovers, type MoverData as ApiMoverData } from '../../services/api';

// Data Interface - Keep simplified without history since chart is removed
interface MoverData extends ApiMoverData {
    // history: { value: number }[]; // Removed as requested
}

const MoverRow = ({ item, isPositive }: { item: MoverData; isPositive: boolean }) => {
    return (
        <div className="flex items-center px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors group">
            <div className="w-[35%] md:w-[26%] font-bold text-white text-lg tracking-wide flex items-center gap-2">
                {item.ticker}
                <span className="text-xs font-normal text-gray-500 truncate max-w-[250px] hidden sm:block">{item.company}</span>
            </div>
            <div className="hidden md:block md:w-[12%] text-gray-400 text-sm truncate pr-2">
                {item.industry}
            </div>
            <div className="w-[20%] md:w-[8%] font-mono text-lg font-medium text-white text-right pr-2 md:pr-4">
                ${item.open.toFixed(2)}
            </div>
            <div className="w-[20%] md:w-[8%] font-mono text-lg font-medium text-white text-right pr-2 md:pr-8">
                ${item.price.toFixed(2)}
            </div>
            <div className={`w-[25%] md:w-[10%] font-mono text-lg font-medium text-right pr-2 md:pr-4 ${isPositive ? 'text-[#bef264]' : 'text-[#ef4444]'}`}>
                {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
            </div>
            <div className="hidden md:block md:w-[13%] text-gray-400 text-sm truncate pr-2 text-right">
                {item.volume.toLocaleString()}
            </div>
            <div className="hidden md:block md:w-[13%] text-gray-500 text-sm truncate pr-2 text-right">
                {item.averageVolume.toLocaleString()}
            </div>
            <div className="hidden md:block md:w-[10%] font-mono text-sm text-gray-400 text-right pr-4">
                {item.volatilityWeek.toFixed(2)}%
            </div>
        </div>
    );
};

const TopMoversPanel: React.FC = () => {
    const [data, setData] = useState<MoverData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [excludeETFs, setExcludeETFs] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof MoverData | null; direction: 'asc' | 'desc' }>({ key: 'changePercent', direction: 'desc' });

    const loadData = async () => {
        try {
            const movers = await fetchTopMovers();
            setData(movers);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 60000); // 60s refresh
        return () => clearInterval(interval);
    }, []);

    const handleSort = (key: keyof MoverData) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredData = React.useMemo(() => {
        let processedData = [...data];

        // Filter by Text
        if (filterText) {
            const lowerFilter = filterText.toLowerCase();
            processedData = processedData.filter(item =>
                item.ticker.toLowerCase().includes(lowerFilter) ||
                item.company.toLowerCase().includes(lowerFilter) ||
                item.industry.toLowerCase().includes(lowerFilter)
            );
        }

        // Filter by Price Range
        if (minPrice) {
            const min = parseFloat(minPrice);
            if (!isNaN(min)) {
                processedData = processedData.filter(item => item.price >= min);
            }
        }
        if (maxPrice) {
            const max = parseFloat(maxPrice);
            if (!isNaN(max)) {
                processedData = processedData.filter(item => item.price <= max);
            }
        }

        // Filter ETFs
        if (excludeETFs) {
            processedData = processedData.filter(item => item.industry !== 'Exchange Traded Fund');
        }

        // Sort
        if (sortConfig.key) {
            processedData.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return processedData;
    }, [data, filterText, minPrice, maxPrice, excludeETFs, sortConfig]);

    const displayedData = sortedAndFilteredData.slice(0, 100);

    const SortIcon = ({ columnKey }: { columnKey: keyof MoverData }) => {
        if (sortConfig.key !== columnKey) return <span className="text-gray-600 ml-1">⇅</span>;
        return <span className="text-electric-lime ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="glass-panel h-full flex flex-col overflow-hidden bg-[#1e1e24]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 glass-header shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl text-white font-semibold tracking-tight whitespace-nowrap flex items-center gap-2">
                    <span className="text-2xl">🚀</span> Top Movers Since Open
                </h2>

                <div className="flex flex-wrap items-center gap-3 flex-1 justify-end w-full sm:w-auto">
                    {/* ETF Toggle */}
                    <button
                        onClick={() => setExcludeETFs(!excludeETFs)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${excludeETFs
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-black/20 text-gray-400 border-white/10 hover:bg-white/5'
                            }`}
                    >
                        {excludeETFs ? 'No ETFs' : 'Inc. ETFs'}
                    </button>

                    {/* Price Range Inputs */}
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            className="w-20 bg-black/20 border border-white/10 rounded-lg py-1.5 px-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-electric-lime/50 focus:ring-1 focus:ring-electric-lime/20 transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="Min $"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="number"
                            className="w-20 bg-black/20 border border-white/10 rounded-lg py-1.5 px-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-electric-lime/50 focus:ring-1 focus:ring-electric-lime/20 transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="Max $"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>

                    {/* Search Input */}
                    <div className="relative group max-w-xs w-full sm:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">🔍</span>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-black/20 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-electric-lime/50 focus:ring-1 focus:ring-electric-lime/20 transition-all"
                            placeholder="Filter ticker, company..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                    <div className="text-xs text-gray-500 font-mono whitespace-nowrap hidden md:block">
                        {loading ? 'Updating...' : `${sortedAndFilteredData.length} items`}
                    </div>
                </div>
            </div>

            {/* Column Headers */}
            {/* Column Headers */}
            <div className="flex px-4 py-3 text-xs uppercase tracking-wider text-gray-400 font-bold shrink-0 bg-black/20 border-b border-white/5 select-none">
                <div
                    className="w-[35%] md:w-[26%] cursor-pointer hover:text-white transition-colors flex items-center"
                    onClick={() => handleSort('ticker')}
                >
                    Ticker <span className="hidden sm:inline">/ Company</span> <SortIcon columnKey="ticker" />
                </div>
                <div
                    className="hidden md:flex md:w-[12%] cursor-pointer hover:text-white transition-colors items-center"
                    onClick={() => handleSort('industry')}
                >
                    Industry <SortIcon columnKey="industry" />
                </div>
                <div
                    className="w-[20%] md:w-[8%] text-right pr-2 md:pr-4 cursor-pointer hover:text-white transition-colors flex items-center justify-end"
                    onClick={() => handleSort('open')}
                >
                    <span className="md:hidden">Open</span><span className="hidden md:inline">$Open</span> <SortIcon columnKey="open" />
                </div>
                <div
                    className="w-[20%] md:w-[8%] text-right pr-2 md:pr-8 cursor-pointer hover:text-white transition-colors flex items-center justify-end"
                    onClick={() => handleSort('price')}
                >
                    <span className="md:hidden">Price</span><span className="hidden md:inline">Last Price</span> <SortIcon columnKey="price" />
                </div>
                <div
                    className="w-[25%] md:w-[10%] text-right pr-2 md:pr-4 cursor-pointer hover:text-white transition-colors flex items-center justify-end"
                    onClick={() => handleSort('changePercent')}
                >
                    <span className="md:hidden">% Chg</span><span className="hidden md:inline">% Change</span> <SortIcon columnKey="changePercent" />
                </div>
                <div
                    className="hidden md:flex md:w-[13%] text-right pr-4 cursor-pointer hover:text-white transition-colors items-center justify-end"
                    onClick={() => handleSort('volume')}
                >
                    Volume <SortIcon columnKey="volume" />
                </div>
                <div
                    className="hidden md:flex md:w-[13%] text-right pr-4 cursor-pointer hover:text-white transition-colors items-center justify-end"
                    onClick={() => handleSort('averageVolume')}
                >
                    Avg Vol <SortIcon columnKey="averageVolume" />
                </div>
                <div
                    className="hidden md:flex md:w-[10%] text-right pr-4 cursor-pointer hover:text-white transition-colors items-center justify-end"
                    onClick={() => handleSort('volatilityWeek')}
                >
                    Volatility <SortIcon columnKey="volatilityWeek" />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 min-h-0 relative w-full h-full overflow-y-auto custom-scrollbar">
                {loading && data.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 animate-pulse">Loading market data...</div>
                ) : displayedData.length > 0 ? (
                    <div className="flex flex-col">
                        {displayedData.map((item, index) => (
                            <MoverRow
                                key={item.ticker || index}
                                item={item}
                                isPositive={item.changePercent >= 0}
                            />
                        ))}
                        {sortedAndFilteredData.length > 100 && (
                            <div className="p-4 text-center text-xs text-gray-500 border-t border-white/5">
                                Showing top 100 of {sortedAndFilteredData.length} matches.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">No stocks found matching criteria.</div>
                )}
            </div>
        </div >
    );
};

export default TopMoversPanel;
