import React from 'react';
import { Comment, Project, User } from '../types';
import { formatDateTime, renderCommentTextAsHtml } from '../utils';
import { IconMessageSquare } from './Icons';

interface ActivityItemProps {
    comment: Comment;
    project: Project;
    allUsers: User[];
    currentUser: User;
    onReply: (project: Project, user: User) => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ comment, project, allUsers, currentUser, onReply }) => {
    const author = allUsers.find(u => u.id === comment.userId);

    if (!author) return null;

    const handleReply = () => {
        if (author.id !== currentUser.id) {
            onReply(project, author);
        }
    };

    const isMentioned = comment.mentions?.includes(currentUser.id);

    return (
        <div className="flex items-start gap-4 relative">
            {isMentioned && (
                <div className="absolute -left-8 top-3 text-indigo-500 dark:text-indigo-400" title="你被提及了">
                    <IconMessageSquare className="w-4 h-4 fill-indigo-500/20 dark:fill-indigo-400/20" />
                </div>
            )}
            <img src={author.avatarUrl} alt={author.name} className="w-10 h-10 rounded-full flex-shrink-0 mt-1" />
            <div className="flex-grow bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#363636] rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="font-semibold text-gray-900 dark:text-white">{author.name}</span>
                        <span className="text-gray-500 dark:text-gray-400"> 评论于 </span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{project.name}</span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{formatDateTime(comment.createdAt)}</span>
                </div>
                <div 
                    className="mt-2 text-gray-700 dark:text-gray-300 text-sm"
                    dangerouslySetInnerHTML={{ __html: renderCommentTextAsHtml(comment, allUsers) }}
                />
                 {author.id !== currentUser.id && (
                    <div className="mt-3 flex justify-end">
                        <button 
                            onClick={handleReply}
                            className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors"
                        >
                            回复
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};