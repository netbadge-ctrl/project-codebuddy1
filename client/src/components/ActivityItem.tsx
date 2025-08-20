import React from 'react';
import { Comment, Project, User } from '../types';
import { useData } from '../contexts/DataContext';
import { formatTimeToNow } from '../utils/date';
import { MessageSquare } from 'lucide-react';

interface ActivityItemProps {
  comment: Comment;
  project: Project;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ comment, project }) => {
  const { users } = useData();
  const commenter = users.find(u => u.id === comment.userId);

  if (!commenter) {
    return null; // Don't render if commenter not found
  }

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-200 last:border-b-0">
      <img src={commenter.avatarUrl} alt={commenter.name} className="w-8 h-8 rounded-full" />
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-semibold">{commenter.name}</span>
          <span className="text-gray-500"> 评论了项目 </span>
          <span className="font-semibold">{project.name}</span>
        </p>
        <div className="mt-1 p-2 bg-gray-100 rounded-md text-sm text-gray-800">
          {comment.text}
        </div>
        <p className="text-xs text-gray-400 mt-1">{formatTimeToNow(comment.createdAt)}</p>
      </div>
    </div>
  );
};

export default ActivityItem;