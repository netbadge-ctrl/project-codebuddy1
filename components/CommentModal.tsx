import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Project, User, Comment } from '../types';
import { IconX } from './Icons';
import { formatDateTime, fuzzySearch, renderCommentTextAsHtml } from '../utils';

interface CommentModalProps {
  project: Project;
  allUsers: User[];
  currentUser: User;
  onClose: () => void;
  onAddComment: (projectId: string, text: string, mentions: string[]) => void;
  replyToUser?: User;
}

export const CommentModal: React.FC<CommentModalProps> = ({ project, allUsers, currentUser, onClose, onAddComment, replyToUser }) => {
  const [newComment, setNewComment] = useState('');
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionPopup, setMentionPopup] = useState<{ show: boolean; filter: string }>({ show: false, filter: '' });
  
  const getUser = (userId: string) => allUsers.find(u => u.id === userId);

  useEffect(() => {
    if (replyToUser) {
        setNewComment(`@${replyToUser.name} `);
        setMentionedUserIds(ids => [...new Set([...ids, replyToUser.id])]);
        textareaRef.current?.focus();
    }
  }, [replyToUser]);

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(project.id, newComment.trim(), mentionedUserIds);
      setNewComment('');
      setMentionedUserIds([]);
    }
  };

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [project.comments]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewComment(text);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\S*)$/);
    
    if (mentionMatch) {
        setMentionPopup({ show: true, filter: mentionMatch[1] });
    } else {
        setMentionPopup({ show: false, filter: '' });
    }
  };

  const handleSelectMention = (user: User) => {
    const currentText = newComment;
    const cursorPos = textareaRef.current?.selectionStart || currentText.length;
    const textBeforeCursor = currentText.substring(0, cursorPos);
    
    const newText = textBeforeCursor.replace(/@\S*$/, `@${user.name} `) + currentText.substring(cursorPos);

    setNewComment(newText);
    setMentionedUserIds(ids => [...new Set([...ids, user.id])]);
    setMentionPopup({ show: false, filter: '' });
    
    setTimeout(() => textareaRef.current?.focus(), 0);
  };
  
  const filteredMentionUsers = useMemo(() => {
      if (!mentionPopup.show) return [];
      const mentionedIdsSet = new Set(mentionedUserIds);
      return allUsers.filter(u => u.id !== currentUser.id && !mentionedIdsSet.has(u.id) && fuzzySearch(mentionPopup.filter, u.name));
  }, [mentionPopup, allUsers, currentUser.id, mentionedUserIds]);


  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#363636] rounded-xl w-full max-w-2xl text-gray-900 dark:text-white shadow-lg flex flex-col h-[70vh]">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-[#363636]">
          <h2 id="modal-title" className="text-xl font-bold">"{project.name}" 的评论</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700" aria-label="关闭">
            <IconX className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
          {project.comments.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 pt-10">暂无评论</div>
          ) : (
            project.comments.map(comment => {
              const user = getUser(comment.userId);
              return (
                <div key={comment.id} className="flex items-start gap-3">
                  <img src={user?.avatarUrl} alt={user?.name} className="w-9 h-9 rounded-full mt-1" />
                  <div className="flex-grow">
                    <div className="flex items-baseline gap-2">
                       <span className="font-semibold text-gray-900 dark:text-white">{user?.name}</span>
                       <span className="text-xs text-gray-500 dark:text-gray-500">{formatDateTime(comment.createdAt)}</span>
                    </div>
                    <div className="mt-1 bg-gray-100 dark:bg-[#2d2d2d] rounded-lg p-3 text-sm" dangerouslySetInnerHTML={{ __html: renderCommentTextAsHtml(comment, allUsers) }}></div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-[#363636]">
          <div className="flex items-start gap-3">
             <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-9 h-9 rounded-full mt-1" />
             <div className="flex-grow relative">
                {mentionPopup.show && filteredMentionUsers.length > 0 && (
                    <div className="absolute bottom-full mb-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#4a4a4a] rounded-lg shadow-xl z-10 p-1">
                        <ul>
                            {filteredMentionUsers.slice(0, 5).map(user => (
                                <li key={user.id}>
                                    <button onClick={() => handleSelectMention(user)} className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a]">
                                        <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full"/>
                                        <span className="text-sm font-semibold">{user.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <textarea
                    ref={textareaRef}
                    value={newComment}
                    onChange={handleTextChange}
                    placeholder="添加评论... 输入 @ 来提及他人"
                    className="w-full bg-gray-100 dark:bg-[#2d2d2d] border border-gray-300 dark:border-[#4a4a4a] rounded-md px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] resize-none"
                    rows={3}
                />
                <div className="flex justify-end mt-2">
                    <button 
                        onClick={handleSubmit}
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-[#6C63FF] text-white rounded-lg font-semibold text-sm hover:bg-[#5a52d9] disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        发送
                    </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};