#!/usr/bin/env python3
import sys
import json

def send_response(response):
    print(json.dumps(response), flush=True)

def main():
    print("Architecture MCP Server starting", file=sys.stderr)
    
    for line in sys.stdin:
        try:
            request = json.loads(line.strip())
            
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
                send_response(response)
                
            elif request.get("method") == "tools/list":
                response = {
                    "jsonrpc": "2.0",
                    "id": request["id"],
                    "result": {
                        "tools": [{
                            "name": "architecture_status",
                            "description": "Get architecture status",
                            "inputSchema": {"type": "object", "properties": {}}
                        }]
                    }
                }
                send_response(response)
                
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
