const fs = require('fs');
const path = require('path');

const version = process.argv[2];
if (!version) {
  console.error('请提供版本号，例如: node backup-version.js 1.1');
  process.exit(1);
}

const backupDir = path.join(__dirname, '..', 'versions', version);

// 创建版本目录
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// 需要备份的文件和目录
const filesToBackup = [
  'package.json',
  'server/',
  'client/',
  'project-management-ui/',
  'scripts/',
  '.env.example'
];

// 复制文件函数
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
      // 跳过 node_modules 和 build 目录
      if (file === 'node_modules' || file === 'build' || file === 'dist') {
        return;
      }
      
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      copyRecursive(srcPath, destPath);
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 执行备份
console.log(`开始备份版本 ${version}...`);

filesToBackup.forEach(item => {
  const srcPath = path.join(__dirname, '..', item);
  const destPath = path.join(backupDir, item);
  
  if (fs.existsSync(srcPath)) {
    console.log(`备份: ${item}`);
    copyRecursive(srcPath, destPath);
  } else {
    console.log(`跳过不存在的文件: ${item}`);
  }
});

// 创建版本信息文件
const versionInfo = {
  version: version,
  timestamp: new Date().toISOString(),
  description: `项目管理应用版本 ${version}`,
  features: [
    '完整的全栈项目管理系统',
    '五大视图模块（个人视图、项目总览、OKR管理、看板视图、周会视图）',
    '完整的用户认证和权限管理',
    '项目状态管理和变更记录',
    '评论系统和@提及功能',
    '筛选和搜索功能',
    '响应式设计'
  ]
};

fs.writeFileSync(
  path.join(backupDir, 'version-info.json'),
  JSON.stringify(versionInfo, null, 2)
);

console.log(`版本 ${version} 备份完成！`);
console.log(`备份位置: ${backupDir}`);