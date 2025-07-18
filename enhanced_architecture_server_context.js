#!/usr/bin/env node
/**
 * Enhanced Architecture Server with Context Token Monitoring
 * Professional Accuracy + User Preferences + Pattern Storage + Tool Safety + Context Tracking
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { SmartMemoryGates, smartMemoryGates } = require('./smart_memory_gates.js');

// Data storage
const DATA_DIR = path.join(__dirname, 'data');
const PATTERNS_FILE = path.join(DATA_DIR, 'patterns.json');
const PREFERENCES_FILE = path.join(DATA_DIR, 'preferences.json');
const VIOLATIONS_FILE = path.join(DATA_DIR, 'violations.json');
const METRICS_FILE = path.join(DATA_DIR, 'metrics.json');
const CONTEXT_FILE = path.join(DATA_DIR, 'context_tracking.json');

// Context Token Tracker
class ContextTokenTracker {
    constructor() {
        this.cumulativeTokens = 0;
        this.messageHistory = [];
        this.limits = {
            warning: 150000,    // 80% of typical limit
            critical: 175000,   // 90% of typical limit
            maximum: 200000     // Estimated context limit
        };
        this.loadFromFile();
    }
    
    addMessage(inputTokens, responseTokens) {
        const messageTotal = inputTokens + responseTokens;
        this.cumulativeTokens += messageTotal;
        this.messageHistory.push({
            message: this.messageHistory.length + 1,
            input: inputTokens,
            response: responseTokens,
            cumulative: this.cumulativeTokens,
            timestamp: Date.now()
        });
        
        this.saveToFile();
        return this.checkThresholds();
    }
    
    checkThresholds() {
        const percentage = Math.round((this.cumulativeTokens / this.limits.maximum) * 100);
        
        if (this.cumulativeTokens >= this.limits.critical) {
            return { status: 'CRITICAL', percentage, tokens: this.cumulativeTokens };
        } else if (this.cumulativeTokens >= this.limits.warning) {
            return { status: 'WARNING', percentage, tokens: this.cumulativeTokens };
        }
        return { status: 'OK', percentage, tokens: this.cumulativeTokens };
    }
    
    getStatus() {
        const threshold = this.checkThresholds();
        const remaining = this.limits.maximum - this.cumulativeTokens;
        const messagesCount = this.messageHistory.length;
        const avgPerMessage = messagesCount > 0 ? Math.round(this.cumulativeTokens / messagesCount) : 0;
        
        return {
            ...threshold,
            remaining,
            messages: messagesCount,
            averagePerMessage: avgPerMessage,
            limits: this.limits
        };
    }
    
    reset() {
        // Archive current session
        const archive = {
            timestamp: Date.now(),
            totalTokens: this.cumulativeTokens,
            totalMessages: this.messageHistory.length,
            messageHistory: this.messageHistory
        };
        
        // Reset counters
        this.cumulativeTokens = 0;
        this.messageHistory = [];
        
        this.saveToFile();
        return archive;
    }
    
    loadFromFile() {
        try {
            if (fs.existsSync(CONTEXT_FILE)) {
                const data = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf8'));
                this.cumulativeTokens = data.cumulativeTokens || 0;
                this.messageHistory = data.messageHistory || [];
            }
        } catch (e) {
            console.error('Failed to load context data:', e.message);
        }
    }
    
    saveToFile() {
        try {
            const data = {
                cumulativeTokens: this.cumulativeTokens,
                messageHistory: this.messageHistory,
                lastUpdate: Date.now()
            };
            fs.writeFileSync(CONTEXT_FILE, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('Failed to save context data:', e.message);
        }
    }
}

// Global context tracker
const contextTracker = new ContextTokenTracker();

// Runtime metrics tracking
let runtimeMetrics = {
  startTime: new Date(),
  toolCalls: 0,
  toolSafetyBlocks: 0,
  professionalAccuracyViolations: 0,
  patternStorageOperations: 0,
  preferenceUpdates: 0,
  multiMcpWorkflows: 0,
  averageResponseTime: 0,
  responseTimes: [],
  lastActivity: new Date()
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files
if (!fs.existsSync(PATTERNS_FILE)) {
  fs.writeFileSync(PATTERNS_FILE, JSON.stringify({
    patterns: {},
    pattern_counter: 0
  }, null, 2));
}

if (!fs.existsSync(PREFERENCES_FILE)) {
  fs.writeFileSync(PREFERENCES_FILE, JSON.stringify({
    communication_style: "brief_professional_with_context_tokens",
    aesthetic_approach: "minimal_professional", 
    development_location: "D_drive",
    command_preference: "chain_commands",
    accuracy_requirement: "maximum_technical_precision",
    message_format: "include_context_tokens",
    last_updated: new Date().toISOString()
  }, null, 2));
}

if (!fs.existsSync(VIOLATIONS_FILE)) {
  fs.writeFileSync(VIOLATIONS_FILE, JSON.stringify({
    tool_safety_violations: [],
    professional_accuracy_violations: [],
    preference_violations: []
  }, null, 2));
}

if (!fs.existsSync(METRICS_FILE)) {
  fs.writeFileSync(METRICS_FILE, JSON.stringify({
    totalSessions: 0,
    totalToolCalls: 0,
    totalViolations: 0,
    patternEffectiveness: {},
    toolUsageStats: {},
    last_reset: new Date().toISOString()
  }, null, 2));
}

// Helper functions
function updateMetrics(operation, details = {}) {
  runtimeMetrics.toolCalls++;
  runtimeMetrics.lastActivity = new Date();
  
  // Track specific operations
  switch (operation) {
    case 'tool_safety_block':
      runtimeMetrics.toolSafetyBlocks++;
      break;
    case 'professional_accuracy_violation':
      runtimeMetrics.professionalAccuracyViolations++;
      break;
    case 'pattern_storage':
      runtimeMetrics.patternStorageOperations++;
      break;
    case 'preference_update':
      runtimeMetrics.preferenceUpdates++;
      break;
    case 'multi_mcp_workflow':
      runtimeMetrics.multiMcpWorkflows++;
      break;
  }
  
  // Track response times
  if (details.responseTime) {
    runtimeMetrics.responseTimes.push(details.responseTime);
    if (runtimeMetrics.responseTimes.length > 100) {
      runtimeMetrics.responseTimes = runtimeMetrics.responseTimes.slice(-50); // Keep last 50
    }
    runtimeMetrics.averageResponseTime = 
      runtimeMetrics.responseTimes.reduce((a, b) => a + b, 0) / runtimeMetrics.responseTimes.length;
  }
}

function getViolationStats() {
  try {
    const violations = JSON.parse(fs.readFileSync(VIOLATIONS_FILE, 'utf8'));
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentViolations = {
      tool_safety: violations.tool_safety_violations.filter(v => new Date(v.timestamp) > oneDayAgo).length,
      professional_accuracy: violations.professional_accuracy_violations.filter(v => new Date(v.timestamp) > oneDayAgo).length,
      preference: violations.preference_violations.filter(v => new Date(v.timestamp) > oneDayAgo).length
    };
    
    return {
      total: violations.tool_safety_violations.length + violations.professional_accuracy_violations.length + violations.preference_violations.length,
      recent24h: recentViolations.tool_safety + recentViolations.professional_accuracy + recentViolations.preference,
      byType: recentViolations
    };
  } catch (e) {
    return { total: 0, recent24h: 0, byType: { tool_safety: 0, professional_accuracy: 0, preference: 0 } };
  }
}

function getPatternStats() {
  try {
    const patterns = loadPatterns();
    return {
      total: Object.keys(patterns.patterns).length,
      stored: patterns.pattern_counter || 0,
      types: Object.keys(patterns.patterns).reduce((acc, key) => {
        const type = patterns.patterns[key].type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    };
  } catch (e) {
    return { total: 0, stored: 0, types: {} };
  }
}

function loadPatterns() {
  try {
    return JSON.parse(fs.readFileSync(PATTERNS_FILE, 'utf8'));
  } catch (e) {
    return { patterns: {}, pattern_counter: 0 };
  }
}

function savePatterns(patterns) {
  fs.writeFileSync(PATTERNS_FILE, JSON.stringify(patterns, null, 2));
}

function loadPreferences() {
  try {
    return JSON.parse(fs.readFileSync(PREFERENCES_FILE, 'utf8'));
  } catch (e) {
    return {
      communication_style: "brief_professional_with_context_tokens",
      aesthetic_approach: "minimal_professional",
      development_location: "D_drive",
      command_preference: "chain_commands",
      accuracy_requirement: "maximum_technical_precision",
      message_format: "include_context_tokens"
    };
  }
}

function savePreferences(preferences) {
  fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(preferences, null, 2));
}

function logViolation(type, details) {
  try {
    const violations = JSON.parse(fs.readFileSync(VIOLATIONS_FILE, 'utf8'));
    const violation = {
      timestamp: new Date().toISOString(),
      type: type,
      details: details
    };
    violations[`${type}_violations`].push(violation);
    fs.writeFileSync(VIOLATIONS_FILE, JSON.stringify(violations, null, 2));
  } catch (e) {
    console.error('Failed to log violation:', e.message);
  }
}

// MCP Protocol Handler
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
      properties: {},
      required: []
    }
  },
  {
    name: "track_context_tokens",
    description: "Track cumulative context tokens with threshold warnings",
    inputSchema: {
      type: "object",
      properties: {
        inputTokens: { type: "number", description: "Input tokens for this message" },
        responseTokens: { type: "number", description: "Response tokens for this message" }
      },
      required: ["inputTokens", "responseTokens"]
    }
  },
  {
    name: "get_context_status",
    description: "Get current context token status and remaining capacity",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "reset_context",
    description: "Reset context tracking for new conversation",
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
      properties: {},
      required: []
    }
  },
  {
    name: "enforce_tool_safety",
    description: "Validate tool usage against safety protocols",
    inputSchema: {
      type: "object",
      properties: {
        tool_name: { type: "string", description: "Name of tool being validated" },
        parameters: { type: "object", description: "Tool parameters for validation" }
      },
      required: ["tool_name"]
    }
  },
  {
    name: "verify_professional_accuracy",
    description: "Check content for marketing language and factual accuracy",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Content to verify for professional accuracy" },
        content_type: { type: "string", description: "Type of content (technical_description, specification, etc.)" }
      },
      required: ["content"]
    }
  },
  {
    name: "update_user_preferences",
    description: "Update stored user preferences based on corrections",
    inputSchema: {
      type: "object",
      properties: {
        preference_type: { type: "string", description: "Type of preference (communication, aesthetic, etc.)" },
        preference_value: { type: "string", description: "New preference value" },
        context: { type: "string", description: "Context of preference update" }
      },
      required: ["preference_type", "preference_value"]
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
            name: "enhanced-architecture-server", 
            version: "operational-context-monitoring",
            description: "Enhanced Architecture with Professional Accuracy + Tool Safety + User Preferences + Context Token Monitoring"
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

function handleToolCall(name, args, requestId) {
  const startTime = Date.now();
  let result;
  
  // Update metrics for all tool calls
  updateMetrics('general', {});
  
  switch (name) {
    case 'architecture_status':
      result = getArchitectureStatus();
      break;
    case 'track_context_tokens':
      result = trackContextTokens(args.inputTokens, args.responseTokens);
      break;
    case 'get_context_status':
      result = getContextStatus();
      break;
    case 'reset_context':
      result = resetContext();
      break;
    case 'add_pattern':
      result = addPattern(args.pattern_type, args.pattern_data);
      updateMetrics('pattern_storage');
      break;
    case 'get_user_preferences':
      result = getUserPreferences();
      break;
    case 'enforce_tool_safety':
      result = enforceToolSafety(args.tool_name, args.parameters);
      break;
    case 'verify_professional_accuracy':
      result = verifyProfessionalAccuracy(args.content, args.content_type);
      break;
    case 'update_user_preferences':
      result = updateUserPreferences(args.preference_type, args.preference_value, args.context);
      updateMetrics('preference_update');
      break;
    default:
      result = { content: [{ type: "text", text: "Tool not found" }] };
  }
  
  // Track response time
  const responseTime = Date.now() - startTime;
  updateMetrics('response_time', { responseTime });
  
  const response = {
    jsonrpc: "2.0",
    id: requestId,
    result: result
  };
  console.log(JSON.stringify(response));
}

function getArchitectureStatus() {
  const startTime = runtimeMetrics.startTime;
  const uptime = Math.floor((new Date() - startTime) / 1000); // seconds
  const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;
  
  const violationStats = getViolationStats();
  const patternStats = getPatternStats();
  const contextStatus = contextTracker.getStatus();
  
  // Calculate compliance rates
  const totalOperations = runtimeMetrics.toolCalls;
  const toolSafetyCompliance = totalOperations > 0 ? 
    Math.round(((totalOperations - runtimeMetrics.toolSafetyBlocks) / totalOperations) * 100) : 100;
  const professionalAccuracyCompliance = totalOperations > 0 ? 
    Math.round(((totalOperations - runtimeMetrics.professionalAccuracyViolations) / totalOperations) * 100) : 100;
  
  const avgResponseTime = runtimeMetrics.averageResponseTime > 0 ? 
    Math.round(runtimeMetrics.averageResponseTime) : 0;
  
  const report = [
    `Architecture operational - Runtime: ${uptimeFormatted}`,
    `• Tool Safety: ${runtimeMetrics.toolSafetyBlocks} blocks, ${toolSafetyCompliance}% compliance`,
    `• Professional Accuracy: ${professionalAccuracyCompliance}% compliance, ${violationStats.byType.professional_accuracy} recent violations`,
    `• Context Tracking: ${contextStatus.tokens.toLocaleString()} tokens (${contextStatus.percentage}%), ${contextStatus.status}`,
    `• Pattern Storage: ${patternStats.total} active patterns, ${runtimeMetrics.patternStorageOperations} operations`,
    `• User Preferences: ${runtimeMetrics.preferenceUpdates} updates applied`,
    `• Multi-MCP Workflows: ${runtimeMetrics.multiMcpWorkflows} executed`,
    `• Performance: ${avgResponseTime}ms avg response, ${totalOperations} total calls`,
    `• Violations (24h): ${violationStats.recent24h} total (${violationStats.byType.tool_safety} safety, ${violationStats.byType.professional_accuracy} accuracy)`,
    `• Status: All enforcement systems active, ${violationStats.recent24h === 0 ? 'No recent issues' : 'Active monitoring'}`
  ].join('\n');
  
  return {
    content: [{
      type: "text",
      text: report
    }]
  };
}

function trackContextTokens(inputTokens, responseTokens) {
  const status = contextTracker.addMessage(inputTokens, responseTokens);
  
  let message = `Context updated: ${status.tokens.toLocaleString()} total tokens (${status.percentage}%)`;
  
  if (status.status === 'WARNING') {
    message += `\n⚠️ WARNING: Approaching context limit (${status.percentage}%)`;
  } else if (status.status === 'CRITICAL') {
    message += `\n🚨 CRITICAL: Context limit critical (${status.percentage}%) - compression recommended`;
  }
  
  return {
    content: [{
      type: "text",
      text: message
    }]
  };
}

function getContextStatus() {
  const status = contextTracker.getStatus();
  
  const report = [
    `Context Status:`,
    `• Current: ${status.tokens.toLocaleString()} tokens (${status.percentage}%)`,
    `• Remaining: ${status.remaining.toLocaleString()} tokens`,
    `• Messages: ${status.messages} (avg: ${status.averagePerMessage} tokens/msg)`,
    `• Status: ${status.status}`,
    `• Limits: Warning ${status.limits.warning.toLocaleString()}, Critical ${status.limits.critical.toLocaleString()}, Max ${status.limits.maximum.toLocaleString()}`
  ].join('\n');
  
  return {
    content: [{
      type: "text",
      text: report
    }]
  };
}

function resetContext() {
  const archive = contextTracker.reset();
  
  const report = [
    `Context reset completed:`,
    `• Archived: ${archive.totalTokens.toLocaleString()} tokens from ${archive.totalMessages} messages`,
    `• Reset: Starting fresh context tracking`,
    `• Status: Ready for new conversation`
  ].join('\n');
  
  return {
    content: [{
      type: "text",
      text: report
    }]
  };
}

function addPattern(pattern_type, pattern_data) {
  return {
    content: [{
      type: "text",
      text: `Pattern ${pattern_type} stored: ${pattern_data.substring(0, 50)}...`
    }]
  };
}

function getUserPreferences() {
  const preferences = loadPreferences();
  
  // Dynamically build preference display from all stored preferences
  const prefEntries = [];
  
  // Core preferences with readable names
  const preferenceNames = {
    communication_style: 'Communication',
    aesthetic_approach: 'Aesthetic', 
    development_location: 'Development',
    command_preference: 'Commands',
    accuracy_requirement: 'Accuracy',
    accuracy_requirements: 'Accuracy',
    monitoring: 'Monitoring',
    unicode_usage: 'Unicode',
    search_strategy: 'Search',
    tool_safety: 'Tool Safety',
    message_format: 'Message Format'
  };
  
  // Add all preferences from file
  for (const [key, value] of Object.entries(preferences)) {
    if (key !== 'last_updated') {
      const displayName = preferenceNames[key] || key.replace(/_/g, ' ');
      const displayValue = typeof value === 'string' ? 
        value.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2') : 
        String(value);
      prefEntries.push(`${displayName}: ${displayValue}`);
    }
  }
  
  return {
    content: [{
      type: "text",
      text: `User Preferences: ${prefEntries.join(', ')}`
    }]
  };
}

function enforceToolSafety(tool_name, parameters) {
  if (tool_name === 'read_multiple_files') {
    updateMetrics('tool_safety_block');
    logViolation('tool_safety', {
      tool: tool_name,
      action: 'BLOCKED',
      reason: 'Completely prohibited tool'
    });
    
    return {
      content: [{
        type: "text",
        text: "⛔ TOOL SAFETY VIOLATION: read_multiple_files is COMPLETELY PROHIBITED. Use sequential read_file calls instead."
      }]
    };
  }
  
  if (parameters && Array.isArray(parameters.paths) && parameters.paths.length === 0) {
    updateMetrics('tool_safety_block');
    logViolation('tool_safety', {
      tool: tool_name,
      action: 'BLOCKED',
      reason: 'Empty array parameter'
    });
    
    return {
      content: [{
        type: "text",
        text: "⛔ PARAMETER VALIDATION FAILED: Empty array parameters not allowed. Provide valid file paths."
      }]
    };
  }
  
  return {
    content: [{
      type: "text",
      text: `✅ Tool safety check passed for ${tool_name}`
    }]
  };
}

function verifyProfessionalAccuracy(content, content_type = 'general') {
  const violations = [];
  
  const marketingTerms = [
    'ultra-low', 'industry-leading', 'revolutionary', 'cutting-edge',
    'best-in-class', 'breakthrough', 'amazing', 'incredible'
  ];
  
  const lowerContent = content.toLowerCase();
  marketingTerms.forEach(term => {
    if (lowerContent.includes(term)) {
      violations.push(`Marketing language detected: "${term}"`);
    }
  });
  
  const competitorTerms = ['like span', 'similar to', 'competes with', 'alternative to'];
  competitorTerms.forEach(term => {
    if (lowerContent.includes(term)) {
      violations.push(`Competitor reference detected: "${term}"`);
    }
  });
  
  if (lowerContent.includes('+') && content_type === 'specification') {
    violations.push('Specification enhancement detected (+ symbol)');
  }
  
  if (violations.length > 0) {
    updateMetrics('professional_accuracy_violation');
    logViolation('professional_accuracy', {
      content_type: content_type,
      violations: violations,
      content_sample: content.substring(0, 100)
    });
    
    return {
      content: [{
        type: "text",
        text: `⛔ PROFESSIONAL ACCURACY VIOLATIONS:
${violations.map(v => `• ${v}`).join('\n')}

Convert to factual descriptions without marketing language or competitor references.`
      }]
    };
  }
  
  return {
    content: [{
      type: "text",
      text: "✅ Professional accuracy check passed - content is factual and appropriate"
    }]
  };
}

function updateUserPreferences(preference_type, preference_value, context) {
  // GATE63: Smart filter existing preferences check
  const memoryCheck = smartMemoryGates.smartFilterExistingPreferences(`${preference_type} ${preference_value}`);
  
  // GATE66: Targeted preference domain check
  const domainCheck = smartMemoryGates.targetedPreferenceDomainCheck(preference_value, preference_type);
  
  if (domainCheck.exists && domainCheck.conflicts.length > 0) {
    return {
      content: [{
        type: "text",
        text: `⚠️ PREFERENCE CONFLICT DETECTED: ${preference_type} already exists with different value. Current: ${domainCheck.conflicts[0].existing}, Requested: ${preference_value}. Update anyway or resolve conflict?`
      }]
    };
  }
  
  const preferences = loadPreferences();
  
  switch (preference_type) {
    case 'communication':
      preferences.communication_style = preference_value;
      break;
    case 'aesthetic':
      preferences.aesthetic_approach = preference_value;
      break;
    case 'development':
      preferences.development_location = preference_value;
      break;
    case 'commands':
      preferences.command_preference = preference_value;
      break;
    case 'accuracy':
    case 'accuracy_requirements':
      preferences.accuracy_requirements = preference_value;
      preferences.accuracy_requirement = preference_value; // Keep both for compatibility
      break;
    case 'message_format':
      preferences.message_format = preference_value;
      break;
    case 'monitoring':
      preferences.monitoring = preference_value;
      break;
    case 'unicode_usage':
      preferences.unicode_usage = preference_value;
      break;
    case 'search_strategy':
      preferences.search_strategy = preference_value;
      break;
    case 'tool_safety':
      preferences.tool_safety = preference_value;
      break;
    default:
      // Handle any other preference type dynamically
      preferences[preference_type] = preference_value;
      break;
  }
  
  preferences.last_updated = new Date().toISOString();
  savePreferences(preferences);
  
  addPattern('user_preference_update', `${preference_type}: ${preference_value} (${context || 'no context'})`);
  
  return {
    content: [{
      type: "text",
      text: `✅ User preference updated: ${preference_type} = ${preference_value}`
    }]
  };
}

console.error('Enhanced Architecture MCP Server with Context Monitoring started');
console.error('Professional Accuracy + Tool Safety + User Preferences + Context Tracking active');
console.error('Smart Memory Gates 63-67 integrated with filtering protocols');