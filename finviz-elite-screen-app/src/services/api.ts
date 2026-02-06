export interface MoverData {
    ticker: string;
    price: number;
    changePercent: number;
    volume: number;
    sector: string;
    industry: string;
    company: string;
    open: number;
    volatilityWeek: number;
    relativeVolume: number;
    averageVolume: number;
    newsTime: string;
    newsTitle: string;
}

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const fetchTopMovers = async (): Promise<MoverData[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/screener/top-movers`);
        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorBody = await response.json();
                errorMessage = errorBody.detail || JSON.stringify(errorBody);
            } catch {
                errorMessage = await response.text();
            }
            throw new Error(`API Error: ${response.status} ${errorMessage}`);
        }
        const data = await response.json();
        
        // Transform the normalized API response to our interface
        return data.map((item: any) => {
            const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0');
            const open = typeof item.open === 'number' ? item.open : parseFloat(item.open || '0');
            const changePercent = open !== 0 ? ((price - open) / open) * 100 : 0;

            return {
                ticker: item.ticker || '',
                company: item.company || '',
                price,
                changePercent,
                volume: typeof item.volume === 'number' ? item.volume : parseFloat(item.volume || '0'),
                sector: item.sector || '',
                industry: item.industry || '',
                open,
                volatilityWeek: typeof item['volatility_(week)'] === 'number' ? item['volatility_(week)'] : parseFloat(item['volatility_(week)'] || '0'),
                relativeVolume: typeof item.relative_volume === 'number' ? item.relative_volume : parseFloat(item.relative_volume || '0'),
                averageVolume: (typeof item.average_volume === 'number' ? item.average_volume : parseFloat(item.average_volume || '0')) * 1000,
                newsTime: item.news_time || '',
                newsTitle: item.news_title || ''
            };
        });
    } catch (error) {
        console.error("Failed to fetch top movers:", error);
        return [];
    }
};

export const fetchEarnings = async (): Promise<MoverData[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/screener/earnings`);
        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorBody = await response.json();
                errorMessage = errorBody.detail || JSON.stringify(errorBody);
            } catch {
                errorMessage = await response.text();
            }
            throw new Error(`API Error: ${response.status} ${errorMessage}`);
        }
        const data = await response.json();
        
        // Transform the normalized API response to our interface
        return data.map((item: any) => {
            const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0');
            const open = typeof item.open === 'number' ? item.open : parseFloat(item.open || '0');
            const changePercent = open !== 0 ? ((price - open) / open) * 100 : 0;

            return {
                ticker: item.ticker || '',
                company: item.company || '',
                price,
                changePercent,
                volume: typeof item.volume === 'number' ? item.volume : parseFloat(item.volume || '0'),
                sector: item.sector || '',
                industry: item.industry || '',
                open,
                volatilityWeek: typeof item['volatility_(week)'] === 'number' ? item['volatility_(week)'] : parseFloat(item['volatility_(week)'] || '0'),
                relativeVolume: typeof item.relative_volume === 'number' ? item.relative_volume : parseFloat(item.relative_volume || '0'),
                averageVolume: (typeof item.average_volume === 'number' ? item.average_volume : parseFloat(item.average_volume || '0')) * 1000,
                newsTime: item.news_time || '',
                newsTitle: item.news_title || ''
            };
        });
    } catch (error) {
        console.error("Failed to fetch earnings:", error);
        return [];
    }
};
