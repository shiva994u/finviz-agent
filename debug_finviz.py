import asyncio
import traceback
from finviz_api.services.finviz_client import finviz_client

async def main():
    client = finviz_client
    try:
        print("Attempting to fetch top movers...")
        data = await client.get_top_movers()
        print(f"Success! Retrieved {len(data)} records.")
        if data:
            print("Sample record:", data[0])
    except Exception:
        print("Caught exception:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
