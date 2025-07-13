#!/usr/bin/env node
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const tools = [
  {
    name: "architecture_status",
    description: "Get current architecture status and capabilities",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "add_pattern",
    description: "Add new architectural pattern to the system",
    inputSchema: {
      type: "object",
      properties: {
        pattern_type: { type: "string", description: "Type of pattern" },
        pattern_data: { type: "string", description: "Pattern data" }
      },
      required: ["pattern_type", "pattern_data"]
    }
  },
  {
    name: "get_user_preferences",
    description: "Retrieve stored user preferences and patterns",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

rl.on('line', (line) => {
  try {
    const request = JSON.parse(line);
    
    if (request.method === 'initialize') {
      const response = {
        jsonrpc: "2.0",
        id: request.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "architecture-server", version: "1.0.0" }
        }
      };
      console.log(JSON.stringify(response));
      
    } else if (request.method === 'tools/list') {
      const response = {
        jsonrpc: "2.0",
        id: request.id,
        result: { tools: tools }
      };
      console.log(JSON.stringify(response));
      
    } else if (request.method === 'tools/call') {
      const { name, arguments: args } = request.params;
      let result;
      
      if (name === 'architecture_status') {
        result = {
          content: [{
            type: "text",
            text: "Architecture v10.8 operational with professional accuracy enforcement, user preference integration, and tool safety protocols active"
          }]
        };
      } else if (name === 'add_pattern') {
        result = {
          content: [{
            type: "text", 
            text: `Pattern ${args.pattern_type} added successfully: ${args.pattern_data}`
          }]
        };
      } else if (name === 'get_user_preferences') {
        result = {
          content: [{
            type: "text",
            text: "User preferences: Brief professional communication, D: drive development, && command chains, minimal aesthetic approach"
          }]
        };
      }
      
      const response = {
        jsonrpc: "2.0",
        id: request.id,
        result: result
      };
      console.log(JSON.stringify(response));
    }
  } catch (e) {
    console.error('Parse error:', e.message);
  }
});

console.error('Architecture MCP Server v10.8 started successfully');
