import { useEffect } from 'react'
import { useStore } from '../stores/store'

const MODE_LABELS: Record<string, string> = {
  consult: '咨询方案',
  diagnose: '问题诊断',
  generate: '代码生成',
  relay: '接力优化'
}

export default function HistoryPage() {
  const { taskHistory, loadHistory, showToast } = useStore()

  useEffect(() => {
    loadHistory()
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN')
  }

  const handleReuse = (input: string) => {
    useStore.getState().setTaskInput(input)
    useStore.getState().setPage('home')
    showToast('已填入输入框')
  }

  return (
    <div>
      {taskHistory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-text">暂无历史记录</div>
        </div>
      ) : (
        <div>
          {taskHistory.map((task) => (
            <div key={task.id} className="history-item">
              <div className="history-header">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="history-mode">{MODE_LABELS[task.mode] || task.mode}</span>
                  <span className="history-agent">{task.agent_name || '未知专家'}</span>
                </div>
                <span className="history-time">{formatDate(task.created_at)}</span>
              </div>
              <div className="history-input">{task.user_input}</div>
              <div className="history-actions">
                <button 
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => handleReuse(task.user_input)}
                >
                  🔄 重新使用
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
