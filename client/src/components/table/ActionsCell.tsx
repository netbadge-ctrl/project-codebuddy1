import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, Star, MessageSquare, History, Trash2 } from 'lucide-react';
import { Project } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ActionsCellProps {
  project: Project;
  onToggleFollow: () => void;
  onComment: () => void;
  onChangeLog: () => void;
  onDelete: () => void;
}

const ActionsCell: React.FC<ActionsCellProps> = ({
  project,
  onToggleFollow,
  onComment,
  onChangeLog,
  onDelete,
}) => {
  const { user } = useAuth();
  const isFollowing = user ? project.followers.includes(user.id) : false;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex justify-center w-full px-2 py-2 text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          <MoreVertical className="w-5 h-5" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onToggleFollow}
                  className={`${
                    active ? 'bg-blue-500 text-white' : 'text-gray-900'
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                >
                  <Star className="w-5 h-5 mr-2" />
                  {isFollowing ? '取消关注' : '关注项目'}
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onComment}
                  className={`${
                    active ? 'bg-blue-500 text-white' : 'text-gray-900'
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  评论
                </button>
              )}
            </Menu.Item>
          </div>
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onChangeLog}
                  className={`${
                    active ? 'bg-blue-500 text-white' : 'text-gray-900'
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                >
                  <History className="w-5 h-5 mr-2" />
                  变更记录
                </button>
              )}
            </Menu.Item>
          </div>
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onDelete}
                  className={`${
                    active ? 'bg-red-500 text-white' : 'text-red-900'
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  删除项目
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default ActionsCell;