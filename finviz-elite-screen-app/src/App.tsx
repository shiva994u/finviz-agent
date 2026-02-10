import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import EarningsPanel from './components/screener/EarningsPanel';
import TopMoversPanel from './components/screener/TopMoversPanel';
import FiveMinEarningsPanel from './components/screener/FiveMinEarningsPanel';
import ScreenerPanel from './components/screener/ScreenerPanel';
import { useMarketStore } from './store/marketStore';

function App() {
  // @ts-ignore
  const { connect } = useMarketStore();

  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/top-movers" replace />} />
        <Route path="/top-movers" element={<div className="h-[calc(100vh-8rem)]"><TopMoversPanel /></div>} />
        <Route path="/earnings" element={<div className="h-[calc(100vh-8rem)]"><EarningsPanel /></div>} />
        <Route path="/5min-earnings" element={<div className="h-[calc(100vh-8rem)]"><FiveMinEarningsPanel /></div>} />
        <Route path="/screener" element={<div className="h-[calc(100vh-8rem)]"><ScreenerPanel /></div>} />
      </Routes>
    </MainLayout>
  )
}

export default App
