import asyncio
from .finviz_client import finviz_client
from .cache_service import cache_service
from .websocket_manager import manager

async def update_market_data():
    """
    Periodically fetches data and broadcasts updates.
    """
    while True:
        try:
            # Multi-fetch in parallel could be better, but sequential for now
            earnings = await finviz_client.get_earnings_surprises()
            movers = await finviz_client.get_top_movers()
            
            # Update Cache
            await cache_service.set("earnings", earnings, ttl=10)
            await cache_service.set("top_movers", movers, ttl=10)
            
            # Broadcast updates
            await manager.broadcast({
                "type": "EARNINGS_UPDATE",
                "data": earnings
            })
            await manager.broadcast({
                "type": "MOVERS_UPDATE",
                "data": movers
            })
            
        except Exception as e:
            print(f"Error updating market data: {e}")
            
        await asyncio.sleep(5) # Update every 5 seconds
