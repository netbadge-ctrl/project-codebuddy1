import { formatDistanceToNow, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatTimeToNow = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};