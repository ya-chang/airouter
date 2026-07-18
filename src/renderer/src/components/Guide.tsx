import { useState, useEffect } from 'react'

export default function Guide() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // 首次访问显示引导
    const hasSeenGuide = localStorage.getItem('airouter_guide_seen')
    if (!hasSeenGuide) {
      setShow(true)
    }
  }, [])

  const steps = [
    {
      title: '欢迎使用 AiRouter',
      content: 'AiRouter 是一个 AI 智能路由器，内置 345+ 专业 AI 专家，帮你快速找到最合适的专家解答问题。',
      icon: '🎭'
    },
    {
      title: '第一步：配置 API',
      content: '点击右上角「⚙️ 设置」，选择 API 服务商（如 DeepSeek、硅基流动），输入 API Key 并保存。',
      icon: '⚙️'
    },
    {
      title: '第二步：选择专家',
      content: '在左侧专家列表中点击选择专家（可多选），或直接输入问题让系统自动匹配。',
      icon: '🎯'
    },
    {
      title: '第三步：发送问题',
      content: '输入问题后点击发送按钮，或按 Ctrl+Enter。专家会依次回复你的问题。',
      icon: '💬'
    },
    {
      title: '注意事项',
      content: '• API Key 需要到对应平台申请\n• 每次调用都会消耗 token（费用）\n• 建议一次选 1-3 个专家对比\n• 可以右键专家查看详情',
      icon: '📋'
    }
  ]

  if (!show) return null

  return (
    <div className="guide-overlay" onClick={() => { setShow(false); localStorage.setItem('airouter_guide_seen', 'true') }}>
      <div className="guide-modal" onClick={e => e.stopPropagation()}>
        <div className="guide-icon">{steps[step].icon}</div>
        <div className="guide-title">{steps[step].title}</div>
        <div className="guide-content">{steps[step].content}</div>
        <div className="guide-steps">
          {steps.map((_, i) => (
            <span key={i} className={`guide-dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>
        <div className="guide-actions">
          {step > 0 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              上一步
            </button>
          )}
          {step < steps.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
              下一步
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => { setShow(false); localStorage.setItem('airouter_guide_seen', 'true') }}>
              开始使用
            </button>
          )}
        </div>
        <button className="guide-close" onClick={() => { setShow(false); localStorage.setItem('airouter_guide_seen', 'true') }}>
          ✕
        </button>
      </div>
    </div>
  )
}
