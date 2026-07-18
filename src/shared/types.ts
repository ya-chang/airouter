export interface APIConfig {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
  temperature?: number
  maxTokens?: number
}

export interface ProviderPreset {
  name: string
  baseUrl: string
  model: string
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { name: '小米 MiMo', baseUrl: 'https://api.xiaomi.com/v1', model: 'MiMo-v2.5-Pro' },
  { name: 'Kimi', baseUrl: 'https://api.moonshot.cn/v1', model: 'kimi-k2' },
  { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
  { name: 'Claude', baseUrl: 'https://api.anthropic.com/v1', model: 'claude-sonnet-4-20250514' },
  { name: 'Ollama', baseUrl: 'http://localhost:11434/v1', model: 'llama3' }
]

export interface Agent {
  id: string
  name: string
  slug: string
  division: string
  description: string
  color: string
  emoji: string
  vibe: string
  system_prompt: string
  tags: string[]
}

export interface MatchResult {
  agentId: string
  agentName: string
  agentEmoji: string
  agentDescription: string
  agentVibe: string
  score: number
  reasons: string[]
}

export interface TaskHistoryItem {
  id: string
  mode: string
  user_input: string
  agent_id: string
  agent_name: string
  model: string
  result: string
  tokens_used: number
  cost: number
  rating: number
  created_at: string
}
