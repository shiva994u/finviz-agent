import React from 'react';
import { type FiveMinData } from '../../services/api';
import { ShieldCheck, BarChart3, AlertTriangle, ArrowUpDown, Activity } from 'lucide-react';

interface IndicatorPanelProps {
    data: FiveMinData | undefined;
}

const IndicatorPanel: React.FC<IndicatorPanelProps> = ({ data }) => {
    if (!data?.analysis) return null;

    const {
        vol_momentum,
        buy_pressure_pct,
        sell_pressure_pct,
        vp_correlation,
        accumulation_detected,
        pv_score
    } = data.analysis;

    // Color helpers
    const getMomentumColor = (m: string) => {
        if (m === "STRONG") return "text-green-400";
        if (m === "MODERATE") return "text-yellow-400";
        return "text-gray-400";
    };

    const getScoreColor = (s: number) => {
        if (s >= 8) return "text-purple-400";
        if (s >= 6) return "text-green-400";
        if (s >= 4) return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#1A1A1A] p-2 mt-2 border-t border-white/5 text-[10px]">

            {/* 1. Momentum */}
            <div className="flex flex-col border-r border-white/5 pr-2">
                <span className="text-gray-500 mb-1 flex items-center gap-1">
                    <Activity size={10} /> Vol Momentum
                </span>
                <span className={`font-bold ${getMomentumColor(vol_momentum)}`}>{vol_momentum}</span>
            </div>

            {/* 2. PV Score */}
            <div className="flex flex-col border-r border-white/5 px-2">
                <span className="text-gray-500 mb-1 flex items-center gap-1">
                    <ShieldCheck size={10} /> PV Score
                </span>
                <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${getScoreColor(pv_score)}`}>{pv_score}/10</span>
                </div>
            </div>

            {/* 3. Buy/Sell Pressure */}
            <div className="flex flex-col border-r border-white/5 px-2 w-full">
                <span className="text-gray-500 mb-1 flex items-center gap-1">
                    <ArrowUpDown size={10} /> Buy/Sell Press.
                </span>
                <div className="w-full">
                    <div className="flex justify-between text-[9px] mb-0.5">
                        <span className="text-green-400">{buy_pressure_pct}%</span>
                        <span className="text-red-400">{sell_pressure_pct}%</span>
                    </div>
                    <div className="flex h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full" style={{ width: `${buy_pressure_pct}%` }} />
                        <div className="bg-red-500 h-full" style={{ width: `${sell_pressure_pct}%` }} />
                    </div>
                </div>
            </div>

            {/* 4. Alerts / Correlation */}
            <div className="flex flex-col pl-2 justify-center">
                <span className="text-gray-500 mb-1 flex items-center gap-1">
                    <BarChart3 size={10} /> Signals
                </span>
                <div className="flex flex-col gap-1">
                    {accumulation_detected && (
                        <span className="bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded border border-blue-500/30 flex items-center gap-1 text-[9px] w-fit">
                            <AlertTriangle size={8} /> Acc Detect
                        </span>
                    )}
                    <span className={`${vp_correlation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        Corr: {vp_correlation > 0 ? '+' : ''}{vp_correlation}
                    </span>
                </div>
            </div>

        </div>
    );
};

export default IndicatorPanel;
