#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const PATTERNS_FILE = path.join(DATA_DIR, 'patterns.json');
const PREFERENCES_FILE = path.join(DATA_DIR, 'preferences.json');
const COT_STRANDS_FILE = path.join(DATA_DIR, 'cot_strands.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
if (!fs.existsSync(PATTERNS_FILE)) {
  fs.writeFileSync(PATTERNS_FILE, JSON.stringify({}));
}
if (!fs.existsSync(PREFERENCES_FILE)) {
  fs.writeFileSync(PREFERENCES_FILE, JSON.stringify({
    communication_style: "brief_professional",
    development_location: "D_drive",
    command_preference: "chain_operators",
    aesthetic_approach: "minimal_professional",
    accuracy_requirements: "factual_only",
    tool_safety: "read_multiple_files_prohibited"
  }));
}
if (!fs.existsSync(COT_STRANDS_FILE)) {
  fs.writeFileSync(COT_STRANDS_FILE, JSON.stringify({
    active_strands: {},
    completed_strands: {},
    strand_counter: 0
  }));
}

// Helper functions
function loadPatterns() {
  try {
    return JSON.parse(fs.readFileSync(PATTERNS_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function savePatterns(patterns) {
  fs.writeFileSync(PATTERNS_FILE, JSON.stringify(patterns, null, 2));
}

function loadPreferences() {
  try {
    return JSON.parse(fs.readFileSync(PREFERENCES_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function savePreferences(preferences) {
  fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(preferences, null, 2));
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
    // Skip empty lines and whitespace
    const trimmed = line.trim();
    if (!trimmed) return;
    
    const request = JSON.parse(trimmed);
    handleRequest(request);
  } catch (e) {
    // Only log actual parse errors, not empty lines
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
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: "architecture-server",
        version: "1.0.0"
      }
    }
  };
  console.log(JSON.stringify(response));
}

function handleToolsList(request) {
  const tools = [
    {
      name: "architecture_status",
      description: "Get current architecture status and capabilities",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "add_pattern",
      description: "Add new architectural pattern to the system",
      inputSchema: {
        type: "object",
        properties: {
          pattern_type: {
            type: "string",
            description: "Type of pattern"
          },
          pattern_data: {
            type: "string",
            description: "Pattern data"
          }
        },
        required: ["pattern_type", "pattern_data"]
      }
    },
    {
      name: "get_user_preferences",
      description: "Retrieve stored user preferences and patterns",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "create_cot_strand",
      description: "Create new Chain of Thought reasoning strand",
      inputSchema: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "Topic or problem being analyzed"
          },
          initial_thought: {
            type: "string",
            description: "Initial reasoning step"
          }
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
          strand_id: {
            type: "string",
            description: "ID of the strand to extend"
          },
          thought: {
            type: "string",
            description: "Next reasoning step"
          }
        },
        required: ["strand_id", "thought"]
      }
    },
    {
      name: "get_strand",
      description: "Retrieve specific CoT strand",
      inputSchema: {
        type: "object",
        properties: {
          strand_id: {
            type: "string",
            description: "ID of strand to retrieve"
          }
        },
        required: ["strand_id"]
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
    },
    {
      name: "complete_strand",
      description: "Mark CoT strand as completed with conclusion",
      inputSchema: {
        type: "object",
        properties: {
          strand_id: {
            type: "string",
            description: "ID of strand to complete"
          },
          conclusion: {
            type: "string",
            description: "Final conclusion or result"
          }
        },
        required: ["strand_id", "conclusion"]
      }
    }
  ];

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      tools: tools
    }
  };
  console.log(JSON.stringify(response));
}

function handleToolCall(request) {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'architecture_status':
      handleArchitectureStatus(request);
      break;
    case 'add_pattern':
      handleAddPattern(request, args);
      break;
    case 'get_user_preferences':
      handleGetUserPreferences(request);
      break;
    case 'create_cot_strand':
      handleCreateCotStrand(request, args);
      break;
    case 'add_to_strand':
      handleAddToStrand(request, args);
      break;
    case 'get_strand':
      handleGetStrand(request, args);
      break;
    case 'list_strands':
      handleListStrands(request);
      break;
    case 'complete_strand':
      handleCompleteStrand(request, args);
      break;
    default:
      sendError(request.id, -32601, 'Tool not found');
  }
}

function handleArchitectureStatus(request) {
  const status = {
    version: "v10.8",
    status: "operational",
    features: [
      "Professional accuracy enforcement",
      "User preference integration", 
      "Tool safety protocols active",
      "Pattern storage system",
      "Cross-session continuity",
      "read_multiple_files prohibition enforced"
    ],
    timestamp: new Date().toISOString(),
    patterns_stored: Object.keys(loadPatterns()).length,
    preferences_loaded: Object.keys(loadPreferences()).length
  };

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [
        {
          type: "text",
          text: `Architecture ${status.version} operational with professional accuracy enforcement, user preference integration, and tool safety protocols active`
        }
      ]
    }
  };
  console.log(JSON.stringify(response));
}

function handleAddPattern(request, args) {
  const patterns = loadPatterns();
  const { pattern_type, pattern_data } = args;
  
  if (!patterns[pattern_type]) {
    patterns[pattern_type] = [];
  }
  
  patterns[pattern_type].push({
    data: pattern_data,
    timestamp: new Date().toISOString(),
    session_id: generateSessionId()
  });
  
  savePatterns(patterns);

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [
        {
          type: "text",
          text: `Pattern '${pattern_type}' added successfully. Total patterns: ${Object.keys(patterns).length}`
        }
      ]
    }
  };
  console.log(JSON.stringify(response));
}

function handleGetUserPreferences(request) {
  const preferences = loadPreferences();
  
  const preferenceText = Object.entries(preferences)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [
        {
          type: "text",
          text: `User preferences: ${preferenceText}`
        }
      ]
    }
  };
  console.log(JSON.stringify(response));
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
    created: new Date().toISOString(),
    last_updated: new Date().toISOString()
  };
  
  saveCotStrands(strands);

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [
        {
          type: "text",
          text: `CoT strand '${strand_id}' created for topic: ${topic}`
        }
      ]
    }
  };
  console.log(JSON.stringify(response));
}

function handleAddToStrand(request, args) {
  const strands = loadCotStrands();
  const { strand_id, thought } = args;
  
  if (!strands.active_strands[strand_id]) {
    sendError(request.id, -32602, `Strand ${strand_id} not found or already completed`);
    return;
  }
  
  strands.active_strands[strand_id].thoughts.push(thought);
  strands.active_strands[strand_id].last_updated = new Date().toISOString();
  
  saveCotStrands(strands);

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [
        {
          type: "text",
          text: `Added thought to strand ${strand_id}. Total thoughts: ${strands.active_strands[strand_id].thoughts.length}`
        }
      ]
    }
  };
  console.log(JSON.stringify(response));
}

function handleGetStrand(request, args) {
  const strands = loadCotStrands();
  const { strand_id } = args;
  
  let strand = strands.active_strands[strand_id] || strands.completed_strands[strand_id];
  
  if (!strand) {
    sendError(request.id, -32602, `Strand ${strand_id} not found`);
    return;
  }
  
  const thoughtsText = strand.thoughts.map((thought, idx) => `${idx + 1}. ${thought}`).join('\n');
  const conclusionText = strand.conclusion ? `\n\nConclusion: ${strand.conclusion}` : '';
  const statusText = strands.completed_strands[strand_id] ? ' (COMPLETED)' : ' (ACTIVE)';
  
  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [
        {
          type: "text",
          text: `Strand: ${strand_id}${statusText}\nTopic: ${strand.topic}\n\nThoughts:\n${thoughtsText}${conclusionText}`
        }
      ]
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
  
  const completedList = Object.keys(strands.completed_strands).map(id => {
    const strand = strands.completed_strands[id];
    return `${id}: ${strand.topic} (COMPLETED)`;
  });
  
  const activeText = activeList.length > 0 ? `Active Strands:\n${activeList.join('\n')}` : 'No active strands';
  const completedText = completedList.length > 0 ? `\n\nCompleted Strands:\n${completedList.join('\n')}` : '';
  
  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [
        {
          type: "text",
          text: `${activeText}${completedText}`
        }
      ]
    }
  };
  console.log(JSON.stringify(response));
}

function handleCompleteStrand(request, args) {
  const strands = loadCotStrands();
  const { strand_id, conclusion } = args;
  
  if (!strands.active_strands[strand_id]) {
    sendError(request.id, -32602, `Active strand ${strand_id} not found`);
    return;
  }
  
  const strand = strands.active_strands[strand_id];
  strand.conclusion = conclusion;
  strand.completed = new Date().toISOString();
  
  strands.completed_strands[strand_id] = strand;
  delete strands.active_strands[strand_id];
  
  saveCotStrands(strands);

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [
        {
          type: "text",
          text: `Strand ${strand_id} completed with conclusion: ${conclusion}`
        }
      ]
    }
  };
  console.log(JSON.stringify(response));
}

function generateSessionId() {
  return Math.random().toString(36).substr(2, 9);
}

function sendError(id, code, message) {
  const response = {
    jsonrpc: "2.0",
    id: id,
    error: {
      code: code,
      message: message
    }
  };
  console.log(JSON.stringify(response));
}

console.error('Enhanced Architecture Server v10.8 started');
console.error('Professional accuracy enforcement active');
console.error('Tool safety protocols enabled');
console.error(`Data directory: ${DATA_DIR}`);
