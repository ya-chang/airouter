import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { dialog } from 'electron'

export interface ProjectFile {
  path: string
  content: string
}

export class OutputManager {
  generateProject(output: string, targetDir: string): { success: boolean; dir: string; count: number; files: string[] } {
    const files = this.parseProjectFiles(output)
    
    if (files.length === 0) {
      const filePath = join(targetDir, 'output.md')
      writeFileSync(filePath, output, 'utf-8')
      return { success: true, dir: targetDir, count: 1, files: ['output.md'] }
    }

    const writtenFiles: string[] = []
    for (const file of files) {
      const fullPath = join(targetDir, file.path)
      const dir = dirname(fullPath)
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      writeFileSync(fullPath, file.content, 'utf-8')
      writtenFiles.push(file.path)
    }

    const readme = this.generateREADME(files)
    writeFileSync(join(targetDir, 'README.md'), readme, 'utf-8')
    writtenFiles.push('README.md')

    return { success: true, dir: targetDir, count: writtenFiles.length, files: writtenFiles }
  }

  private parseProjectFiles(output: string): ProjectFile[] {
    const files: ProjectFile[] = []
    const regex = /```(\w+)?\s+(.+?)\n([\s\S]*?)```/g
    let match
    while ((match = regex.exec(output)) !== null) {
      const [, , filePath, content] = match
      if (filePath && content) files.push({ path: filePath.trim(), content: content.trim() })
    }
    return files
  }

  private generateREADME(files: ProjectFile[]): string {
    const lines = ['# 生成的项目', '', '由 AiRouter 生成。', '', '## 文件列表', '']
    for (const file of files) lines.push(`- \`${file.path}\``)
    lines.push('', '---', '*AiRouter - AI 的 AI*')
    return lines.join('\n')
  }

  async exportDocument(content: string, format: 'md' | 'txt'): Promise<{ success: boolean; path?: string }> {
    const ext = format === 'md' ? 'md' : 'txt'
    const result = await dialog.showSaveDialog({ defaultPath: `document.${ext}`, filters: [{ name: format === 'md' ? 'Markdown' : 'Text', extensions: [ext] }] })
    if (!result.canceled && result.filePath) {
      writeFileSync(result.filePath, content, 'utf-8')
      return { success: true, path: result.filePath }
    }
    return { success: false }
  }
}
