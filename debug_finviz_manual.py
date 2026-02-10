import asyncio
import httpx
import csv
import io
from datetime import datetime, timedelta
import sys
import os

# Add project root to sys.path to import config
current_dir = os.path.dirname(os.path.abspath(__file__))
# from core.config import settings

async def debug_finviz_fetch(ticker="COIN"):
    print(f"\n{'='*60}")
    print(f"MANUAL DEBUG: Fetching 5-min data for {ticker}")
    print(f"{'='*60}")

    # Hardcoded key for debugging to avoid path issues
    api_key = "730d209f-e9bd-4861-882d-9fb1b5dd5382" 
    if not api_key:
        print("ERROR: API Key not found in settings!")
        return

    url = "https://elite.finviz.com/quote_export.ashx"
    params = {
        "t": ticker,
        "ty": "c",
        "p": "i5",
        "b": "1",
        "auth": api_key
    }

    print(f"DEBUG: URL: {url}")
    print(f"DEBUG: Params: {params}")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            print(f"DEBUG: Status Code: {response.status_code}")
            
            if response.status_code != 200:
                print(f"ERROR: Failed to fetch data. Body: {response.text}")
                return

            content = response.content.decode("utf-8")
            print(f"DEBUG: Content Length: {len(content)} bytes")
            
            # Print first 5 lines of raw content
            print("\nDEBUG: Raw CSV Content (First 5 lines):")
            lines = content.split('\n')
            for i, line in enumerate(lines[:5]):
                print(f"Line {i}: {repr(line)}")

            # Parse CSV
            reader = csv.DictReader(io.StringIO(content))
            raw_data = list(reader)
            print(f"\nDEBUG: Parsed {len(raw_data)} rows.")

            if not raw_data:
                print("ERROR: No rows parsed.")
                return

            print(f"DEBUG: First Row Keys: {list(raw_data[0].keys())}")
            print(f"DEBUG: First Row Data: {raw_data[0]}")
            
            # --- DATE LOGIC DEBUG ---
            print("\n" + "-"*30)
            print("DATE LOGIC SIMULATION (UPDATED)")
            print("-" * 30)
            
            dates_in_raw_data = set()
            for row in raw_data:
                # Handle variable column names
                ts = row.get("Date/Time", "").strip()
                if not ts:
                    ts = row.get("Date", "").strip()
                
                if ts:
                    dt = None
                    # Try parsing with multiple formats
                    for fmt in ["%m/%d/%Y %H:%M", "%m/%d/%Y %I:%M %p", "%m/%d/%Y %H:%M %p"]:
                        try:
                            dt = datetime.strptime(ts, fmt)
                            dates_in_raw_data.add(dt.date())
                            break
                        except ValueError:
                            continue
                    
                    if not dt:
                        print(f"Parse Error for '{ts}': Tried 24h and 12h formats")
                    
                    # DEBUG PM PARSING
                    if dt and "PM" in ts.upper():
                         print(f"DEBUG PM: '{ts}'Parsed as: {dt} (Hour={dt.hour})")
            
            sorted_dates = sorted(dates_in_raw_data, reverse=True)
            print(f"DEBUG: Unique Dates in Data: {sorted_dates}")
            
            now = datetime.now()
            current_date = now.date()
            weekday = current_date.weekday()
            print(f"DEBUG: System Date: {current_date} (Weekday: {weekday})")
            
            TRADE_DATE = None
            
            if weekday >= 5: # Weekend
                days_to_subtract = weekday - 4
                target_friday = current_date - timedelta(days=days_to_subtract)
                print(f"DEBUG: Weekend Logic -> Calc Last Fri: {target_friday}")
                
                if target_friday in sorted_dates:
                    TRADE_DATE = target_friday
                    print(f"RESULT: Found Last Friday data ({TRADE_DATE})")
                else:
                    print(f"RESULT: Last Friday ({target_friday}) NOT in data.")
            else:
                print(f"DEBUG: Weekday Logic")
                if current_date in sorted_dates:
                    TRADE_DATE = current_date
                    print(f"RESULT: Found Today's data ({TRADE_DATE})")
                else:
                    print(f"RESULT: Today ({current_date}) NOT in data.")

            if TRADE_DATE:
                print(f"\nSUCCESS: Selected TRADE_DATE = {TRADE_DATE}")
                
                # --- TIME SEGMENTATION DEBUG ---
                print("\n" + "-"*30)
                print("TIME SEGMENTATION SIMULATION")
                print("-" * 30)
                
                premarket_count = 0
                market_count = 0
                postmarket_count = 0
                
                for row in raw_data:
                    ts = row.get("Date/Time", "").strip() or row.get("Date", "").strip()
                    if not ts: continue
                    
                    try:
                        dt = None
                        for fmt in ["%m/%d/%Y %H:%M", "%m/%d/%Y %I:%M %p", "%m/%d/%Y %H:%M %p"]:
                            try:
                                dt = datetime.strptime(ts, fmt)
                                break
                            except ValueError:
                                continue
                        
                        if dt and dt.date() == TRADE_DATE:
                            time = dt.time()
                            hour = time.hour
                            minute = time.minute
                            
                            # Premarket: 4:00 AM - 9:30 AM
                            if (hour == 4 and minute >= 0) or (5 <= hour < 9) or (hour == 9 and minute < 30):
                                premarket_count += 1
                            # Market hours: 9:30 AM - 4:00 PM (16:00)
                            elif (hour == 9 and minute >= 30) or (10 <= hour < 16):
                                market_count += 1
                            # Post-market: 4:00 PM - 6:00 PM (18:00)
                            elif (16 <= hour < 18):
                                postmarket_count += 1
                    except:
                        continue
                
                print(f"Premarket (4:00-9:30): {premarket_count} intervals")
                print(f"Market (9:30-16:00): {market_count} intervals")
                print(f"Postmarket (16:00-18:00): {postmarket_count} intervals")
                
                # --- INDICATOR VERIFICATION ---
                print("\n" + "-"*30)
                print("INDICATOR CALCULATION VERIFICATION")
                print("-" * 30)
                
                # Filter just market hours for calculation
                market_intervals = []
                for row in raw_data:
                    ts = row.get("Date/Time", "").strip() or row.get("Date", "").strip()
                    if not ts: continue
                    try:
                        dt = None
                        for fmt in ["%m/%d/%Y %H:%M", "%m/%d/%Y %I:%M %p", "%m/%d/%Y %H:%M %p"]:
                            try:
                                dt = datetime.strptime(ts, fmt)
                                break
                            except: continue
                        
                        if dt and dt.date() == TRADE_DATE:
                            # Market hours check
                            time = dt.time()
                            hour = time.hour
                            minute = time.minute
                            if (hour == 9 and minute >= 30) or (10 <= hour < 16):
                                market_intervals.append({
                                    "close": float(row.get("Close", 0)),
                                    "volume": float(row.get("Volume", 0)),
                                    "high": float(row.get("High", 0)),
                                    "low": float(row.get("Low", 0)),
                                    "open": float(row.get("Open", 0))
                                })
                    except: continue

                if market_intervals:
                    print(f"Calculating metrics on {len(market_intervals)} market intervals...")
                    # 1. Volume Momentum
                    vols = [i["volume"] for i in market_intervals]
                    short = sum(vols[-3:]) / 3 if len(vols) >= 3 else 0
                    long = sum(vols[-20:]) / 20 if len(vols) >= 20 else sum(vols)/len(vols)
                    ratio = short / long if long > 0 else 0
                    print(f"1. Vol Momentum: Ratio={ratio:.2f} ({'STRONG' if ratio>1.5 else 'MODERATE' if ratio>1 else 'WEAK'})")
                    
                    # 2. Buy/Sell Pressure
                    buy_vol = 0
                    sell_vol = 0
                    for i in market_intervals:
                        rng = i['high'] - i['low']
                        v = i['volume']
                        if rng == 0:
                            if i['close'] > i['open']: buy_vol += v
                            elif i['close'] < i['open']: sell_vol += v
                            else: buy_vol += v*0.5; sell_vol += v*0.5
                        else:
                            bv = v * ((i['close'] - i['low']) / rng)
                            buy_vol += bv
                            sell_vol += (v - bv)
                    total = buy_vol + sell_vol
                    print(f"2. Pressure: Buy={buy_vol/total*100:.1f}%, Sell={sell_vol/total*100:.1f}%")
                    
                    # 3. PV Score (Rough calc)
                    print(f"3. PV Score logic check: (Close > SMA20?) -> {market_intervals[-1]['close'] > (sum([x['close'] for x in market_intervals[-20:]])/20 if len(market_intervals)>=20 else 0)}")
                else:
                    print("No market intervals found to calculate indicators.")
                
            else:
                print(f"\nFAILURE: Could not determine TRADE_DATE.")
                if sorted_dates:
                    print(f"Fallback suggestion: Use {sorted_dates[0]}")

    except Exception as e:
        print(f"EXCEPTION: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_finviz_fetch())
