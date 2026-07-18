import { useState } from 'react'
import { useStore, MatchResult } from '../stores/store'

const MODE_LABELS: Record<string, string> = {
  consult: '咨询方案',
  diagnose: '问题诊断',
  generate: '代码生成',
  relay: '接力优化'
}

export default function HomePage() {
  const {
    taskInput, setTaskInput,
    taskAnalysis, matchResults,
    isAnalyzing, isMatching, isExecuting,
    response,
    analyzeTask, executeAgent,
    selectedAgent,
    showToast
  } = useStore()

  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null)

  const handleSubmit = async () => {
    if (!taskInput.trim()) {
      showToast('请输入任务描述')
      return
    }
    await analyzeTask()
  }

  const handleExecute = async (agentId: string) => {
    await executeAgent(agentId)
  }

  const handleCopy = async (format: 'plain' | 'code') => {
    await window.electronAPI.output.copy(response, format)
    showToast('已复制到剪贴板')
  }

  const handleSaveFile = async () => {
    const result = await window.electronAPI.output.saveFile(response, 'output.md')
    if (result.success) {
      showToast(`已保存到 ${result.path}`)
    }
  }

  const handleGenerateProject = async () => {
    const result = await window.electronAPI.output.generateProject(response)
    if (result.success) {
      showToast(`已生成 ${result.count} 个文件到 ${result.dir}`)
    }
  }

  const handleOpenInVSCode = async () => {
    const result = await window.electronAPI.output.generateProject(response)
    if (result.success) {
      await window.electronAPI.output.openInVSCode(result.dir)
    }
  }

  return (
    <>
      <div className="input-area">
        <textarea
          className="task-input"
          placeholder="描述你的任务...&#10;&#10;例如：&#10;- 帮我写一个带 OAuth 登录的 React 组件&#10;- 这段代码总是超时，帮我看看&#10;- 我想做一个支持多语言的电商后台"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          disabled={isExecuting}
        />
        <div className="input-actions">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isAnalyzing || isMatching || isExecuting || !taskInput.trim()}
          >
            {isAnalyzing ? '分析中...' : isMatching ? '匹配中...' : '🚀 分析并匹配'}
          </button>
        </div>
      </div>

      <div className="match-results">
        {matchResults.length > 0 && (
          <>
            <div className="section-title">
              🤖 推荐专家（自动匹配）
            </div>
            <div className="agent-cards">
              {matchResults.map((match) => (
                <div
                  key={match.agentId}
                  className={`agent-card ${selectedMatch?.agentId === match.agentId ? 'selected' : ''}`}
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="agent-card-header">
                    <div className="agent-card-name">
                      <span>{match.agentEmoji}</span>
                      <span>{match.agentName}</span>
                    </div>
                    <div className="agent-card-score">
                      {Math.round(match.score * 100)}%
                    </div>
                  </div>
                  <div className="agent-card-description">
                    {match.agentVibe || match.agentDescription}
                  </div>
                  <div className="agent-card-reasons">
                    {match.reasons.map((reason, i) => (
                      <span key={i} className="reason-tag">{reason}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="input-actions" style={{ marginTop: '16px' }}>
              <button
                className="btn btn-primary"
                onClick={() => selectedMatch && handleExecute(selectedMatch.agentId)}
                disabled={!selectedMatch || isExecuting}
              >
                {isExecuting ? '执行中...' : '▶ 使用选中专家'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => matchResults[0] && handleExecute(matchResults[0].agentId)}
                disabled={isExecuting || matchResults.length === 0}
              >
                🎯 使用推荐
              </button>
            </div>
          </>
        )}

        {matchResults.length === 0 && !isAnalyzing && !isMatching && (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <div className="empty-state-text">
              输入任务描述，AiRouter 会自动匹配最适合的 AI 专家
            </div>
          </div>
        )}

        {(isAnalyzing || isMatching) && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span>{isAnalyzing ? '分析任务中...' : '匹配专家中...'}</span>
          </div>
        )}
      </div>

      {response && (
        <div className="response-area">
          <div className="response-header">
            <div className="section-title" style={{ margin: 0 }}>
              {selectedMatch?.agentEmoji} {selectedMatch?.agentName} 的回复
            </div>
          </div>
          <div className="response-content">
            {response}
          </div>
          <div className="output-actions">
            <button className="btn btn-secondary" onClick={() => handleCopy('plain')}>
              📋 复制全部
            </button>
            <button className="btn btn-secondary" onClick={() => handleCopy('code')}>
              📋 复制代码
            </button>
            <button className="btn btn-secondary" onClick={handleSaveFile}>
              💾 保存文件
            </button>
            <button className="btn btn-secondary" onClick={handleGenerateProject}>
              📦 生成项目
            </button>
            <button className="btn btn-secondary" onClick={handleOpenInVSCode}>
              📂 用 VS Code 打开
            </button>
          </div>
        </div>
      )}

      <div className="status-bar">
        <div className="status-left">
          {taskAnalysis && (
            <>
              <span>模式: {MODE_LABELS[taskAnalysis.mode] || taskAnalysis.mode}</span>
              <span>复杂度: {taskAnalysis.complexity === 'complex' ? '复杂' : '简单'}</span>
            </>
          )}
        </div>
        <div className="status-right">
          <span>AiRouter v1.0.0</span>
        </div>
      </div>
    </>
  )
}
