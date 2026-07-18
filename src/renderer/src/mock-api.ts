import { mockAgents } from './mock-agents'

const mockElectronAPI = {
  agents: {
    list: async () => mockAgents,
    search: async (query: string) => {
      return mockAgents.filter(a => 
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase()) ||
        a.vibe.toLowerCase().includes(query.toLowerCase())
      )
    },
    getById: async (id: string) => mockAgents.find(a => a.id === id) || null,
    browse: async (division: string) => mockAgents.filter(a => a.division === division),
    import: async () => ({ imported: 0, skipped: 0, errors: [] })
  },
  tasks: {
    analyze: async (input: string) => {
      const keywords = input.toLowerCase().split(/\s+/).filter(w => w.length > 1).slice(0, 8)
      let mode = 'consult'
      if (/写|生成|创建|开发|实现|组件|页面|接口/.test(input)) mode = 'generate'
      if (/报错|错误|bug|error|失败|异常|为什么|出问题/.test(input)) mode = 'diagnose'
      if (/```[\s\S]{50,}```/.test(input) && /优化|审查|review|改进|重构/.test(input)) mode = 'relay'
      
      return {
        keywords,
        suggested_divisions: ['工程'],
        complexity: input.length > 200 ? 'complex' : 'simple',
        mode,
        intent: input.slice(0, 100)
      }
    },
    match: async (input: string) => {
      const keywords = input.toLowerCase()
      let scored = mockAgents.map(agent => {
        const text = `${agent.name} ${agent.description} ${agent.vibe} ${agent.division}`.toLowerCase()
        let score = 0
        keywords.split(/\s+/).forEach(k => {
          if (k.length > 1 && text.includes(k)) score += 0.3
        })
        // Boost by division relevance
        if (/前端|react|vue|css|html|界面|组件/.test(keywords) && agent.division === '工程') score += 0.2
        if (/设计|ui|ux|界面|样式/.test(keywords) && agent.division === '设计') score += 0.2
        if (/产品|需求|prd|方案/.test(keywords) && agent.division === '产品') score += 0.2
        if (/营销|推广|seo|内容/.test(keywords) && agent.division === '营销') score += 0.2
        if (/安全|漏洞|渗透/.test(keywords) && agent.division === '安全') score += 0.2
        if (/测试|qa|自动化/.test(keywords) && agent.division === '测试') score += 0.2
        if (/数据|分析|sql/.test(keywords) && agent.division === '数据') score += 0.2
        return { ...agent, score }
      })
      
      scored.sort((a, b) => b.score - a.score)
      const top = scored.slice(0, 3)
      
      // If no good match, return top 3 by default
      if (top[0].score === 0) {
        return mockAgents.slice(0, 3).map((agent, i) => ({
          agentId: agent.id,
          agentName: agent.name,
          agentEmoji: agent.emoji,
          agentDescription: agent.description,
          agentVibe: agent.vibe,
          division: agent.division,
          score: 0.85 - i * 0.1,
          reasons: ['热门推荐']
        }))
      }
      
      return top.map((agent, i) => ({
        agentId: agent.id,
        agentName: agent.name,
        agentEmoji: agent.emoji,
        agentDescription: agent.description,
        agentVibe: agent.vibe,
        division: agent.division,
        score: Math.min(agent.score, 0.98),
        reasons: agent.score > 0.4 ? ['关键词匹配', `分类: ${agent.division}`] : [`分类: ${agent.division}`]
      }))
    },
    executeStream: async (agentId: string, task: string, callback: (chunk: string) => void) => {
      const agent = mockAgents.find(a => a.id === agentId)
      const response = `## ${agent?.emoji || '💡'} ${agent?.name || '专家'} 的回复

---

基于您的任务：「${task.slice(0, 80)}${task.length > 80 ? '...' : ''}」

---

### 分析

作为 **${agent?.name || '专家'}**，我来帮您分析这个问题。

这是一个模拟回复。在实际应用中，这里会调用真实的 AI API，由 ${agent?.name || '该领域专家'} 提供专业、详细的回答。

### 建议步骤

1. **明确目标** - 确定要解决的核心问题
2. **收集信息** - 整理相关背景和约束条件  
3. **方案设计** - 根据最佳实践制定方案
4. **实施执行** - 分步落地并持续验证

### 示例代码

\`\`\`typescript
// ${agent?.name || '专家'}提供的示例
const solution = {
  step1: '分析需求和约束',
  step2: '设计技术方案',
  step3: '实现核心功能',
  step4: '测试和优化'
}

export default solution
\`\`\`

---

💡 **提示**：接入真实 AI API 后，${agent?.name || '专家'}会根据您的具体问题给出更专业、更针对性的建议。`
      
      // Simulate streaming
      for (let i = 0; i < response.length; i += 8) {
        await new Promise(r => setTimeout(r, 15))
        callback(response.slice(i, i + 8))
      }
      
      return response
    },
    history: async () => [],
    rate: async () => {}
  },
  output: {
    copy: async (content: string, format: string) => {
      await navigator.clipboard.writeText(content)
      return true
    },
    saveFile: async (content: string, suggestedName: string) => {
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = suggestedName
      a.click()
      URL.revokeObjectURL(url)
      return { success: true, path: suggestedName }
    },
    generateProject: async (output: string) => {
      return { success: true, dir: './project', count: 1, files: ['output.md'] }
    },
    exportDoc: async () => ({ success: false }),
    openInVSCode: async () => {}
  },
  settings: {
    get: async () => ({
      api: { provider: 'deepseek', apiKey: '', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', temperature: 0.7, maxTokens: 4096 },
      matching: { mode: 'top3' },
      general: { theme: 'light', language: 'zh' }
    }),
    save: async () => {},
    testApi: async () => ({ success: true, message: '连接成功' })
  }
}

if (typeof window !== 'undefined' && !window.electronAPI) {
  ;(window as any).electronAPI = mockElectronAPI
}

export { mockElectronAPI }
