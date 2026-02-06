from fastapi import APIRouter, HTTPException
from typing import List
from ..services.finviz_client import finviz_client

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
        print(f"Error fetching top movers: {e}")
        raise HTTPException(status_code=500, detail=str(e))
