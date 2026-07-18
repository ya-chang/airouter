import { useState, useEffect } from 'react'
import { useStore, Agent } from '../stores/store'
import SettingsPage from './SettingsPage'
import HistoryPage from './HistoryPage'

export default function Sidebar() {
  const {
    agents, searchQuery, setSearchQuery,
    selectedDivision, setSelectedDivision,
    taskInput, setTaskInput,
    isAnalyzing, isMatching, isExecuting, set,
    analyzeTask, executeAgent,
    response, matchResults, showToast
  } = useStore()
  const get = useStore.getState

  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showAgentDetail, setShowAgentDetail] = useState<any>(null)
  const [selectedAgentsLocal, setSelectedAgentsLocal] = useState<Agent[]>([])
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; agent: any } | null>(null)

  // 获取所有分类（去重并排序）
  const divisions = [...new Set(agents.map(a => a.division))].sort()

  // 过滤专家列表
  const filteredAgents = agents.filter(agent => {
    const query = searchQuery.toLowerCase().trim()

    // 搜索匹配
    let matchesSearch = true
    if (query) {
      matchesSearch =
        agent.name.toLowerCase().includes(query) ||
        (agent.description && agent.description.toLowerCase().includes(query)) ||
        (agent.vibe && agent.vibe.toLowerCase().includes(query)) ||
        (agent.detail && agent.detail.toLowerCase().includes(query)) ||
        (agent.division && agent.division.toLowerCase().includes(query)) ||
        (agent.slug && agent.slug.toLowerCase().includes(query))
    }
    
    // 分类匹配
    let matchesDivision = true
    if (selectedDivision) {
      matchesDivision = agent.division === selectedDivision
    }
    
    return matchesSearch && matchesDivision
  })

  // 左键选择/取消选择专家（支持多选，无上限）
  const handleSelectAgent = (agent: Agent) => {
    const isSelected = selectedAgentsLocal.some(a => a.id === agent.id)
    if (isSelected) {
      // 再次点击取消选择
      setSelectedAgentsLocal(prev => prev.filter(a => a.id !== agent.id))
      showToast(`已取消选择 ${agent.name}`)
    } else {
      // 选择专家（无上限）
      setSelectedAgentsLocal(prev => [...prev, agent])
      showToast(`已选择 ${agent.name}`)
    }
  }

  const handleSubmit = async () => {
    if (!taskInput.trim()) {
      showToast('请输入任务描述')
      return
    }
    // 保存当前输入
    const currentInput = taskInput
    // 清空输入框
    useStore.setState({ taskInput: '' })

    // 如果已经选了专家，直接执行
    if (selectedAgentsLocal.length > 0) {
      await executeMultipleAgents(selectedAgentsLocal.map(a => a.id), currentInput)
      // 执行完后清空选中的专家，下次重新匹配
      setSelectedAgentsLocal([])
    } else {
      // 没有选专家，先进行匹配
      useStore.setState({ taskInput: currentInput, response: '', matchResults: [], taskAnalysis: null })
      await analyzeTask()
    }
  }

  // 同时执行多个专家（并行调用API，顺序显示结果）
  const executeMultipleAgents = async (agentIds: string[], task: string) => {
    const state = useStore.getState()
    const { agents, settings } = state
    if (!task.trim() || agentIds.length === 0) return

    const apiConfig = settings?.api
    if (!apiConfig?.apiKey) {
      useStore.getState().showToast('请先在设置中配置 API Key')
      return
    }

    // 先清空所有状态
    useStore.setState({ isExecuting: true, response: '正在请求专家回复...\n\n' })

    try {
      if (agentIds.length === 1) {
        // 单个专家，流式调用
        const agent = agents.find(a => a.id === agentIds[0])
        await callAgentAPI(agent, task, apiConfig)
      } else {
        // 多个专家，依次调用（添加间隔避免限流）
        let fullResponse = ''
        for (let i = 0; i < agentIds.length; i++) {
          const agent = agents.find(a => a.id === agentIds[i])
          useStore.setState({ response: fullResponse + `\n\n⏳ 正在请求 ${agent?.name || '专家'} (${i + 1}/${agentIds.length})...` })

          // 添加延迟避免API限流（第一个不等待）
          if (i > 0) {
            await new Promise(r => setTimeout(r, 500))
          }

          try {
            const result = await callAgentAPIGetText(agent, task, apiConfig)
            if (fullResponse) fullResponse += '\n\n---\n\n'
            fullResponse += `## ${agent?.emoji || '💡'} ${agent?.name || '专家'} 的回复\n\n${result}`
          } catch (error) {
            if (fullResponse) fullResponse += '\n\n---\n\n'
            fullResponse += `## ${agent?.emoji || '❌'} ${agent?.name || '专家'}\n\n❌ 调用失败: ${(error as Error).message}`
          }
          
          useStore.setState({ response: fullResponse })
        }
      }
    } catch (error) {
      console.error('Execute error:', error)
      useStore.getState().showToast(`执行失败: ${(error as Error).message}`)
    } finally {
      useStore.setState({ isExecuting: false })
    }
  }

  // 调用真实 API（流式）
  const callAgentAPI = async (agent: any, task: string, apiConfig: any) => {
    // 简化 system prompt，减少 token 消耗
    const systemPrompt = `你是「${agent.name}」，${agent.vibe || agent.description}。请用专业角度回答问题。`

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
          { role: 'user', content: task }
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
            if (parsed.choices?.[0]?.delta?.content) {
              fullResponse += parsed.choices[0].delta.content
              useStore.setState({ response: fullResponse })
            }
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              fullResponse += parsed.delta.text
              useStore.setState({ response: fullResponse })
            }
          } catch {}
        }
      }
    }

    return fullResponse
  }

  // 调用真实 API（获取完整文本）
  const callAgentAPIGetText = async (agent: any, task: string, apiConfig: any): Promise<string> => {
    const systemPrompt = `你是「${agent.name}」，${agent.vibe || agent.description}。请用专业角度回答问题。`

    // 添加超时控制
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    try {
      console.log(`[API] 请求 ${agent?.name}: ${apiConfig.baseUrl}/chat/completions`)
      
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
            { role: 'user', content: task }
          ],
          stream: false,
          temperature: apiConfig.temperature || 0.7,
          max_tokens: 2048
        }),
        signal: controller.signal
      })

      clearTimeout(timeout)

      console.log(`[API] ${agent?.name} 响应: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text().catch(() => '未知错误')
        console.error(`[API] ${agent?.name} 错误:`, errorText)
        throw new Error(`${response.status}: ${errorText.slice(0, 150)}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      console.log(`[API] ${agent?.name} 成功, 长度: ${content?.length || 0}`)
      return content || '（无回复内容）'
    } catch (error) {
      clearTimeout(timeout)
      console.error(`[API] ${agent?.name} 异常:`, error)
      if ((error as Error).name === 'AbortError') {
        throw new Error('请求超时（60秒）')
      }
      throw error
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  // 右键菜单
  const handleContextMenu = (e: React.MouseEvent, agent: any) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, agent })
  }

  // 点击其他地方关闭右键菜单
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="app-container">
      {/* 左侧边栏 - Agent列表 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg className="logo-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
              <path d="M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              <circle cx="12" cy="12" r="9"/>
            </svg>
            <span className="logo-text">AiRouter</span>
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 搜索专家..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="division-tabs">
          <button
            className={`division-tab ${!selectedDivision ? 'active' : ''}`}
            onClick={() => setSelectedDivision('')}
          >
            全部
          </button>
          {divisions.map(div => (
            <button
              key={div}
              className={`division-tab ${selectedDivision === div ? 'active' : ''}`}
              onClick={() => setSelectedDivision(div)}
            >
              {div}
            </button>
          ))}
        </div>

        <div className="agent-list">
          {filteredAgents.map(agent => (
            <div
              key={agent.id}
              className={`agent-list-item ${selectedAgentsLocal.some(a => a.id === agent.id) ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleSelectAgent(agent)
              }}
              onContextMenu={(e) => handleContextMenu(e, agent)}
              role="button"
              tabIndex={0}
            >
              <span className="agent-list-emoji">{agent.emoji}</span>
              <div className="agent-list-info">
                <div className="agent-list-name">{agent.name}</div>
                <div className="agent-list-meta">
                  <span className="agent-list-division">{agent.division}</span>
                  <span className="agent-list-desc">{agent.vibe}</span>
                </div>
              </div>
              {selectedAgentsLocal.some(a => a.id === agent.id) && (
                <span className="agent-check">✓</span>
              )}
            </div>
          ))}
          {filteredAgents.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-text">没有找到匹配的专家</div>
            </div>
          )}
        </div>

        {/* 当前选择的专家列表 */}
        {selectedAgentsLocal.length > 0 && (
          <div className="selected-agent-bar">
            <div className="selected-agents-list">
              {selectedAgentsLocal.map(agent => (
                <span key={agent.id} className="selected-agent-tag">
                  {agent.emoji} {agent.name}
                  <button className="tag-close" onClick={() => setSelectedAgentsLocal(prev => prev.filter(a => a.id !== agent.id))}>✕</button>
                </span>
              ))}
            </div>
            <span className="selected-count">{selectedAgentsLocal.length}个</span>
          </div>
        )}
      </div>

      {/* 中间主区域 */}
      <div className="main-content">
        {/* 右上角工具栏 */}
        <div className="toolbar">
          <div className="toolbar-left">
            {selectedAgentsLocal.length > 0 ? (
              <div className="current-agents-badges">
                {selectedAgentsLocal.map(agent => (
                  <div key={agent.id} className="current-agent-badge">
                    <span>{agent.emoji}</span>
                    <span>{agent.name}</span>
                    <button className="badge-close" onClick={() => setSelectedAgentsLocal(prev => prev.filter(a => a.id !== agent.id))}>✕</button>
                  </div>
                ))}
              </div>
            ) : (
              <span className="toolbar-title">💬 对话</span>
            )}
          </div>
          <div className="toolbar-right">
            <button className="toolbar-btn" onClick={() => setShowHistory(true)}>
              📋 历史
            </button>
            <button className="toolbar-btn" onClick={() => setShowSettings(true)}>
              ⚙️ 设置
            </button>
          </div>
        </div>

        {/* 输出窗口 */}
        <div className="output-window">
          {!response && !isExecuting && (
            <div className="output-placeholder">
              <div className="placeholder-icon">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                  <path d="M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                  <circle cx="12" cy="12" r="9"/>
                </svg>
              </div>
              <div className="placeholder-title">AiRouter - AI 的 AI</div>
              <div className="placeholder-desc">输入问题，自动匹配最合适的专家为您解答</div>
              <div className="placeholder-tips">
                <div className="tip-item">💡 直接输入问题，系统自动匹配专家</div>
                <div className="tip-item">🎯 也可以点击左侧专家手动选择</div>
                <div className="tip-item">⌨️ Ctrl + Enter 发送</div>
              </div>
            </div>
          )}

          {isExecuting && !response && (
            <div className="output-loading">
              <div className="loading-spinner"></div>
              <span>正在处理中...</span>
            </div>
          )}

          {response && (
            <div className="output-content">
              {response}
            </div>
          )}
        </div>

        {/* 匹配结果显示 */}
        {matchResults.length > 0 && !response && !isExecuting && (
          <div className="match-results-bar">
            <span className="match-label">🤖 推荐专家（点击选择）：</span>
            {matchResults.map(m => {
              const isSelected = selectedAgentsLocal.some(a => a.id === m.agentId)
              return (
                <button
                  key={m.agentId}
                  className={`match-tag ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    const agent = agents.find(a => a.id === m.agentId)
                    if (agent) handleSelectAgent(agent)
                  }}
                >
                  {m.agentEmoji} {m.agentName} {Math.round(m.score * 100)}%
                  {isSelected && ' ✓'}
                </button>
              )
            })}
          </div>
        )}

        {/* 输出操作栏 */}
        {response && (
          <div className="output-actions">
            <button className="action-btn" onClick={() => { navigator.clipboard.writeText(response); showToast('已复制') }}>
              📋 复制
            </button>
            <button className="action-btn" onClick={() => {
              const codeBlocks = response.match(/```[\s\S]*?```/g)
              const code = codeBlocks ? codeBlocks.map(b => b.replace(/```\w*\n?/, '').replace(/```$/, '')).join('\n\n') : response
              navigator.clipboard.writeText(code); showToast('已复制代码')
            }}>
              📋 复制代码
            </button>
            <button className="action-btn" onClick={() => {
              const blob = new Blob([response], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = 'output.md'; a.click()
              showToast('已保存')
            }}>
              💾 保存
            </button>
          </div>
        )}

        {/* 输入区域 */}
        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              className="task-input"
              placeholder="输入你的问题... 系统会自动匹配专家 (Ctrl+Enter 发送)"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting}
              rows={2}
            />
            <button
              className="send-btn"
              onClick={handleSubmit}
              disabled={isAnalyzing || isMatching || isExecuting || !taskInput.trim()}
            >
              {isAnalyzing ? '⏳' : isMatching ? '🔄' : '➤'}
            </button>
          </div>
        </div>
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <>
          <div className="context-menu-backdrop" onClick={() => setContextMenu(null)} />
          <div 
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="context-menu-item" onClick={(e) => {
              e.stopPropagation()
              setShowAgentDetail(contextMenu.agent)
              setContextMenu(null)
            }}>📋 查看详情</div>
            <div className="context-menu-item" onClick={(e) => {
              e.stopPropagation()
              setTaskInput(`请以${contextMenu.agent.name}的身份回答：`)
              setContextMenu(null)
            }}>✏️ 选择此专家</div>
          </div>
        </>
      )}

      {/* 弹窗 - 专家详情 */}
      {showAgentDetail && (
        <div className="modal-overlay" onClick={() => setShowAgentDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span style={{ fontSize: '24px' }}>{showAgentDetail.emoji}</span>
                <span>{showAgentDetail.name}</span>
              </div>
              <button className="modal-close" onClick={() => setShowAgentDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="agent-detail-section">
                <div className="agent-detail-label">分类</div>
                <div className="agent-detail-value">{showAgentDetail.division}</div>
              </div>
              <div className="agent-detail-section">
                <div className="agent-detail-label">一句话介绍</div>
                <div className="agent-detail-value">{showAgentDetail.vibe}</div>
              </div>
              <div className="agent-detail-section">
                <div className="agent-detail-label">技能标签</div>
                <div className="agent-detail-value">{showAgentDetail.description}</div>
              </div>
              <div className="agent-detail-section">
                <div className="agent-detail-label">详细介绍</div>
                <div className="agent-detail-text">{showAgentDetail.detail || '暂无详细介绍'}</div>
              </div>
              <div className="agent-detail-actions">
                <button className="btn btn-primary" onClick={() => {
                  setTaskInput(`请以${showAgentDetail.name}的身份回答：`)
                  setShowAgentDetail(null)
                }}>
                  🎯 选择此专家
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗 - 设置 */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">⚙️ 设置</div>
              <button className="modal-close" onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className="modal-body">
              <SettingsPage />
            </div>
          </div>
        </div>
      )}

      {/* 弹窗 - 历史 */}
      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">📋 历史记录</div>
              <button className="modal-close" onClick={() => setShowHistory(false)}>✕</button>
            </div>
            <div className="modal-body">
              <HistoryPage />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
