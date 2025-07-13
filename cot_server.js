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

// Helper functions
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
      process.stderr.write(`Parse error: ${e.message}\n`);
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
    case 'resources/list':
      handleResourcesList(request);
      break;
    default:
      sendError(request.id || 0, -32601, 'Method not found');
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
        name: "cot-server",
        version: "1.0.0"
      }
    }
  };
  console.log(JSON.stringify(response));
}

function handleResourcesList(request) {
  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      resources: []
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
    },
    {
      name: "branch_strand",
      description: "Create new reasoning branch from existing strand",
      inputSchema: {
        type: "object",
        properties: {
          source_strand_id: {
            type: "string",
            description: "ID of strand to branch from"
          },
          branch_topic: {
            type: "string",
            description: "Topic for the new branch"
          },
          branch_thought: {
            type: "string",
            description: "Initial thought for the branch"
          }
        },
        required: ["source_strand_id", "branch_topic", "branch_thought"]
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
    case 'branch_strand':
      handleBranchStrand(request, args);
      break;
    default:
      sendError(request.id, -32601, 'Tool not found');
  }
}

function handleCreateCotStrand(request, args) {
  const { topic, initial_thought } = args;
  
  const strands = loadCotStrands();
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
  const { strand_id, thought } = args;
  
  const strands = loadCotStrands();
  const strand = strands.active_strands[strand_id];
  
  if (!strand) {
    sendError(request.id, -32602, `Strand ${strand_id} not found`);
    return;
  }
  
  strand.thoughts.push(thought);
  strand.last_updated = new Date().toISOString();
  
  saveCotStrands(strands);

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [
        {
          type: "text",
          text: `Added thought to strand ${strand_id}. Total thoughts: ${strand.thoughts.length}`
        }
      ]
    }
  };
  console.log(JSON.stringify(response));
}

function handleGetStrand(request, args) {
  const { strand_id } = args;
  
  const strands = loadCotStrands();
  const strand = strands.active_strands[strand_id] || strands.completed_strands[strand_id];
  
  if (!strand) {
    sendError(request.id, -32602, `Strand ${strand_id} not found`);
    return;
  }

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [
        {
          type: "text",
          text: `Strand ${strand_id}: ${strand.topic}\n\nThoughts:\n${strand.thoughts.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n${strand.conclusion ? `Conclusion: ${strand.conclusion}` : 'Status: Active'}`
        }
      ]
    }
  };
  console.log(JSON.stringify(response));
}

function handleListStrands(request) {
  const strands = loadCotStrands();
  
  let output = '';
  
  if (Object.keys(strands.active_strands).length > 0) {
    output += 'Active Strands:\n';
    for (const [id, strand] of Object.entries(strands.active_strands)) {
      output += `${id}: ${strand.topic} (${strand.thoughts.length} thoughts)\n`;
    }
  }
  
  if (Object.keys(strands.completed_strands).length > 0) {
    output += '\nCompleted Strands:\n';
    for (const [id, strand] of Object.entries(strands.completed_strands)) {
      output += `${id}: ${strand.topic} (COMPLETED)\n`;
    }
  }
  
  if (!output) {
    output = 'No strands found.';
  }

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [
        {
          type: "text",
          text: output.trim()
        }
      ]
    }
  };
  console.log(JSON.stringify(response));
}

function handleCompleteStrand(request, args) {
  const { strand_id, conclusion } = args;
  
  const strands = loadCotStrands();
  const strand = strands.active_strands[strand_id];
  
  if (!strand) {
    sendError(request.id, -32602, `Strand ${strand_id} not found`);
    return;
  }
  
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

function handleBranchStrand(request, args) {
  const { source_strand_id, branch_topic, branch_thought } = args;
  
  const strands = loadCotStrands();
  const sourceStrand = strands.active_strands[source_strand_id] || strands.completed_strands[source_strand_id];
  
  if (!sourceStrand) {
    sendError(request.id, -32602, `Source strand ${source_strand_id} not found`);
    return;
  }
  
  strands.strand_counter++;
  const branch_id = `strand_${strands.strand_counter}`;
  
  strands.active_strands[branch_id] = {
    id: branch_id,
    topic: branch_topic,
    thoughts: [...sourceStrand.thoughts, branch_thought],
    created: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    branched_from: source_strand_id
  };
  
  saveCotStrands(strands);

  const response = {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      content: [
        {
          type: "text",
          text: `Created branch '${branch_id}' from '${source_strand_id}' with topic: ${branch_topic}`
        }
      ]
    }
  };
  console.log(JSON.stringify(response));
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

process.stderr.write('CoT Server v1.0 started\n');
process.stderr.write('Chain of Thought reasoning tools active\n');
process.stderr.write(`Data directory: ${DATA_DIR}\n`);
