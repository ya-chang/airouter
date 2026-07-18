import { TaskAnalyzer } from './task-analyzer'

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

export class AgentMatcher {
  private db: Record<string, any>
  private taskAnalyzer: TaskAnalyzer

  constructor(db: Record<string, any>, taskAnalyzer: TaskAnalyzer) {
    this.db = db
    this.taskAnalyzer = taskAnalyzer
  }

  async matchAgents(userInput: string, topN: number = 3): Promise<MatchResult[]> {
    const analysis = this.taskAnalyzer.analyzeTask(userInput)
    const scores = new Map<string, { total: number; reasons: string[] }>()

    // Keyword matching
    const keywordResults = this.matchKeywords(analysis.keywords)
    for (const result of keywordResults) {
      const entry = this.getOrCreate(scores, result.agentId)
      entry.total += result.score * 0.4
      if (result.matchedTags.length > 0) entry.reasons.push(`关键词匹配: ${result.matchedTags.slice(0, 3).join(', ')}`)
    }

    // Division matching
    for (const division of analysis.suggested_divisions) {
      const agents = (this.db.agents || []).filter((a: any) => a.division === division)
      for (const agent of agents) {
        const entry = this.getOrCreate(scores, agent.id)
        entry.total += 0.35
        entry.reasons.push(`分类: ${division}`)
      }
    }

    // Name/description matching
    const nameResults = this.matchNames(analysis.keywords)
    for (const result of nameResults) {
      const entry = this.getOrCreate(scores, result.agentId)
      entry.total += result.score * 0.25
      if (result.matched) entry.reasons.push(`名称匹配: ${result.matched}`)
    }

    // Sort and get top N
    const sortedResults = Array.from(scores.entries())
      .map(([id, { total, reasons }]) => ({ agentId: id, score: Math.min(total, 1), reasons: [...new Set(reasons)] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)

    // Fetch full agent data
    const results: MatchResult[] = []
    for (const result of sortedResults) {
      const agent = (this.db.agents || []).find((a: any) => a.id === result.agentId)
      if (agent) {
        results.push({
          agentId: agent.id,
          agentName: agent.name,
          agentEmoji: agent.emoji,
          agentDescription: agent.description,
          agentVibe: agent.vibe,
          division: agent.division,
          score: result.score,
          reasons: result.reasons
        })
      }
    }

    // Fallback if no results
    if (results.length === 0) {
      const fallback = (this.db.agents || []).slice(0, topN)
      return fallback.map((agent: any, index: number) => ({
        agentId: agent.id,
        agentName: agent.name,
        agentEmoji: agent.emoji,
        agentDescription: agent.description,
        agentVibe: agent.vibe,
        division: agent.division,
        score: 0.5 - index * 0.1,
        reasons: ['热门推荐']
      }))
    }

    return results
  }

  private matchKeywords(keywords: string[]): { agentId: string; score: number; matchedTags: string[] }[] {
    const results: { agentId: string; score: number; matchedTags: string[] }[] = []
    for (const agent of (this.db.agents || [])) {
      const text = `${agent.name} ${agent.description || ''} ${agent.vibe || ''} ${(agent.tags || []).join(' ')}`.toLowerCase()
      let matchCount = 0
      const matchedTags: string[] = []
      for (const keyword of keywords) {
        if (text.includes(keyword)) { matchCount++; matchedTags.push(keyword) }
      }
      if (matchCount > 0) results.push({ agentId: agent.id, score: matchCount / keywords.length, matchedTags })
    }
    return results.sort((a, b) => b.score - a.score)
  }

  private matchNames(keywords: string[]): { agentId: string; score: number; matched: string }[] {
    const results: { agentId: string; score: number; matched: string }[] = []
    for (const agent of (this.db.agents || [])) {
      const nameLower = agent.name.toLowerCase()
      const descLower = (agent.description || '').toLowerCase()
      for (const keyword of keywords) {
        if (nameLower.includes(keyword)) { results.push({ agentId: agent.id, score: 1, matched: agent.name }); break }
        if (descLower.includes(keyword)) { results.push({ agentId: agent.id, score: 0.5, matched: (agent.description || '').slice(0, 50) }); break }
      }
    }
    return results.sort((a, b) => b.score - a.score)
  }

  private getOrCreate(map: Map<string, { total: number; reasons: string[] }>, key: string) {
    if (!map.has(key)) map.set(key, { total: 0, reasons: [] })
    return map.get(key)!
  }
}
