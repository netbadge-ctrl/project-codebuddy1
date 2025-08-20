import { pinyin } from 'pinyin-pro';

// A simple fuzzy search function that supports Chinese characters, full pinyin, and initial pinyin letters.
export const fuzzySearch = (text: string, query: string): boolean => {
  if (!query) return true;
  if (!text) return false;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Direct match
  if (lowerText.includes(lowerQuery)) {
    return true;
  }

  // Pinyin match
  const pinyinText = pinyin(text, { toneType: 'none', nonZh: 'consecutive' }).toLowerCase();
  if (pinyinText.includes(lowerQuery)) {
    return true;
  }

  // Pinyin initial letters match
  const pinyinInitials = pinyin(text, { pattern: 'first', toneType: 'none', nonZh: 'consecutive' }).toLowerCase();
  if (pinyinInitials.includes(lowerQuery)) {
    return true;
  }

  return false;
};