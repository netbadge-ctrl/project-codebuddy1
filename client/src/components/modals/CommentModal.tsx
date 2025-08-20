import React, { useState } from 'react';
import { Project, Comment } from '../../types';
import Modal from '../Modal';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../api';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { formatTimeToNow } from '../../utils/date';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, project }) => {
  const { users, updateProjectInState } = useData();
  const { user: currentUser } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  if (!project || !currentUser) return null;

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setIsPosting(true);
    const commentToAdd: Comment = {
      id: `c-${uuidv4()}`,
      userId: currentUser.id,
      text: newComment,
      createdAt: new Date().toISOString(),
      mentions: [], // Basic implementation, can be extended for @mentions
    };

    const updatedComments = [...project.comments, commentToAdd];

    try {
      const updatedProject = await api.updateProject(project.id, { comments: updatedComments });
      updateProjectInState(updatedProject);
      toast.success('评论已发布！');
      setNewComment('');
    } catch (error) {
      toast.error('发布评论失败，请重试。');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`评论 - ${project.name}`}>
      <div className="flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {project.comments.length > 0 ? (
            project.comments.map((comment) => {
              const user = users.find(u => u.id === comment.userId);
              return (
                <div key={comment.id} className="flex items-start space-x-3">
                  <img src={user?.avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{user?.name}</p>
                    <p className="text-sm bg-gray-100 p-2 rounded-md">{comment.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTimeToNow(comment.createdAt)}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-8">暂无评论，快来抢沙发吧！</p>
          )}
        </div>
        <div className="mt-4 border-t pt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="添加评论..."
            className="w-full p-2 border rounded-md"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handlePostComment}
              disabled={isPosting || !newComment.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isPosting ? '发布中...' : '发布'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CommentModal;