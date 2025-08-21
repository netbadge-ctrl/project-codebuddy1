import React, { useState } from 'react';
import { X, Send, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  mentions: string[];
}

interface User {
  id: string;
  name: string;
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  comments: Comment[];
  users: User[];
  onAddComment: (text: string, mentions: string[]) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  projectName,
  comments,
  users,
  onAddComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [mentionStart, setMentionStart] = useState(-1);

  // 获取用户信息
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 处理@提及
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setNewComment(text);
    
    // 检查是否输入了@符号
    const atIndex = text.lastIndexOf('@', cursorPosition - 1);
    if (atIndex !== -1 && (atIndex === 0 || text[atIndex - 1] === ' ')) {
      const afterAt = text.substring(atIndex + 1, cursorPosition);
      if (!afterAt.includes(' ')) {
        setMentionStart(atIndex);
        setShowUserList(true);
        return;
      }
    }
    
    setShowUserList(false);
    setMentionStart(-1);
  };

  // 选择用户进行@提及
  const selectUser = (user: User) => {
    if (mentionStart === -1) return;
    
    const beforeMention = newComment.substring(0, mentionStart);
    const afterMention = newComment.substring(mentionStart + 1);
    const afterSpace = afterMention.indexOf(' ');
    const restText = afterSpace === -1 ? '' : afterMention.substring(afterSpace);
    
    const newText = `${beforeMention}@${user.name}${restText}`;
    setNewComment(newText);
    setShowUserList(false);
    setMentionStart(-1);
  };

  // 提交评论
  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    // 提取@提及的用户
    const mentions: string[] = [];
    const mentionRegex = /@(\S+)/g;
    let match;
    
    while ((match = mentionRegex.exec(newComment)) !== null) {
      const mentionedName = match[1];
      const mentionedUser = users.find(user => user.name === mentionedName);
      if (mentionedUser) {
        mentions.push(mentionedUser.id);
      }
    }
    
    onAddComment(newComment, mentions);
    setNewComment('');
  };

  // 渲染评论文本，高亮@提及
  const renderCommentText = (text: string, commentMentions: string[]) => {
    const parts = text.split(/(@\S+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const mentionedName = part.substring(1);
        const mentionedUser = users.find(user => user.name === mentionedName);
        if (mentionedUser && commentMentions.includes(mentionedUser.id)) {
          return (
            <span key={index} className="text-blue-600 font-medium">
              {part}
            </span>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-medium">
            "{projectName}" 的评论
          </DialogTitle>
        </DialogHeader>

        {/* 评论列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-[300px] max-h-[400px]">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              暂无评论
            </div>
          ) : (
            comments.map((comment) => {
              const user = getUserById(comment.userId);
              return (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-8 w-8 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {user?.name || '未知用户'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 leading-relaxed">
                      {renderCommentText(comment.text, comment.mentions)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <div className="h-8 w-8 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1 relative">
              <Textarea
                value={newComment}
                onChange={handleTextChange}
                placeholder="添加评论... 输入 @ 来提及某人"
                className="min-h-[60px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleSubmit();
                  }
                }}
              />
              
              {/* @提及用户列表 */}
              {showUserList && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                      onClick={() => selectUser(user)}
                    >
                      <div className="h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-600" />
                      </div>
                      <span className="text-sm">{user.name}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                >
                  <Send className="h-3 w-3 mr-1" />
                  发送
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentModal;