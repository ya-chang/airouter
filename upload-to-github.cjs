const { Octokit } = require('octokit');
const fs = require('fs');
const path = require('path');
const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const TOKEN = process.argv[2];
const REPO_NAME = 'airouter';

async function main() {
  const octokit = new Octokit({ 
    auth: TOKEN,
    request: { agent: new https.Agent({ rejectUnauthorized: false }) }
  });
  
  const { data: user } = await octokit.rest.users.getAuthenticated();
  console.log(`✅ 用户: ${user.login}`);

  // 获取仓库
  const { data: repo } = await octokit.rest.repos.get({ owner: user.login, repo: REPO_NAME });
  const defaultBranch = repo.default_branch || 'main';

  // 收集文件
  const excludePatterns = ['node_modules', 'dist', 'out', '.git', '.mimocode', 'convert-icon.cjs', 'package-lock.json', 'upload-to-github.cjs'];
  
  function getFiles(dir, relativePath = '') {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      if (excludePatterns.some(p => entry.name === p) || entry.name.endsWith('.blockmap')) continue;
      if (entry.isDirectory()) {
        files.push(...getFiles(fullPath, relPath));
      } else {
        const ext = path.extname(entry.name);
        const includeExts = ['.ts', '.tsx', '.js', '.json', '.md', '.html', '.css', '.txt', '.yml', '.yaml'];
        if (includeExts.includes(ext) || entry.name === '.gitignore' || entry.name === 'LICENSE') {
          files.push({ path: relPath, fullPath });
        }
      }
    }
    return files;
  }

  console.log('📁 收集文件...');
  const files = getFiles('.');
  console.log(`   共 ${files.length} 个文件`);

  // 尝试获取现有 tree
  let baseTreeSha = null;
  try {
    const { data: ref } = await octokit.rest.git.getRef({ owner: user.login, repo: REPO_NAME, ref: `heads/${defaultBranch}` });
    baseTreeSha = ref.object.sha;
  } catch (e) {
    console.log('   仓库为空，创建初始提交...');
  }

  // 逐个创建 blob
  console.log('📤 上传文件...');
  const treeItems = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file.fullPath, 'utf-8');
      const { data: blob } = await octokit.rest.git.createBlob({
        owner: user.login,
        repo: REPO_NAME,
        content: content,
        encoding: 'utf-8'
      });
      treeItems.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
      process.stdout.write(`   ✅ ${file.path}\n`);
    } catch (e) {
      console.error(`   ❌ ${file.path}: ${e.message}`);
    }
  }

  // 创建 tree
  const treeData = { tree: treeItems };
  if (baseTreeSha) {
    // 获取当前 tree SHA
    const { data: commit } = await octokit.rest.git.getCommit({ owner: user.login, repo: REPO_NAME, commit_sha: baseTreeSha });
    treeData.base_tree = commit.tree.sha;
  }
  
  const { data: newTree } = await octokit.rest.git.createTree({ owner: user.login, repo: REPO_NAME, ...treeData });

  // 创建 commit
  const commitData = {
    message: 'feat: AiRouter - AI 的 AI\n\n- 345+ 专业 AI 专家模板\n- 多 Provider 支持 (DeepSeek/硅基流动/Kimi/OpenAI/Claude)\n- 智能匹配算法\n- 多专家并行执行\n- Windows 安装包',
    tree: newTree.sha
  };
  if (baseTreeSha) {
    commitData.parents = [baseTreeSha];
  }
  
  const { data: commit } = await octokit.rest.git.createCommit({ owner: user.login, repo: REPO_NAME, ...commitData });

  // 更新或创建 ref
  try {
    await octokit.rest.git.updateRef({ owner: user.login, repo: REPO_NAME, ref: `heads/${defaultBranch}`, sha: commit.sha });
  } catch (e) {
    await octokit.rest.git.createRef({ owner: user.login, repo: REPO_NAME, ref: `refs/heads/${defaultBranch}`, sha: commit.sha });
  }

  console.log('\n🎉 上传完成！');
  console.log(`🔗 https://github.com/${user.login}/${REPO_NAME}`);
}

main().catch(e => console.error('❌ 错误:', e.message));
