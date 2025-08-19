import { pinyin } from 'pinyin-pro';
import { Comment, User } from './types';

export const fuzzySearch = (searchText: string, targetText: string): boolean => {
    if (!searchText) return true;
    if (!targetText) return false;

    const search = searchText.toLowerCase();
    const target = targetText.toLowerCase();

    // 1. Direct inclusion check (fastest)
    if (target.includes(search)) {
        return true;
    }

    // 2. Pinyin-based search
    try {
        // Full pinyin: '项目' -> 'xiang mu'
        const targetPinyin = pinyin(target, { toneType: 'none', nonZh: 'consecutive' }).toLowerCase();
        // Initial letters: '项目' -> 'xm'
        const targetPinyinInitials = pinyin(target, { pattern: 'initial', nonZh: 'consecutive' }).toLowerCase();

        if (targetPinyin.includes(search) || targetPinyinInitials.includes(search)) {
            return true;
        }
    } catch (e) {
        // In case pinyin-pro fails in some environments
        console.error("Pinyin conversion failed", e);
    }
    
    // 3. Sequential character check (original fuzzy logic)
    let searchIndex = 0;
    for (let i = 0; i < target.length; i++) {
        if (target[i] === search[searchIndex]) {
            searchIndex++;
        }
        if (searchIndex === search.length) {
            return true;
        }
    }

    return false;
};

export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export const renderCommentTextAsHtml = (comment: Comment, allUsers: User[]): string => {
    let text = comment.text;
    // Basic HTML escaping
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    if (!comment.mentions || comment.mentions.length === 0) {
        return text.replace(/\n/g, '<br />');
    }

    const mentionedUsers = comment.mentions
        .map(id => allUsers.find(u => u.id === id))
        .filter((u): u is User => !!u);

    mentionedUsers.forEach(user => {
        // Escape user name for regex
        const escapedName = user.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`@${escapedName}`, 'g');
        text = text.replace(regex, `<span class="font-semibold text-indigo-400">@${user.name}</span>`);
    });

    return text.replace(/\n/g, '<br />');
};