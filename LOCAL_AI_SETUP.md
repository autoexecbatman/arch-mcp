# Local AI MCP Server Configuration

Add this to your Claude Desktop config:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users", "D:\\", "D:\\arch_mcp\\"],
      "env": {}
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {"BRAVE_API_KEY": "BSA6BeKFEOu8cNP0tj0QXcaVcknsMKe"}
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "env": {}
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "env": {}
    },
    "architecture-server": {
      "command": "node",
      "args": ["D:\\arch_mcp\\architecture_server.js"],
      "env": {}
    },
    "cot-server": {
      "command": "node",
      "args": ["D:\\arch_mcp\\cot_server.js"],
      "env": {}
    },
    "local-ai-server": {
      "command": "node",
      "args": ["D:\\arch_mcp\\local-ai-server.js"],
      "env": {}
    }
  }
}
```

## Installation

1. Install dependencies:
```bash
cd D:\arch_mcp
npm install
```

2. Ensure Ollama is running:
```bash
ollama serve
```

3. Test the server:
```bash
node local-ai-server.js
```

4. Add to Claude Desktop config and restart

## Available Tools

- **query_local_ai**: Direct queries to local AI models
- **reasoning_assist**: Structured reasoning with specified steps  
- **model_list**: List available local models
- **hybrid_analysis**: Combined local+cloud analysis
- **token_efficient_reasoning**: Delegate heavy reasoning to local AI

## Usage Examples

"Use local AI to reason through this complex problem step by step"
"Query my DeepSeek R1 model about this technical question"
"Show me what local models I have available"
"Perform hybrid analysis on this data using reasoning approach"
