import { pinyin } from 'pinyin-pro';
import { Project, User, OKR, KeyResult } from './types';

// 模糊搜索函数
export function fuzzySearch(text: string, query: string): boolean {
  if (!query.trim()) return true;
  
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedText = text.toLowerCase();
  
  // 直接匹配
  if (normalizedText.includes(normalizedQuery)) {
    return true;
  }
  
  // 拼音全拼匹配
  const fullPinyin = pinyin(text, { toneType: 'none', type: 'array' }).join('');
  if (fullPinyin.toLowerCase().includes(normalizedQuery)) {
    return true;
  }
  
  // 拼音首字母匹配
  const firstLetters = pinyin(text, { pattern: 'first', toneType: 'none', type: 'array' }).join('');
  if (firstLetters.toLowerCase().includes(normalizedQuery)) {
    return true;
  }
  
  return false;
}

// 格式化日期
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// 格式化相对时间
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
  
  return `${Math.floor(diffDays / 365)}年前`;
}

// 获取用户显示名称
export function getUserDisplayName(userId: string, users: User[]): string {
  const user = users.find(u => u.id === userId);
  return user?.name || '未知用户';
}

// 获取项目团队成员
export function getProjectTeamMembers(project: Project): string[] {
  const allMembers = [
    ...project.productManagers.map(pm => pm.userId),
    ...project.backendDevelopers.map(bd => bd.userId),
    ...project.frontendDevelopers.map(fd => fd.userId),
    ...project.qaTesters.map(qt => qt.userId)
  ];
  
  return Array.from(new Set(allMembers));
}

// 检查用户是否参与项目
export function isUserInProject(userId: string, project: Project): boolean {
  return getProjectTeamMembers(project).includes(userId);
}

// 获取项目关联的OKR信息
export function getProjectOKRInfo(project: Project, okrSets: any[]): { okr: OKR; kr: KeyResult }[] {
  const result: { okr: OKR; kr: KeyResult }[] = [];
  
  for (const krId of project.keyResultIds) {
    for (const okrSet of okrSets) {
      for (const okr of okrSet.okrs) {
        const kr = okr.keyResults.find((kr: KeyResult) => kr.id === krId);
        if (kr) {
          result.push({ okr, kr });
        }
      }
    }
  }
  
  return result;
}

// 生成随机ID
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${randomStr}`;
}

// 深拷贝对象
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 计算两个日期之间的工作日数量
export function getWorkdaysBetween(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 不是周末
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 截断文本
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// 获取文件扩展名
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}