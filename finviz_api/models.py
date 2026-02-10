from pydantic import BaseModel
from typing import List


class IntervalData(BaseModel):
    """Represents a single 5-minute interval with OHLCV data."""
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class ConsolidatedData(BaseModel):
    """Represents consolidated data for a time segment (premarket/postmarket)."""
    open: float
    high: float
    low: float
    close: float
    volume: int
    interval_count: int


class TickerIntervalResponse(BaseModel):
    """Response model for a single ticker's 5-minute interval data."""
    ticker: str
    date: str
    premarket: ConsolidatedData
    market_hours: List[IntervalData]
    postmarket: ConsolidatedData
