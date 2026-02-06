import pytest
from httpx import AsyncClient, ASGITransport
from typing import AsyncGenerator
from finviz_api.main import app
from unittest.mock import MagicMock, patch

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    # Mock the startup event to prevent background task from running
    with patch("finviz_api.main.startup_event", new=MagicMock()):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            yield c
