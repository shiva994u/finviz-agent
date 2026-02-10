"""
Test script for 5-minute interval API functionality
"""
import asyncio
import sys
import os

# Add the finviz_api directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'finviz_api'))

from services.finviz_client import finviz_client


async def test_5min_intervals():
    """Test the 5-minute intervals endpoint"""
    print("Testing 5-minute interval data fetch for COIN...")
    print("=" * 60)
    
    try:
        # Test with single ticker
        result = await finviz_client.get_5min_intervals(["COIN"])
        
        if result:
            ticker_data = result[0]
            print(f"\n✓ Successfully fetched data for {ticker_data['ticker']}")
            print(f"  Date: {ticker_data['date']}")
            print(f"\n  Premarket ({ticker_data['premarket']['interval_count']} intervals):")
            print(f"    Open: ${ticker_data['premarket']['open']:.2f}")
            print(f"    High: ${ticker_data['premarket']['high']:.2f}")
            print(f"    Low: ${ticker_data['premarket']['low']:.2f}")
            print(f"    Close: ${ticker_data['premarket']['close']:.2f}")
            print(f"    Volume: {ticker_data['premarket']['volume']:,}")
            
            print(f"\n  Market Hours ({len(ticker_data['market_hours'])} intervals):")
            if ticker_data['market_hours']:
                first = ticker_data['market_hours'][0]
                last = ticker_data['market_hours'][-1]
                print(f"    First interval: {first['timestamp']}")
                print(f"      Open: ${first['open']:.2f}, Close: ${first['close']:.2f}, Volume: {first['volume']:,}")
                print(f"    Last interval: {last['timestamp']}")
                print(f"      Open: ${last['open']:.2f}, Close: ${last['close']:.2f}, Volume: {last['volume']:,}")
            
            print(f"\n  Post-Market ({ticker_data['postmarket']['interval_count']} intervals):")
            print(f"    Open: ${ticker_data['postmarket']['open']:.2f}")
            print(f"    High: ${ticker_data['postmarket']['high']:.2f}")
            print(f"    Low: ${ticker_data['postmarket']['low']:.2f}")
            print(f"    Close: ${ticker_data['postmarket']['close']:.2f}")
            print(f"    Volume: {ticker_data['postmarket']['volume']:,}")
            
            print("\n" + "=" * 60)
            print("✓ Test PASSED - Data structure is correct!")
        else:
            print("✗ No data returned")
            
    except Exception as e:
        print(f"✗ Test FAILED with error: {e}")
        import traceback
        traceback.print_exc()


async def test_multiple_tickers():
    """Test with multiple tickers"""
    print("\n\nTesting multiple tickers (COIN, TSLA, AAPL)...")
    print("=" * 60)
    
    try:
        result = await finviz_client.get_5min_intervals(["COIN", "TSLA", "AAPL"])
        
        print(f"\n✓ Successfully fetched data for {len(result)} tickers:")
        for ticker_data in result:
            print(f"  - {ticker_data['ticker']}: {ticker_data['date']}")
            print(f"    Market hours intervals: {len(ticker_data['market_hours'])}")
        
        print("\n" + "=" * 60)
        print("✓ Multiple ticker test PASSED!")
        
    except Exception as e:
        print(f"✗ Test FAILED with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("5-Minute Interval API Test Suite")
    print("=" * 60)
    
    # Run tests
    asyncio.run(test_5min_intervals())
    asyncio.run(test_multiple_tickers())
    
    print("\n\nAll tests completed!")
