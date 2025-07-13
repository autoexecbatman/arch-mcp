#!/usr/bin/env node
/**
 * Local AI Reasoning Server v10.8
 * Integrates with local Ollama models for enhanced reasoning
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const http = require('http');

// MCP Protocol Handler
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const tools = [
  {
    name: "query_local_ai",
    description: "Query local AI model via Ollama for reasoning assistance",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "The reasoning prompt to send to local AI" },
        model: { type: "string", description: "Model name (default: llama3.1:8b)", default: "llama3.1:8b" },
        temperature: { type: "number", description: "Temperature for response (0.1-1.0)", default: 0.6 }
      },
      required: ["prompt"]
    }
  },
  {
    name: "reasoning_assist",
    description: "Structured reasoning assistance for complex problems",
    inputSchema: {
      type: "object",
      properties: {
        problem: { type: "string", description: "Problem statement requiring reasoning" },
        steps: { type: "number", description: "Number of reasoning steps requested", default: 5 },
        model: { type: "string", description: "Model to use for reasoning", default: "llama3.1:8b" }
      },
      required: ["problem"]
    }
  },
  {
    name: "model_list",
    description: "List available local AI models",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "hybrid_analysis",
    description: "Hybrid local+cloud analysis for complex data",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "string", description: "Data to analyze" },
        approach: { type: "string", description: "Analysis approach: reasoning, technical, creative", default: "reasoning" },
        model: { type: "string", description: "Local model for analysis", default: "llama3.1:8b" }
      },
      required: ["data"]
    }
  },
  {
    name: "token_efficient_reasoning",
    description: "Delegate heavy reasoning to local AI to conserve cloud tokens",
    inputSchema: {
      type: "object",
      properties: {
        reasoning_task: { type: "string", description: "Complex reasoning task to delegate" },
        context: { type: "string", description: "Additional context for reasoning" },
        model: { type: "string", description: "Local model for reasoning", default: "llama3.1:8b" }
      },
      required: ["reasoning_task"]
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
          serverInfo: { 
            name: "local-ai-server", 
            version: "10.8.0",
            description: "Local AI Reasoning with Ollama Integration"
          }
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
      handleToolCall(name, args, request.id);
    }
  } catch (e) {
    console.error('Parse error:', e.message);
  }
});

async function handleToolCall(name, args, requestId) {
  let result;
  
  try {
    switch (name) {
      case 'query_local_ai':
        result = await queryLocalAI(args.prompt, args.model, args.temperature);
        break;
      case 'reasoning_assist':
        result = await reasoningAssist(args.problem, args.steps, args.model);
        break;
      case 'model_list':
        result = getModelList();
        break;
      case 'hybrid_analysis':
        result = await hybridAnalysis(args.data, args.approach, args.model);
        break;
      case 'token_efficient_reasoning':
        result = await tokenEfficientReasoning(args.reasoning_task, args.context, args.model);
        break;
      default:
        result = { content: [{ type: "text", text: "Tool not found" }] };
    }
  } catch (error) {
    result = { content: [{ type: "text", text: `Error: ${error.message}` }] };
  }
  
  const response = {
    jsonrpc: "2.0",
    id: requestId,
    result: result
  };
  console.log(JSON.stringify(response));
}

async function queryLocalAI(prompt, model = "llama3.1:8b", temperature = 0.6) {
  const startTime = Date.now();
  
  try {
    const response = await callOllamaAPI({
      model: model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: temperature
      }
    });
    
    const duration = Date.now() - startTime;
    
    return {
      content: [{
        type: "text",
        text: `Model: ${model} | Duration: ${duration}ms\n\n${response.response}\n\n---\nTokens: ${response.eval_count || 'N/A'} | Speed: ${response.eval_count ? Math.round(response.eval_count / (duration/1000)) : 'N/A'} tok/s`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error querying ${model}: ${error.message}\n\nEnsure Ollama is running on localhost:11434`
      }]
    };
  }
}

async function reasoningAssist(problem, steps = 5, model = "llama3.1:8b") {
  const reasoningPrompt = `Please solve this problem using exactly ${steps} clear reasoning steps:

${problem}

Structure your response as:
Step 1: [analysis]
Step 2: [analysis]
...
Conclusion: [final answer]`;
  
  return await queryLocalAI(reasoningPrompt, model, 0.3);
}

function getModelList() {
  const { execSync } = require('child_process');
  
  try {
    // Query actual Ollama models
    const output = execSync('ollama list', { encoding: 'utf8', timeout: 5000 });
    const lines = output.split('\n').filter(line => line.trim() && !line.startsWith('NAME'));
    
    let modelList = 'Available Local AI Models:\n';
    lines.forEach(line => {
      const modelName = line.split('\t')[0] || line.split(' ')[0];
      if (modelName.trim()) {
        modelList += `• ${modelName.trim()}\n`;
      }
    });
    
    return {
      content: [{
        type: "text",
        text: modelList || 'No models found. Run "ollama pull <model>" to install models.'
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error querying Ollama: ${error.message}\n\nEnsure Ollama is installed and running.\nUse 'ollama list' in terminal to check manually.`
      }]
    };
  }
}

async function hybridAnalysis(data, approach = "reasoning", model = "llama3.1:8b") {
  let analysisPrompt;
  
  switch (approach) {
    case 'technical':
      analysisPrompt = `Technical analysis of the following data:\n\n${data}\n\nProvide detailed technical insights, patterns, and recommendations.`;
      break;
    case 'creative':
      analysisPrompt = `Creative analysis of the following data:\n\n${data}\n\nProvide innovative perspectives, creative interpretations, and novel approaches.`;
      break;
    default: // reasoning
      analysisPrompt = `Systematic reasoning analysis of the following data:\n\n${data}\n\nProvide logical analysis, evidence-based conclusions, and reasoned recommendations.`;
  }
  
  return await queryLocalAI(analysisPrompt, model, 0.4);
}

async function tokenEfficientReasoning(reasoning_task, context = "", model = "llama3.1:8b") {
  const fullPrompt = context ? 
    `Context: ${context}\n\nTask: ${reasoning_task}\n\nProvide comprehensive reasoning with detailed analysis.` :
    `Task: ${reasoning_task}\n\nProvide comprehensive reasoning with detailed analysis.`;
  
  return await queryLocalAI(fullPrompt, model, 0.2);
}

// Ollama API call function
function callOllamaAPI(requestData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(requestData);
    
    const options = {
      hostname: 'localhost',
      port: 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Connection failed: ${error.message}`));
    });
    
    // No timeout - let cloud timeout first
    // req.setTimeout(180000, () => {
    //   req.destroy();
    //   reject(new Error('Request timeout (3 min)'));
    // });
    
    req.write(postData);
    req.end();
  });
}

console.error('Local AI Reasoning Server v10.8 started');
console.error('Ollama integration ready for token-efficient reasoning');
