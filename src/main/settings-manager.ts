import { safeStorage } from 'electron'

export interface Settings {
  api: APIConfig
  matching: MatchingSettings
  general: GeneralSettings
}

export interface APIConfig {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
  temperature?: number
  maxTokens?: number
}

export interface MatchingSettings {
  mode: 'auto' | 'top3' | 'manual'
}

export interface GeneralSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'zh' | 'en'
}

export class SettingsManager {
  private db: Record<string, any>

  constructor(db: Record<string, any>) {
    this.db = db
  }

  getSettings(): Settings {
    return this.db.settings || this.getDefaultSettings()
  }

  getApiConfig(): APIConfig {
    return this.db.settings?.api || this.getDefaultSettings().api
  }

  saveSettings(settings: Settings): void {
    this.db.settings = settings
  }

  private getDefaultSettings(): Settings {
    return {
      api: { provider: 'deepseek', apiKey: '', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', temperature: 0.7, maxTokens: 4096 },
      matching: { mode: 'top3' },
      general: { theme: 'light', language: 'zh' }
    }
  }

  async testApiConnection(config: APIConfig): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${config.baseUrl}/models`, { method: 'GET', headers: { 'Authorization': `Bearer ${config.apiKey}` } })
      if (response.ok) return { success: true, message: '连接成功' }
      const error = await response.text()
      return { success: false, message: `连接失败: ${response.status} ${error}` }
    } catch (error) {
      return { success: false, message: `连接错误: ${(error as Error).message}` }
    }
  }
}
