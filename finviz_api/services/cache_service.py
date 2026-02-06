from typing import Any, Optional
import time

class CacheService:
    def __init__(self):
        self._cache = {}
        self._ttl = {}

    async def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            if time.time() < self._ttl[key]:
                return self._cache[key]
            else:
                del self._cache[key]
                del self._ttl[key]
        return None

    async def set(self, key: str, value: Any, ttl: int = 60):
        self._cache[key] = value
        self._ttl[key] = time.time() + ttl

cache_service = CacheService()
