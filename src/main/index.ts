import { app, BrowserWindow, shell, ipcMain, clipboard, dialog } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { exec } from 'child_process'
import { AgentManager } from './agent-manager'
import { TaskAnalyzer } from './task-analyzer'
import { AgentMatcher } from './agent-matcher'
import { ExecutionEngine } from './execution-engine'
import { OutputManager } from './output-manager'
import { SettingsManager } from './settings-manager'

const isDev = !app.isPackaged

let mainWindow: BrowserWindow | null = null
let agentManager: AgentManager
let taskAnalyzer: TaskAnalyzer
let agentMatcher: AgentMatcher
let executionEngine: ExecutionEngine
let outputManager: OutputManager
let settingsManager: SettingsManager

// 简单的内存数据库
const memoryDb: Record<string, any> = {
  agents: [],
  agentTags: [],
  taskHistory: [],
  settings: {}
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIPC(): void {
  // Agents
  ipcMain.handle('agents:list', () => agentManager.listAgents())
  ipcMain.handle('agents:search', (_, query: string) => agentManager.searchAgents(query))
  ipcMain.handle('agents:getById', (_, id: string) => agentManager.getAgentById(id))
  ipcMain.handle('agents:browse', (_, division: string) => agentManager.getAgentsByDivision(division))
  ipcMain.handle('agents:import', (_, dirPath: string) => agentManager.importAgents(dirPath))

  // Tasks
  ipcMain.handle('tasks:analyze', (_, input: string) => taskAnalyzer.analyzeTask(input))
  ipcMain.handle('tasks:match', (_, input: string) => agentMatcher.matchAgents(input))
  ipcMain.handle('tasks:executeStream', async (_, agentId: string, task: string, channel: string) => {
    const agent = agentManager.getAgentById(agentId)
    if (!agent) throw new Error('Agent not found')
    
    const config = settingsManager.getApiConfig()
    const result = await executionEngine.execute(
      agent,
      task,
      config,
      (chunk) => mainWindow?.webContents.send(channel, chunk)
    )
    return result
  })
  ipcMain.handle('tasks:history', () => memoryDb.taskHistory)
  ipcMain.handle('tasks:rate', (_, taskId: string, rating: number) => {
    const task = memoryDb.taskHistory.find((t: any) => t.id === taskId)
    if (task) task.rating = rating
  })

  // Output
  ipcMain.handle('output:copy', (_, content: string, format: string) => {
    const text = format === 'code' ? extractCodeBlocks(content).join('\n\n') : content
    clipboard.writeText(text)
    return true
  })
  ipcMain.handle('output:saveFile', async (_, content: string, suggestedName: string) => {
    const result = await dialog.showSaveDialog({
      defaultPath: suggestedName,
      filters: [{ name: 'All Files', extensions: ['*'] }]
    })
    if (!result.canceled && result.filePath) {
      writeFileSync(result.filePath, content, 'utf-8')
      return { success: true, path: result.filePath }
    }
    return { success: false }
  })
  ipcMain.handle('output:generateProject', async (_, output: string) => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.filePaths[0]) {
      return outputManager.generateProject(output, result.filePaths[0])
    }
    return { success: false }
  })
  ipcMain.handle('output:exportDoc', (_, content: string, format: string) => {
    return outputManager.exportDocument(content, format)
  })
  ipcMain.handle('output:openInVSCode', (_, dir: string) => {
    exec(`code "${dir}"`)
  })

  // Settings
  ipcMain.handle('settings:get', () => settingsManager.getSettings())
  ipcMain.handle('settings:save', (_, settings) => settingsManager.saveSettings(settings))
  ipcMain.handle('settings:testApi', (_, config) => settingsManager.testApiConnection(config))
}

function extractCodeBlocks(content: string): string[] {
  const blocks: string[] = []
  const regex = /```(\w+)?\s*\n([\s\S]*?)```/g
  let match
  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[2].trim())
  }
  return blocks.length > 0 ? blocks : [content]
}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    agentManager = new AgentManager(memoryDb)
    taskAnalyzer = new TaskAnalyzer()
    agentMatcher = new AgentMatcher(memoryDb, taskAnalyzer)
    executionEngine = new ExecutionEngine()
    outputManager = new OutputManager()
    settingsManager = new SettingsManager(memoryDb)

    registerIPC()
    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
