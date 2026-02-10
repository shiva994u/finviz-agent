from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from services.finviz_client import finviz_client


class TickerListRequest(BaseModel):
    """Request model for ticker list"""
    tickers: List[str]

router = APIRouter()

@router.get("/earnings", response_model=List[dict])
async def get_earnings():
    """
    Get real-time earnings surprise data.
    """
    try:
        data = await finviz_client.get_earnings_surprises()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-movers", response_model=List[dict])
async def get_top_movers():
    """
    Get top movers since market open.
    """
    try:
        data = await finviz_client.get_top_movers()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/5min-intervals", response_model=List[dict])
async def get_5min_intervals(request: TickerListRequest):
    """
    Get 5-minute interval data for multiple tickers.
    Segments data into premarket, market hours, and post-market.
    Returns data for current date or last Friday if no current data.
    """
    try:
        if not request.tickers:
            raise HTTPException(status_code=400, detail="Ticker list cannot be empty")
        
        data = await finviz_client.get_5min_intervals(request.tickers)
        return data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching 5min intervals: {e}")
        raise HTTPException(status_code=500, detail=str(e))
