import React from 'react';
import * as ReactWindow from 'react-window';
import * as AutoSizerPkg from 'react-virtualized-auto-sizer';
import { Filter, ChevronDown, Search } from 'lucide-react';

const List = (ReactWindow as any).FixedSizeList || (ReactWindow as any).default?.FixedSizeList;
const AutoSizer = (AutoSizerPkg as any).default || (AutoSizerPkg as any).AutoSizer;

// Mock Data Types
interface ScreenerData {
    ticker: string;
    company: string;
    sector: string;
    marketCap: string;
    pe: number;
    price: number;
    change: number;
    volume: string;
}

// Generate Mock Data
const generateMockData = (count: number): ScreenerData[] => {
    const sectors = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer Discretionary'];
    return Array.from({ length: count }, (_, i) => {
        const price = Math.random() * 1000 + 10;
        return {
            ticker: ["AAPL", "NVDA", "MSFT", "AMZN", "GOOGL", "TSLA", "META", "AMD", "NFLX", "INTC"][i % 10] + (i > 9 ? i : ""),
            company: `Company ${i}`,
            sector: sectors[i % sectors.length],
            marketCap: (Math.random() * 2000 + 10).toFixed(1) + 'B',
            pe: parseFloat((Math.random() * 50 + 5).toFixed(2)),
            price: parseFloat(price.toFixed(2)),
            change: parseFloat(((Math.random() - 0.45) * 5).toFixed(2)),
            volume: (Math.random() * 50 + 1).toFixed(1) + 'M',
        };
    });
};

const mockData = generateMockData(200);

const ScreenerRow = ({ index, style, data }: { index: number; style: React.CSSProperties; data: ScreenerData[] }) => {
    const item = data[index];
    const isPositive = item.change >= 0;

    return (
        <div style={style} className="flex items-center px-4 border-b border-white/5 hover:bg-white/5 transition-colors group text-sm">
            <div className="w-[10%] font-bold text-white tracking-wide">{item.ticker}</div>
            <div className="w-[20%] text-gray-400 truncate pr-2">{item.company}</div>
            <div className="w-[15%] text-gray-300">{item.sector}</div>
            <div className="w-[10%] text-gray-300 text-right pr-4">{item.marketCap}</div>
            <div className="w-[10%] text-gray-300 text-right pr-4">{item.pe}</div>
            <div className="w-[10%] font-mono text-white text-right pr-4">${item.price.toFixed(2)}</div>
            <div className={`w-[10%] font-mono font-medium text-right pr-4 ${isPositive ? 'text-[#bef264]' : 'text-[#ef4444]'}`}>
                {isPositive ? '+' : ''}{item.change}%
            </div>
            <div className="w-[15%] text-gray-300 text-right font-mono">{item.volume}</div>
        </div>
    );
};

const FilterPill = ({ label, active = false }: { label: string; active?: boolean }) => (
    <button className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${active
        ? 'bg-[#bef264]/20 text-[#bef264] border border-[#bef264]/30 shadow-[0_0_10px_rgba(190,242,100,0.1)]'
        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
        }`}>
        <span>{label}</span>
        <ChevronDown size={12} />
    </button>
);

const ScreenerPanel: React.FC = () => {
    return (
        <div className="glass-panel h-full flex flex-col overflow-hidden bg-[#1e1e24]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl">
            {/* Header / Filter Bar */}
            <div className="p-4 border-b border-white/10 flex flex-col gap-4 shrink-0">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl text-white font-semibold tracking-tight flex items-center gap-2">
                        <Filter size={20} className="text-[#bef264]" />
                        Stock Screener
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search tickers..."
                            className="bg-black/30 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-[#bef264]/50 transition-colors w-64"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    <FilterPill label="Sector: Technology" active />
                    <FilterPill label="Market Cap: Large ($10B+)" active />
                    <FilterPill label="Index: S&P 500" />
                    <FilterPill label="P/E: < 25" />
                    <FilterPill label="Volume: > 1M" />
                    <div className="h-4 w-px bg-white/10 mx-2"></div>
                    <button className="text-xs text-[#bef264] hover:text-[#d9f99d] transition-colors font-medium">
                        + Add Filter
                    </button>
                </div>
            </div>

            {/* Column Headers */}
            <div className="flex px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold shrink-0 bg-black/20 border-b border-white/5">
                <div className="w-[10%]">Ticker</div>
                <div className="w-[20%]">Company</div>
                <div className="w-[15%]">Sector</div>
                <div className="w-[10%] text-right pr-4">Mkt Cap</div>
                <div className="w-[10%] text-right pr-4">P/E</div>
                <div className="w-[10%] text-right pr-4">Price</div>
                <div className="w-[10%] text-right pr-4">Change</div>
                <div className="w-[15%] text-right">Volume</div>
            </div>

            {/* List Content */}
            <div className="flex-1 min-h-0 relative">
                <AutoSizer>
                    {({ height, width }: { height: number; width: number }) => (
                        <List
                            height={height}
                            width={width}
                            itemCount={mockData.length}
                            itemSize={48}
                            className="custom-scrollbar"
                            itemData={mockData}
                        >
                            {ScreenerRow}
                        </List>
                    )}
                </AutoSizer>
            </div>
        </div>
    );
};

export default ScreenerPanel;
