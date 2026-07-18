export interface TaskAnalysis {
  keywords: string[]
  suggested_divisions: string[]
  complexity: 'simple' | 'complex'
  mode: 'consult' | 'diagnose' | 'generate' | 'relay'
  intent: string
}

const DIVISION_KEYWORDS: Record<string, string[]> = {
  engineering: ['code', 'react', 'api', 'backend', 'frontend', 'debug', 'database', 'sql', 'typescript', 'javascript', 'python', 'java', 'golang', 'rust', 'node', 'docker', 'kubernetes', 'aws', 'cloud', 'server', 'deploy', 'git', '代码', '编程', '开发', '接口', '组件', 'bug', '数据库', '后端', '前端', '服务器', '部署', '容器', '微服务', '框架', '库', 'npm'],
  design: ['ui', 'ux', 'design', 'figma', 'sketch', 'css', 'style', 'layout', 'responsive', 'color', 'typography', 'animation', 'component', 'wireframe', 'prototype', '设计', '界面', '交互', '样式', '布局', '视觉', '品牌', '图标', '配色', '动画', '响应式'],
  marketing: ['marketing', 'seo', 'content', 'social', 'advertising', 'campaign', 'brand', 'analytics', 'conversion', 'funnel', 'email', 'newsletter', '营销', '推广', '内容', '文案', '品牌', '广告', '转化', '用户增长', '社交媒体', '搜索引擎'],
  product: ['product', 'prd', 'feature', 'requirement', 'user story', 'roadmap', 'sprint', 'agile', 'scrum', 'kanban', 'backlog', '需求', '产品', '功能', '方案', '规划', '用户故事', '路线图', '迭代', '优先级'],
  security: ['security', 'vulnerability', 'authentication', 'authorization', 'encryption', 'oauth', 'jwt', 'ssl', 'tls', 'firewall', 'penetration', 'xss', 'csrf', '安全', '漏洞', '认证', '权限', '加密', '授权', '攻击', '防护'],
  testing: ['test', 'qa', 'unit test', 'integration test', 'e2e', 'automation', 'jest', 'cypress', 'selenium', 'coverage', 'regression', 'smoke', '测试', '用例', '自动化', '单元测试', '集成测试', '回归测试'],
  data: ['data', 'analytics', 'machine learning', 'ai', 'ml', 'model', 'training', 'dataset', 'visualization', 'dashboard', 'report', 'etl', 'pipeline', '数据', '分析', '机器学习', '人工智能', '模型', '可视化', '报表'],
  devops: ['devops', 'ci/cd', 'pipeline', 'terraform', 'ansible', 'monitoring', 'logging', 'alerting', 'infrastructure', 'automation', 'deployment', '运维', '自动化', '监控', '日志', '告警', '基础设施', '持续集成']
}

export class TaskAnalyzer {
  analyzeTask(userInput: string): TaskAnalysis {
    const keywords = this.extractKeywords(userInput)
    const suggested_divisions = this.inferDivisions(keywords)
    const complexity = this.estimateComplexity(userInput)
    const mode = this.detectMode(userInput)
    const intent = this.extractIntent(userInput, mode)

    return { keywords, suggested_divisions, complexity, mode, intent }
  }

  private extractKeywords(input: string): string[] {
    const cleaned = input.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '')
    const words = cleaned.toLowerCase().split(/[\s,;.!?，。；！？、\n\r]+/).filter(w => w.length > 1 && !this.isStopWord(w))
    return [...new Set(words)].slice(0, 20)
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or', 'if', 'while', 'that', 'this', 'it', 'its', '我', '你', '他', '她', '它', '的', '了', '在', '是', '和', '就', '不', '人', '都', '一', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'])
    return stopWords.has(word)
  }

  private inferDivisions(keywords: string[]): string[] {
    const divisionScores: Record<string, number> = {}
    for (const [division, divisionKeywords] of Object.entries(DIVISION_KEYWORDS)) {
      let score = 0
      for (const keyword of keywords) {
        if (divisionKeywords.some(dk => dk.includes(keyword) || keyword.includes(dk))) score++
      }
      if (score > 0) divisionScores[division] = score
    }
    return Object.entries(divisionScores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([division]) => division)
  }

  private estimateComplexity(input: string): 'simple' | 'complex' {
    const length = input.length
    const hasCodeBlock = /```[\s\S]+```/.test(input)
    const sentenceCount = input.split(/[.!?。！？]+/).filter(s => s.trim()).length
    const hasMultipleRequirements = /和|并|以及|同时|另外|此外|还有/.test(input)
    if (length > 500 || (hasCodeBlock && length > 200) || sentenceCount > 5 || hasMultipleRequirements) return 'complex'
    return 'simple'
  }

  detectMode(input: string): TaskAnalysis['mode'] {
    if (/```[\s\S]{50,}```/.test(input) && /优化|审查|review|改进|重构|打磨/.test(input)) return 'relay'
    if (/报错|错误|不工作|超时|bug|error|fail|异常|为什么|问题|出错|报错了|运行不了|无法/.test(input)) return 'diagnose'
    if (/写|生成|创建|做一个|开发|实现|组件|页面|接口|API|代码|功能|模块|服务/.test(input)) return 'generate'
    return 'consult'
  }

  private extractIntent(input: string, mode: string): string {
    const cleaned = input.replace(/```[\s\S]*?```/g, '').trim()
    const intentPatterns = [/(?:帮我|请|想要|需要|希望)\s*(.{10,50})/, /(?:怎么|如何)\s*(.{10,50})/, /(.{10,50})(?:的方法|的方案|的方式)/]
    for (const pattern of intentPatterns) {
      const match = cleaned.match(pattern)
      if (match) return match[1].trim()
    }
    return cleaned.slice(0, 100)
  }
}
