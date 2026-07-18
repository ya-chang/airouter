import { useState, useEffect } from 'react'
import { useStore } from '../stores/store'

const PROVIDER_PRESETS: Record<string, { baseUrl: string; model: string; label: string; models: string[] }> = {
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-v4-pro',
    label: 'DeepSeek',
    models: [
      'deepseek-v4-pro',
      'deepseek-v4-flash',
      'deepseek-chat (即将弃用)',
      'deepseek-reasoner (即将弃用)'
    ]
  },
  siliconflow: {
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'deepseek-ai/DeepSeek-V4-Pro',
    label: '硅基流动',
    models: [
      // DeepSeek 系列
      'deepseek-ai/DeepSeek-V4-Pro',
      'deepseek-ai/DeepSeek-V4-Flash',
      'deepseek-ai/DeepSeek-V3.2',
      'deepseek-ai/DeepSeek-V3.2-Pro',
      'deepseek-ai/DeepSeek-V3.1-Terminus',
      'deepseek-ai/DeepSeek-R1',
      // Qwen 系列
      'Qwen/Qwen3.6-35B-A3B',
      'Qwen/Qwen3.6-27B',
      'Qwen/Qwen3.5-397B-A17B',
      'Qwen/Qwen3-VL-32B-Instruct',
      // Kimi 系列
      'moonshotai/Kimi-K2.7-Code',
      'moonshotai/Kimi-K2.6',
      // GLM 系列
      'zai-org/GLM-5.2',
      'zai-org/GLM-5.1',
      // MiniMax 系列
      'MiniMaxAI/MiniMax-M2.5',
      // 其他
      'meituan-longcat/LongCat-2.0',
      'nex-agi/Nex-N2-Pro',
      'internlm/internlm2_5-20b-chat',
      'meta-llama/Meta-Llama-3.1-70B-Instruct',
      '01-ai/Yi-1.5-34B-Chat'
    ]
  },
  xiaomi: {
    baseUrl: 'https://api.xiaomi.com/v1',
    model: 'MiMo-v2.5-Pro',
    label: '小米 MiMo',
    models: ['MiMo-v2.5-Pro', 'MiMo-v2.5-Lite']
  },
  kimi: {
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'kimi-k2.7',
    label: 'Kimi (月之暗面)',
    models: [
      // Kimi 最新系列
      'kimi-k2.7',
      'kimi-k2.7-code',
      'kimi-k2.6',
      'kimi-k2.5',
      'kimi-k2',
      // Moonshot 系列
      'moonshot-v1-128k',
      'moonshot-v1-32k',
      'moonshot-v1-8k'
    ]
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-5.6-sol',
    label: 'OpenAI',
    models: [
      // GPT-5.6 系列（最新）
      'gpt-5.6-sol',
      'gpt-5.6-sol-pro',
      'gpt-5.6-terra',
      'gpt-5.6-luna',
      // GPT-5.5 系列
      'gpt-5.5-instant',
      // GPT-5 系列
      'gpt-5-thinking-mini',
      // GPT-4 系列（旧版）
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'gpt-4o',
      'gpt-4o-mini'
    ]
  },
  claude: {
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-sonnet-4-20250514',
    label: 'Claude',
    models: [
      // Claude 最新系列
      'claude-sonnet-4-20250514',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      // Claude 命名系列（如API支持）
      'claude-mythos',
      'claude-fable',
      'claude-opus',
      'claude-sonnet',
      'claude-haiku'
    ]
  },
  ollama: {
    baseUrl: 'http://localhost:11434/v1',
    model: 'qwen3:32b',
    label: 'Ollama (本地)',
    models: [
      'qwen3:32b',
      'qwen3:14b',
      'qwen3:8b',
      'qwen3:4b',
      'llama4:scout',
      'llama4:maverick',
      'llama3.3:70b',
      'llama3.1:8b',
      'deepseek-r1:671b',
      'deepseek-r1:32b',
      'deepseek-r1:14b',
      'gemma3:27b',
      'mistral-large:latest'
    ]
  }
}

export default function SettingsPage() {
  const { settings, loadSettings, saveSettings, agents, showToast } = useStore()
  
  const [provider, setProvider] = useState('deepseek')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [model, setModel] = useState('')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [matchingMode, setMatchingMode] = useState('top3')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    if (settings) {
      setProvider(settings.api?.provider || 'deepseek')
      setApiKey(settings.api?.apiKey || '')
      setBaseUrl(settings.api?.baseUrl || '')
      setModel(settings.api?.model || '')
      setTemperature(settings.api?.temperature || 0.7)
      setMaxTokens(settings.api?.maxTokens || 4096)
      setMatchingMode(settings.matching?.mode || 'top3')
    }
  }, [settings])

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider)
    const preset = PROVIDER_PRESETS[newProvider]
    if (preset) {
      setBaseUrl(preset.baseUrl)
      setModel(preset.model)
    }
  }

  const handleSave = async () => {
    await saveSettings({
      api: { provider, apiKey, baseUrl, model, temperature, maxTokens },
      matching: { mode: matchingMode },
      general: settings?.general || { theme: 'light', language: 'zh' }
    })
  }

  const handleTestApi = async () => {
    setTesting(true)
    setTestResult(null)
    
    try {
      const response = await fetch(`${baseUrl}/models`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      
      if (response.ok) {
        setTestResult({ success: true, message: '连接成功 ✓' })
      } else {
        const error = await response.text()
        setTestResult({ success: false, message: `连接失败: ${response.status}` })
      }
    } catch (error) {
      setTestResult({ success: false, message: `连接错误: ${(error as Error).message}` })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div>
      <div className="settings-section">
        <div className="settings-section-title">
          ⚙️ API 配置
        </div>
        <div className="settings-card">
          <div className="form-group">
            <label className="form-label">服务商</label>
            <select
              className="form-select"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
            >
              {Object.entries(PROVIDER_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>{preset.label}</option>
              ))}
              <option value="custom">自定义</option>
            </select>
          </div>

          <div className="provider-presets">
            {Object.entries(PROVIDER_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                className={`preset-btn ${provider === key ? 'active' : ''}`}
                onClick={() => handleProviderChange(key)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label">API 密钥</label>
            <input
              type="password"
              className="form-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">接口地址</label>
            <input
              type="text"
              className="form-input"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">选择模型</label>
            {provider !== 'custom' && PROVIDER_PRESETS[provider]?.models ? (
              <select
                className="form-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                {PROVIDER_PRESETS[provider].models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="form-input"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="输入模型名称"
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">创造性: {temperature}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">最大输出长度</label>
            <input
              type="number"
              className="form-input"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
              min="256"
              max="128000"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={handleTestApi}
              disabled={testing || !apiKey}
            >
              {testing ? '测试中...' : '🔌 测试连接'}
            </button>
            {testResult && (
              <span style={{ color: testResult.success ? 'var(--success-color)' : 'var(--error-color)', fontSize: '13px' }}>
                {testResult.message}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">
          🎯 匹配设置
        </div>
        <div className="settings-card">
          <div className="form-group">
            <label className="form-label">专家匹配模式</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <label>
                <input
                  type="radio"
                  name="matchingMode"
                  value="auto"
                  checked={matchingMode === 'auto'}
                  onChange={(e) => setMatchingMode(e.target.value)}
                />
                自动选择推荐专家
              </label>
              <label>
                <input
                  type="radio"
                  name="matchingMode"
                  value="top3"
                  checked={matchingMode === 'top3'}
                  onChange={(e) => setMatchingMode(e.target.value)}
                />
                显示前 3 名让我选择（推荐）
              </label>
              <label>
                <input
                  type="radio"
                  name="matchingMode"
                  value="manual"
                  checked={matchingMode === 'manual'}
                  onChange={(e) => setMatchingMode(e.target.value)}
                />
                总是让我手动选择
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">
          📊 专家库
        </div>
        <div className="settings-card">
          <div style={{ marginBottom: '12px', fontSize: '13px' }}>
            已导入 <strong style={{ color: 'var(--accent-color)' }}>{agents.length}</strong> 个专家
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary">🔄 更新</button>
            <button className="btn btn-secondary">📥 导入</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button className="btn btn-primary" onClick={handleSave}>
          💾 保存设置
        </button>
      </div>
    </div>
  )
}
