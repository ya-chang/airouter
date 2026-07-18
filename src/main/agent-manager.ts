import { createHash } from 'crypto'
import { readFileSync, readdirSync, existsSync, statSync } from 'fs'
import { join, basename, dirname, extname } from 'path'
import matter from 'gray-matter'

export interface AgentData {
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

export class AgentManager {
  private db: Record<string, any>

  constructor(db: Record<string, any>) {
    this.db = db
  }

  parseAgentFile(filePath: string, content: string): AgentData {
    const { data, content: body } = matter(content)
    const slug = basename(filePath, '.md')
    const division = dirname(filePath).split('/').pop() || 'unknown'

    return {
      id: createHash('md5').update(filePath).digest('hex'),
      name: data.name || slug,
      slug,
      division,
      description: data.description || '',
      color: data.color || 'gray',
      emoji: data.emoji || '🤖',
      vibe: data.vibe || '',
      system_prompt: body.trim(),
      tags: this.extractTags(data, body)
    }
  }

  private extractTags(frontmatter: any, body: string): string[] {
    const tags: string[] = []
    if (frontmatter.tags) {
      tags.push(...(Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags]))
    }
    const headingRegex = /^#{1,3}\s+(.+)/gm
    let match
    while ((match = headingRegex.exec(body)) !== null) {
      tags.push(match[1].toLowerCase().trim())
    }
    return [...new Set(tags)].slice(0, 20)
  }

  importAgents(dirPath: string): { imported: number; skipped: number; errors: string[] } {
    const result = { imported: 0, skipped: 0, errors: [] as string[] }
    if (!existsSync(dirPath)) return result

    const scanDir = (dir: string) => {
      const entries = readdirSync(dir)
      for (const entry of entries) {
        const fullPath = join(dir, entry)
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
          scanDir(fullPath)
        } else if (extname(entry) === '.md') {
          try {
            const content = readFileSync(fullPath, 'utf-8')
            const agent = this.parseAgentFile(fullPath, content)
            const existing = this.db.agents.find((a: any) => a.id === agent.id)
            if (existing) { result.skipped++; continue }
            this.db.agents.push({ ...agent, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            result.imported++
          } catch (error) {
            result.errors.push(`${fullPath}: ${(error as Error).message}`)
          }
        }
      }
    }
    scanDir(dirPath)
    return result
  }

  listAgents(): AgentData[] {
    return this.db.agents || []
  }

  searchAgents(query: string): AgentData[] {
    const q = query.toLowerCase()
    return (this.db.agents || []).filter((a: any) => 
      a.name.toLowerCase().includes(q) ||
      (a.description && a.description.toLowerCase().includes(q)) ||
      (a.vibe && a.vibe.toLowerCase().includes(q))
    )
  }

  getAgentById(id: string): AgentData | null {
    return (this.db.agents || []).find((a: any) => a.id === id) || null
  }

  getAgentsByDivision(division: string): AgentData[] {
    return (this.db.agents || []).filter((a: any) => a.division === division)
  }

  getDivisions(): string[] {
    return [...new Set((this.db.agents || []).map((a: any) => a.division))]
  }

  incrementUsage(agentId: string): void {
    const agent = this.db.agents.find((a: any) => a.id === agentId)
    if (agent) agent.usage_count = (agent.usage_count || 0) + 1
  }
}
