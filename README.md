# Enhanced Architecture MCP

Enhanced Model Context Protocol (MCP) servers with professional accuracy, tool safety, user preferences, and intelligent context monitoring.

## Overview

This repository contains a collection of MCP servers that provide advanced architecture capabilities for AI assistants, including:

- **Professional Accuracy Enforcement** - Prevents marketing language and ensures factual descriptions
- **Tool Safety Protocols** - Blocks prohibited operations and validates parameters
- **User Preference Management** - Stores and applies communication and aesthetic preferences
- **Intelligent Context Monitoring** - Automatic token estimation and threshold warnings
- **Multi-MCP Orchestration** - Coordinated workflows across multiple servers

## Active Servers

### Enhanced Architecture Server (`enhanced_architecture_server_context.js`)
Primary server with complete feature set:
- Professional accuracy verification
- Tool safety enforcement  
- User preference storage/retrieval
- Context token tracking
- Pattern storage and learning
- Violation logging and metrics

### Chain of Thought Server (`cot_server.js`)
Reasoning strand management:
- Create and manage reasoning threads
- Branch reasoning paths
- Complete strands with conclusions
- Cross-reference reasoning history

### Local AI Server (`local-ai-server.js`)
Local model integration via Ollama:
- Delegate heavy reasoning tasks
- Token-efficient processing
- Hybrid local+cloud analysis
- Model capability queries

## Installation

1. **Prerequisites:**
   ```bash
   npm install
   ```

2. **Configuration:**
   Update your Claude Desktop configuration to include the servers:
   ```json
   {
     "mcpServers": {
       "enhanced-architecture": {
         "command": "node",
         "args": ["D:\\arch_mcp\\enhanced_architecture_server_context.js"],
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

3. **Local AI Setup (Optional):**
   Install Ollama and pull models:
   ```bash
   ollama pull llama3.1:8b
   ```

## Usage

### Professional Accuracy
Automatically prevents:
- Marketing language ("revolutionary", "cutting-edge")
- Competitor references
- Technical specification enhancement
- Promotional tone

### Context Monitoring
Tracks conversation tokens across:
- Document attachments
- Artifacts and code
- Tool calls and responses
- System overhead

Provides warnings at 80% and 90% capacity limits.

### User Preferences
Stores preferences for:
- Communication style (brief professional)
- Aesthetic approach (minimal)
- Message format requirements
- Tool usage patterns

### Multi-MCP Workflows
Coordinates complex tasks:
1. Create CoT reasoning strand
2. Delegate analysis to local AI
3. Store insights in memory
4. Update architecture patterns

## Key Features

- **Version-Free Operation** - No version dependencies, capability-based reporting
- **Empirical Validation** - 60+ validation gates for decision-making
- **Token Efficiency** - Intelligent context management and compression
- **Professional Standards** - Enterprise-grade accuracy and compliance
- **Cross-Session Learning** - Persistent pattern storage and preference evolution

## File Structure

```
D:\arch_mcp\
├── enhanced_architecture_server_context.js  # Main server
├── cot_server.js                            # Reasoning management
├── local-ai-server.js                       # Local AI integration
├── data/                                    # Runtime data (gitignored)
├── backup/                                  # Legacy server versions
└── package.json                             # Node.js dependencies
```

## Development

### Architecture Principles
- **Dual-System Enforcement** - MCP tools + text document protocols
- **Empirical Grounding** - Measurable validation over assumptions
- **User-Centric Design** - Preference-driven behavior adaptation
- **Professional Standards** - Enterprise accuracy and safety requirements

### Adding New Features
1. Update server tool definitions
2. Implement handler functions
3. Add empirical validation gates
4. Update user preference options
5. Test cross-MCP coordination

## Troubleshooting

**Server Connection Issues:**
- Check Node.js version compatibility
- Verify file paths in configuration
- Review server logs for syntax errors

**Context Tracking:**
- Monitor token estimation accuracy
- Adjust limits for conversation length
- Use reset tools for fresh sessions

**Performance:**
- Local AI requires Ollama installation
- Context monitoring adds ~50ms overhead
- Pattern storage optimized for < 2ms response

## License

MIT License - see individual files for specific licensing terms.

## Contributing

Architecture improvements welcome. Focus areas:
- Enhanced token estimation accuracy
- Additional validation gates
- Cross-domain pattern recognition
- Performance optimization