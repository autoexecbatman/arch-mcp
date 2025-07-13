#!/usr/bin/env python3
import sys
import json
import asyncio

async def main():
    print("Architecture server starting", file=sys.stderr)
    
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
                
            request = json.loads(line.strip())
            print(f"Received: {request['method']}", file=sys.stderr)
            
            if request.get("method") == "initialize":
                response = {
                    "jsonrpc": "2.0",
                    "id": request["id"],
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {"tools": {}},
                        "serverInfo": {"name": "architecture-server", "version": "1.0.0"}
                    }
                }
                print(json.dumps(response), flush=True)
                print("Initialized", file=sys.stderr)
                
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    asyncio.run(main())
