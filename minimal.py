import sys
import json

def main():
    # Read initialize request
    line = sys.stdin.readline()
    request = json.loads(line)
    
    # Send initialize response
    response = {
        "jsonrpc": "2.0",
        "id": request["id"],
        "result": {
            "protocolVersion": "2024-11-05",
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "architecture-server", "version": "1.0.0"}
        }
    }
    print(json.dumps(response))
    sys.stdout.flush()
    
    # Keep server alive
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
        except:
            break

if __name__ == "__main__":
    main()
