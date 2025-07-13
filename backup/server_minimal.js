#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const COT_STRANDS_FILE = path.join(DATA_DIR, 'cot_strands.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize CoT data file
if (!fs.existsSync(COT_STRANDS_FILE)) {
  fs.writeFileSync(COT_STRANDS_FILE, JSON.stringify({
    active_strands: {},
    completed_strands: {},
    strand_counter: 0
  }));
}

function loadCotStrands() {
  try {
    return JSON.parse(fs.readFileSync(COT_STRANDS_FILE, 'utf8'));
  } catch (e) {
    return { active_strands: {}, completed_strands: {}, strand_counter: 0 };
  }
}

function saveCotStrands(strands) {
  fs.writeFileSync(COT_STRANDS_FILE, JSON.stringify(strands, null, 2));
}

// MCP Protocol Handler
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  try {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    const request = JSON.parse(trimmed);
    handleRequest(request);
  } catch (e) {
    if (line.trim()) {
      console.error('Parse error:', e.message);
    }
  }
});

function handleRequest(request) {
  switch (request.method) {
    case 'initialize':
      handleInitialize(request);
      break;
    case 'tools/list':
      handleToolsList(request);
      break;
    case 'tools/call':
      handleToolCall(request);
      break;
    default:
      sendError(request.id, -32601, 'Method not found');
  }
}

function handleInitialize(request) {
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
}

function handleToolsList(request) {
  const tools = [
    {
      name: "create_cot_strand",
      description: "Create new Chain of Thought reasoning strand",
      inputSchema: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Topic or problem being analyzed" },
          initial_thought: { type: "string", description: "Initial reasoning step" }
        },
        required: ["topic", "initial_thought"]
      }
    },
    {
      name: "add_to_strand",
      description: "Add reasoning step to existing CoT strand",
      inputSchema: {
        type: "object",
        properties: {
          strand_id: { type: "string", description: "ID of the strand to extend" },
          thought: { type: "string", description: "Next reasoning step" }
        },
        required: ["strand_id", "thought"]
      }
    },
    {
      name: "list_strands",
      description: "List all active and completed CoT strands",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    }
  ];

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: { tools: tools }
  };
  console.log(JSON.stringify(response));
}

function handleToolCall(request) {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'create_cot_strand':
      handleCreateCotStrand(request, args);
      break;
    case 'add_to_strand':
      handleAddToStrand(request, args);
      break;
    case 'list_strands':
      handleListStrands(request);
      break;
    default:
      sendError(request.id, -32601, 'Tool not found');
  }
}

function handleCreateCotStrand(request, args) {
  const strands = loadCotStrands();
  const { topic, initial_thought } = args;
  
  strands.strand_counter++;
  const strand_id = `strand_${strands.strand_counter}`;
  
  strands.active_strands[strand_id] = {
    id: strand_id,
    topic: topic,
    thoughts: [initial_thought],
    created: new Date().toISOString()
  };
  
  saveCotStrands(strands);

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [{
        type: "text",
        text: `CoT strand '${strand_id}' created for topic: ${topic}`
      }]
    }
  };
  console.log(JSON.stringify(response));
}

function handleAddToStrand(request, args) {
  const strands = loadCotStrands();
  const { strand_id, thought } = args;
  
  if (!strands.active_strands[strand_id]) {
    sendError(request.id, -32602, `Strand ${strand_id} not found`);
    return;
  }
  
  strands.active_strands[strand_id].thoughts.push(thought);
  saveCotStrands(strands);

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [{
        type: "text",
        text: `Added thought to strand ${strand_id}. Total thoughts: ${strands.active_strands[strand_id].thoughts.length}`
      }]
    }
  };
  console.log(JSON.stringify(response));
}

function handleListStrands(request) {
  const strands = loadCotStrands();
  
  const activeList = Object.keys(strands.active_strands).map(id => {
    const strand = strands.active_strands[id];
    return `${id}: ${strand.topic} (${strand.thoughts.length} thoughts)`;
  });
  
  const activeText = activeList.length > 0 ? `Active Strands:\n${activeList.join('\n')}` : 'No active strands';
  
  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [{
        type: "text",
        text: activeText
      }]
    }
  };
  console.log(JSON.stringify(response));
}

function sendError(id, code, message) {
  const response = {
    jsonrpc: "2.0",
    id: id,
    error: { code: code, message: message }
  };
  console.log(JSON.stringify(response));
}

console.error('CoT Architecture Server v10.8 started');
console.error('Chain of Thought tools active');
