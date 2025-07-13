#!/usr/bin/env python3
import sys
import json

def main():
    print("Architecture MCP Server starting...", file=sys.stderr)
    
    # Read initialize request
    line = sys.stdin.readline()
    request = json.loads(line)
    
    # Send initialize response
    response = {
        "jsonrpc": "2.0",
        "id": request["id"],
        "result": {
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {}
            },
            "serverInfo": {
                "name": "architecture-server",
                "version": "1.0.0"
            }
        }
    }
    
    print(json.dumps(response), flush=True)
    print("Server initialized", file=sys.stderr)
    
    # Keep running
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
        except KeyboardInterrupt:
            break

if __name__ == "__main__":
    main()
