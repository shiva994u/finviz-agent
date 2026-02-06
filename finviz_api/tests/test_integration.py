import pytest
import os
from finviz_api.services.finviz_client import finviz_client

# Only run if explicitly requested or environment allows, as it hits real API
@pytest.mark.skipif(os.getenv("REAL_API_TEST") != "true", reason="Skipping real API test")
@pytest.mark.asyncio
async def test_real_finviz_connection():
    # Attempt to fetch top movers matching the user's provided logic
    movers = await finviz_client.get_top_movers()
    assert len(movers) > 0
    first = movers[0]
    assert "ticker" in first
    assert "price" in first
    print(f"Successfully fetched {len(movers)} movers. First: {first['ticker']} @ {first['price']}")
