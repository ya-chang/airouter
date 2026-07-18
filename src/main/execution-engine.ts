import { AgentData } from './agent-manager'

export interface APIConfig {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
  temperature?: number
  maxTokens?: number
}

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const OUTPUT_FORMAT = `
---
## 输出格式
当生成多个文件时，每个文件用独立代码块包裹，语言标记后跟文件路径：
\`\`\`tsx src/components/Login.tsx
// 内容
\`\`\`
单文件不需要特殊格式。
`

export class ExecutionEngine {
  async execute(
    agent: AgentData,
    userTask: string,
    config: APIConfig,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const messages: Message[] = [
      { role: 'system', content: agent.system_prompt + OUTPUT_FORMAT },
      { role: 'user', content: userTask }
    ]

    const response = await this.callAPI(messages, config, true)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let full = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      const content = this.parseSSEChunk(chunk)
      if (content) { full += content; onChunk?.(content) }
    }

    return full
  }

  private async callAPI(messages: Message[], config: APIConfig, stream: boolean): Promise<Response> {
    if (config.provider === 'claude') return this.callClaudeAPI(messages, config, stream)
    return this.callOpenAICompatibleAPI(messages, config, stream)
  }

  private async callOpenAICompatibleAPI(messages: Message[], config: APIConfig, stream: boolean): Promise<Response> {
    return fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages, stream, temperature: config.temperature ?? 0.7, max_tokens: config.maxTokens ?? 4096 })
    })
  }

  private async callClaudeAPI(messages: Message[], config: APIConfig, stream: boolean): Promise<Response> {
    const system = messages.find(m => m.role === 'system')?.content || ''
    const rest = messages.filter(m => m.role !== 'system')
    return fetch(`${config.baseUrl}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': config.apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: config.model, system, messages: rest, stream, max_tokens: config.maxTokens ?? 4096 })
    })
  }

  private parseSSEChunk(chunk: string): string {
    const lines = chunk.split('\n')
    let content = ''
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          if (parsed.choices?.[0]?.delta?.content) content += parsed.choices[0].delta.content
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) content += parsed.delta.text
        } catch { /* skip */ }
      }
    }
    return content
  }
}
