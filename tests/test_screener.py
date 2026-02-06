import pytest
from httpx import AsyncClient
from unittest.mock import patch

@pytest.mark.asyncio
async def test_get_earnings(client: AsyncClient):
    mock_data = [{"ticker": "AAPL", "epsSurprise": 10.5, "isBeat": True, "sentiment": 80}]
    
    with patch("finviz_api.services.finviz_client.finviz_client.get_earnings_surprises", side_effect=lambda: mock_data):
        response = await client.get("/api/screener/earnings")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["ticker"] == "AAPL"

@pytest.mark.asyncio
async def test_get_top_movers(client: AsyncClient):
    mock_data = [{"ticker": "TSLA", "price": 200.0, "changePercent": 5.0, "history": []}]
    
    with patch("finviz_api.services.finviz_client.finviz_client.get_top_movers", side_effect=lambda: mock_data):
        # Note: The router prefix is /api/screener
        response = await client.get("/api/screener/top-movers") 
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["ticker"] == "TSLA"
