import { create } from 'zustand'

declare global {
  interface Window {
    electronAPI: {
      agents: {
        list: () => Promise<any[]>
        search: (query: string) => Promise<any[]>
        getById: (id: string) => Promise<any | null>
        browse: (division: string) => Promise<any[]>
        import: (dirPath: string) => Promise<{ imported: number; skipped: number; errors: string[] }>
      }
      tasks: {
        analyze: (input: string) => Promise<any>
        match: (input: string) => Promise<any[]>
        executeStream: (agentId: string, task: string, callback: (chunk: string) => void) => Promise<string>
        history: () => Promise<any[]>
        rate: (taskId: string, rating: number) => Promise<void>
      }
      output: {
        copy: (content: string, format: string) => Promise<boolean>
        saveFile: (content: string, suggestedName: string) => Promise<{ success: boolean; path?: string }>
        generateProject: (output: string) => Promise<{ success: boolean; dir: string; count: number; files: string[] }>
        exportDoc: (content: string, format: string) => Promise<{ success: boolean; path?: string }>
        openInVSCode: (dir: string) => Promise<void>
      }
      settings: {
        get: () => Promise<any>
        save: (settings: any) => Promise<void>
        testApi: (config: any) => Promise<{ success: boolean; message: string }>
      }
    }
  }
}

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
  division: string
  score: number
  reasons: string[]
}

export interface TaskAnalysis {
  keywords: string[]
  suggested_divisions: string[]
  complexity: 'simple' | 'complex'
  mode: 'consult' | 'diagnose' | 'generate' | 'relay'
  intent: string
}

type Page = 'home' | 'settings' | 'history'

interface AppState {
  // Page
  page: Page
  setPage: (page: Page) => void

  // Agents
  agents: Agent[]
  selectedAgent: Agent | null
  searchQuery: string
  selectedDivision: string
  loadAgents: () => Promise<void>
  setSearchQuery: (query: string) => void
  setSelectedDivision: (division: string) => void
  selectAgent: (agent: Agent | null) => void

  // Task
  taskInput: string
  setTaskInput: (input: string) => void
  taskAnalysis: TaskAnalysis | null
  matchResults: MatchResult[]
  isAnalyzing: boolean
  isMatching: boolean
  analyzeTask: () => Promise<void>
  matchAgents: () => Promise<void>

  // Execution
  isExecuting: boolean
  response: string
  executeAgent: (agentId: string) => Promise<void>

  // History
  taskHistory: any[]
  loadHistory: () => Promise<void>

  // Settings
  settings: any
  loadSettings: () => Promise<void>
  saveSettings: (settings: any) => Promise<void>

  // Toast
  toast: string | null
  showToast: (message: string) => void
}

export const useStore = create<AppState>((set, get) => ({
  // Page
  page: 'home',
  setPage: (page) => set({ page }),

  // Agents
  agents: [],
  selectedAgent: null,
  searchQuery: '',
  selectedDivision: '',
  loadAgents: async () => {
    // 直接使用mock数据，不依赖主进程
    const { mockAgents } = await import('../mock-agents')
    set({ agents: mockAgents })
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedDivision: (division) => set({ selectedDivision: division }),
  selectAgent: (agent) => set({ selectedAgent: agent }),

  // Task
  taskInput: '',
  setTaskInput: (input) => set({ taskInput: input }),
  taskAnalysis: null,
  matchResults: [],
  isAnalyzing: false,
  isMatching: false,
  analyzeTask: async () => {
    const { taskInput, agents } = get()
    if (!taskInput.trim()) return

    set({ isAnalyzing: true })
    try {
      // 本地分析任务
      const keywords = taskInput.toLowerCase().split(/\s+/).filter(w => w.length > 1).slice(0, 8)
      let mode = 'consult'
      if (/写|生成|创建|开发|实现|组件|页面|接口/.test(taskInput)) mode = 'generate'
      if (/报错|错误|bug|error|失败|异常|为什么|出问题/.test(taskInput)) mode = 'diagnose'
      if (/```[\s\S]{50,}```/.test(taskInput) && /优化|审查|review|改进|重构/.test(taskInput)) mode = 'relay'
      
      const analysis = {
        keywords,
        suggested_divisions: ['工程'],
        complexity: taskInput.length > 200 ? 'complex' : 'simple',
        mode,
        intent: taskInput.slice(0, 100)
      }
      set({ taskAnalysis: analysis })
      
      // 本地匹配专家
      set({ isMatching: true })
      const query = taskInput.toLowerCase()
      let scored = agents.map(agent => {
        const text = `${agent.name} ${agent.description || ''} ${agent.vibe || ''} ${agent.division}`.toLowerCase()
        let score = 0
        query.split(/\s+/).forEach(k => {
          if (k.length > 1 && text.includes(k)) score += 0.3
        })
        return { ...agent, score }
      })
      scored.sort((a, b) => b.score - a.score)
      const top = scored.slice(0, 3)
      
      const matches = top.map((agent, i) => ({
        agentId: agent.id,
        agentName: agent.name,
        agentEmoji: agent.emoji,
        agentDescription: agent.description,
        agentVibe: agent.vibe,
        division: agent.division,
        score: Math.min(agent.score, 0.98) || 0.85 - i * 0.1,
        reasons: agent.score > 0 ? ['关键词匹配'] : ['热门推荐']
      }))
      
      set({ matchResults: matches, isMatching: false })
    } catch (error) {
      console.error('Analyze error:', error)
      get().showToast('分析失败')
    } finally {
      set({ isAnalyzing: false, isMatching: false })
    }
  },
  matchAgents: async () => {
    const { taskInput, agents } = get()
    if (!taskInput.trim()) return

    set({ isMatching: true })
    try {
      const query = taskInput.toLowerCase()
      let scored = agents.map(agent => {
        const text = `${agent.name} ${agent.description || ''} ${agent.vibe || ''} ${agent.division}`.toLowerCase()
        let score = 0
        query.split(/\s+/).forEach(k => {
          if (k.length > 1 && text.includes(k)) score += 0.3
        })
        return { ...agent, score }
      })
      scored.sort((a, b) => b.score - a.score)
      const top = scored.slice(0, 3)
      
      const matches = top.map((agent, i) => ({
        agentId: agent.id,
        agentName: agent.name,
        agentEmoji: agent.emoji,
        agentDescription: agent.description,
        agentVibe: agent.vibe,
        division: agent.division,
        score: Math.min(agent.score, 0.98) || 0.85 - i * 0.1,
        reasons: agent.score > 0 ? ['关键词匹配'] : ['热门推荐']
      }))
      
      set({ matchResults: matches })
    } catch (error) {
      console.error('Match error:', error)
      get().showToast('匹配失败')
    } finally {
      set({ isMatching: false })
    }
  },

  // Execution
  isExecuting: false,
  response: '',
  executeAgent: async (agentId, task?: string) => {
    const state = get()
    const taskInput = task || state.taskInput
    const { agents, settings } = state
    if (!taskInput.trim() || !agentId) return

    const agent = agents.find(a => a.id === agentId)
    if (!agent) return

    const apiConfig = settings?.api
    if (!apiConfig?.apiKey) {
      get().showToast('请先在设置中配置 API Key')
      return
    }

    set({ isExecuting: true, response: '' })
    try {
      // 构建 system prompt
      const systemPrompt = `你是「${agent.name}」，${agent.vibe || agent.description}。${agent.detail || ''}`

      // 调用真实 API
      const response = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: apiConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: taskInput }
          ],
          stream: true,
          temperature: apiConfig.temperature || 0.7,
          max_tokens: apiConfig.maxTokens || 4096
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`API 错误: ${response.status} ${error}`)
      }

      // 流式读取响应
      const reader = response.body?.getReader()
      if (!reader) throw new Error('无法读取响应')

      const decoder = new TextDecoder()
      let fullResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              // OpenAI 格式
              if (parsed.choices?.[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content
                fullResponse += content
                useStore.setState({ response: fullResponse })
              }
              // Claude 格式
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                const content = parsed.delta.text
                fullResponse += content
                useStore.setState({ response: fullResponse })
              }
            } catch {
              // 跳过解析错误
            }
          }
        }
      }

      useStore.setState({ response: fullResponse })
    } catch (error) {
      console.error('Execute error:', error)
      get().showToast(`执行失败: ${(error as Error).message}`)
    } finally {
      useStore.setState({ isExecuting: false })
    }
  },

  // History
  taskHistory: [],
  loadHistory: async () => {
    // 使用本地存储
    const history = JSON.parse(localStorage.getItem('taskHistory') || '[]')
    set({ taskHistory: history })
  },

  // Settings
  settings: null,
  loadSettings: async () => {
    // 使用本地存储
    const settings = JSON.parse(localStorage.getItem('settings') || 'null') || {
      api: { provider: 'deepseek', apiKey: '', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', temperature: 0.7, maxTokens: 4096 },
      matching: { mode: 'top3' },
      general: { theme: 'light', language: 'zh' }
    }
    set({ settings })
  },
  saveSettings: async (settings) => {
    localStorage.setItem('settings', JSON.stringify(settings))
    set({ settings })
    get().showToast('设置已保存')
  },

  // Toast
  toast: null,
  showToast: (message) => {
    set({ toast: message })
    setTimeout(() => set({ toast: null }), 3000)
  }
}))
