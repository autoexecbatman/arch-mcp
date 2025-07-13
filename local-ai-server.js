#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const http = require('http');

class LocalAIServer {
  constructor() {
    this.server = new Server(
      {
        name: 'local-ai-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.ollamaUrl = 'http://localhost:11434';
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'query_local_ai',
            description: 'Query local AI model via Ollama for reasoning assistance',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'The reasoning prompt to send to local AI'
                },
                model: {
                  type: 'string',
                  description: 'Model name (default: deepseek-r1:32b)',
                  default: 'deepseek-r1:32b'
                },
                temperature: {
                  type: 'number',
                  description: 'Temperature for response (0.1-1.0)',
                  default: 0.6
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'reasoning_assist',
            description: 'Structured reasoning assistance for complex problems',
            inputSchema: {
              type: 'object',
              properties: {
                problem: {
                  type: 'string',
                  description: 'Problem statement requiring reasoning'
                },
                steps: {
                  type: 'number',
                  description: 'Number of reasoning steps requested',
                  default: 5
                },
                model: {
                  type: 'string',
                  description: 'Model to use for reasoning',
                  default: 'deepseek-r1:32b'
                }
              },
              required: ['problem']
            }
          },
          {
            name: 'model_list',
            description: 'List available local AI models',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'hybrid_analysis',
            description: 'Hybrid local+cloud analysis for complex data',
            inputSchema: {
              type: 'object',
              properties: {
                data: {
                  type: 'string',
                  description: 'Data to analyze'
                },
                approach: {
                  type: 'string',
                  description: 'Analysis approach: reasoning, technical, creative',
                  default: 'reasoning'
                },
                model: {
                  type: 'string',
                  description: 'Local model for analysis',
                  default: 'deepseek-r1:32b'
                }
              },
              required: ['data']
            }
          },
          {
            name: 'token_efficient_reasoning',
            description: 'Delegate heavy reasoning to local AI to conserve cloud tokens',
            inputSchema: {
              type: 'object',
              properties: {
                reasoning_task: {
                  type: 'string',
                  description: 'Complex reasoning task to delegate'
                },
                context: {
                  type: 'string',
                  description: 'Additional context for reasoning'
                },
                model: {
                  type: 'string',
                  description: 'Local model for reasoning',
                  default: 'deepseek-r1:32b'
                }
              },
              required: ['reasoning_task']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'query_local_ai':
            return await this.queryLocalAI(args.prompt, args.model, args.temperature);
          
          case 'reasoning_assist':
            return await this.reasoningAssist(args.problem, args.steps, args.model);
          
          case 'model_list':
            return await this.getModelList();
          
          case 'hybrid_analysis':
            return await this.hybridAnalysis(args.data, args.approach, args.model);
          
          case 'token_efficient_reasoning':
            return await this.tokenEfficientReasoning(args.reasoning_task, args.context, args.model);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async queryLocalAI(prompt, model = 'deepseek-r1:32b', temperature = 0.6) {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: temperature,
            num_predict: 2048
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: [
          {
            type: 'text',
            text: `Local AI Response (${model}):\n\n${data.response}\n\nTokens: ${data.eval_count || 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to query local AI: ${error.message}`);
    }
  }

  async reasoningAssist(problem, steps = 5, model = 'deepseek-r1:32b') {
    const structuredPrompt = `Problem: ${problem}

Please provide a structured reasoning approach with exactly ${steps} steps:

1. [Step 1 reasoning]
2. [Step 2 reasoning]
3. [Step 3 reasoning]
${steps > 3 ? '4. [Step 4 reasoning]' : ''}
${steps > 4 ? '5. [Step 5 reasoning]' : ''}
${steps > 5 ? Array.from({length: steps - 5}, (_, i) => `${i + 6}. [Step ${i + 6} reasoning]`).join('\n') : ''}

Conclusion: [Final reasoning conclusion]

Think step by step and show your reasoning process clearly.`;

    return await this.queryLocalAI(structuredPrompt, model, 0.6);
  }

  async getModelList() {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`);
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      const modelList = data.models.map(model => ({
        name: model.name,
        size: this.formatBytes(model.size),
        modified: model.modified_at
      }));

      return {
        content: [
          {
            type: 'text',
            text: `Available Local Models:\n\n${JSON.stringify(modelList, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get model list: ${error.message}`);
    }
  }

  async hybridAnalysis(data, approach = 'reasoning', model = 'deepseek-r1:32b') {
    const analysisPrompts = {
      reasoning: `Analyze this data using logical reasoning and chain of thought:

Data: ${data}

Provide:
1. Initial observations
2. Logical deductions
3. Pattern recognition
4. Reasoning chain
5. Conclusions

Focus on logical analysis and reasoning patterns.`,

      technical: `Perform technical analysis of this data:

Data: ${data}

Provide:
1. Technical specifications or characteristics
2. Implementation considerations
3. Performance implications
4. Best practices
5. Technical recommendations

Focus on technical depth and accuracy.`,

      creative: `Analyze this data from creative and innovative perspectives:

Data: ${data}

Provide:
1. Creative interpretations
2. Alternative approaches
3. Innovative applications
4. Cross-domain connections
5. Novel insights

Focus on creativity and innovation.`
    };

    const prompt = analysisPrompts[approach] || analysisPrompts.reasoning;
    return await this.queryLocalAI(prompt, model, 0.7);
  }

  async tokenEfficientReasoning(reasoningTask, context = '', model = 'deepseek-r1:32b') {
    const efficientPrompt = `REASONING DELEGATION TASK:

Task: ${reasoningTask}
${context ? `Context: ${context}` : ''}

Please provide comprehensive reasoning analysis including:

1. PROBLEM DECOMPOSITION
   - Break down the task into components
   - Identify key variables and relationships

2. REASONING CHAIN
   - Step-by-step logical progression
   - Evidence and justification for each step

3. ALTERNATIVE APPROACHES
   - Consider different methodologies
   - Compare pros/cons of approaches

4. SYNTHESIS
   - Integrate findings into coherent solution
   - Address potential counterarguments

5. CONCLUSION
   - Clear final reasoning result
   - Confidence level and limitations

Optimize for thorough reasoning while being concise in presentation.`;

    return await this.queryLocalAI(efficientPrompt, model, 0.6);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Local AI MCP Server running on stdio');
  }
}

const server = new LocalAIServer();
server.run().catch(console.error);
