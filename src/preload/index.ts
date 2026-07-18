import { contextBridge, ipcRenderer } from 'electron'

const api = {
  agents: {
    list: () => ipcRenderer.invoke('agents:list'),
    search: (q: string) => ipcRenderer.invoke('agents:search', q),
    getById: (id: string) => ipcRenderer.invoke('agents:getById', id),
    browse: (division: string) => ipcRenderer.invoke('agents:browse', division),
    import: (dirPath: string) => ipcRenderer.invoke('agents:import', dirPath)
  },
  tasks: {
    analyze: (input: string) => ipcRenderer.invoke('tasks:analyze', input),
    match: (input: string) => ipcRenderer.invoke('tasks:match', input),
    executeStream: (agentId: string, task: string, cb: (chunk: string) => void) => {
      const ch = `stream:${Date.now()}`
      ipcRenderer.on(ch, (_, c) => cb(c))
      ipcRenderer.invoke('tasks:executeStream', agentId, task, ch)
    },
    history: () => ipcRenderer.invoke('tasks:history'),
    rate: (taskId: string, rating: number) => ipcRenderer.invoke('tasks:rate', taskId, rating)
  },
  output: {
    copy: (content: string, format: string) => ipcRenderer.invoke('output:copy', content, format),
    saveFile: (content: string, name: string) => ipcRenderer.invoke('output:saveFile', content, name),
    generateProject: (output: string) => ipcRenderer.invoke('output:generateProject', output),
    exportDoc: (content: string, format: string) => ipcRenderer.invoke('output:exportDoc', content, format),
    openInVSCode: (dir: string) => ipcRenderer.invoke('output:openInVSCode', dir)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (s: any) => ipcRenderer.invoke('settings:save', s),
    testApi: (c: any) => ipcRenderer.invoke('settings:testApi', c)
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)
