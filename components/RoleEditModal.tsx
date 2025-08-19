import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Project, User, Role, TeamMember, ProjectRoleKey } from '../types';
import { IconX, IconTrash, IconCalendar, IconPlus, IconLink } from './Icons';
import { DateRangePicker } from './DateRangePicker';

interface RoleEditModalProps {
  project: Project;
  roleKey: ProjectRoleKey;
  roleName: string;
  allUsers: User[];
  onClose: () => void;
  onSave: (projectId: string, roleKey: ProjectRoleKey, newRole: Role) => void;
}

type TeamMemberWithState = TeamMember & { useSharedSchedule: boolean; _tempId: string };

export const RoleEditModal: React.FC<RoleEditModalProps> = ({ project, roleKey, roleName, allUsers, onClose, onSave }) => {
  const [sharedStartDate, setSharedStartDate] = useState('');
  const [sharedEndDate, setSharedEndDate] = useState('');
  
  const [currentTeam, setCurrentTeam] = useState<TeamMemberWithState[]>(
    (project[roleKey] || []).map((m, index) => ({ 
        ...m, 
        useSharedSchedule: m.useSharedSchedule ?? false,
        _tempId: `member_${index}_${Date.now()}`
    }))
  );
  
  const [isAddingMember, setIsAddingMember] = useState(false);
  const addMemberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const firstSharedMember = (project[roleKey] || []).find(m => m.useSharedSchedule);
    if (firstSharedMember) {
        setSharedStartDate(firstSharedMember.startDate || '');
        setSharedEndDate(firstSharedMember.endDate || '');
    }
  }, [project, roleKey]);

  const availableUsers = useMemo(() => {
    const teamUserIds = new Set(currentTeam.map(m => m.userId));
    return allUsers.filter(u => !teamUserIds.has(u.id));
  }, [allUsers, currentTeam]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMemberRef.current && !addMemberRef.current.contains(event.target as Node)) {
        setIsAddingMember(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddMember = (userId: string) => {
    if (userId) {
      const newMember: TeamMemberWithState = {
        userId,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        useSharedSchedule: false,
        _tempId: `member_new_${Date.now()}`
      };
      setCurrentTeam(prev => [...prev, newMember]);
      setIsAddingMember(false);
    }
  };

  const handleUpdateMember = (tempId: string, newUserId: string) => {
    setCurrentTeam(prevTeam => prevTeam.map(m => m._tempId === tempId ? { ...m, userId: newUserId } : m));
  };

  const handleRemoveMember = (tempId: string) => {
    setCurrentTeam(prev => prev.filter(m => m._tempId !== tempId));
  };
  
  const handleIndividualDateChange = (tempId: string, startDate: string, endDate: string) => {
    setCurrentTeam(prev => prev.map(m => m._tempId === tempId ? {...m, startDate, endDate } : m));
  };
  
  const handleToggleSharedSchedule = (tempId: string) => {
    setCurrentTeam(prev => prev.map(m => m._tempId === tempId ? { ...m, useSharedSchedule: !m.useSharedSchedule } : m));
  };
  
  const handleSave = () => {
    const finalTeam = currentTeam.map(member => {
        const { _tempId, ...memberData } = member; // Strip out temporary ID
        if (memberData.useSharedSchedule) {
            memberData.startDate = sharedStartDate;
            memberData.endDate = sharedEndDate;
        }
        return memberData as TeamMember;
    });

    const seenUserIds = new Set();
    const uniqueFinalTeam = finalTeam.filter(member => {
        if(seenUserIds.has(member.userId)) return false;
        seenUserIds.add(member.userId);
        return true;
    });

    onSave(project.id, roleKey, uniqueFinalTeam);
  };

  const ringClass = "focus:ring-2 focus:ring-[#6C63FF]";
  const inputClass = `bg-gray-100 dark:bg-[#2d2d2d] border border-gray-300 dark:border-[#4a4a4a] rounded-md px-3 py-1.5 w-full text-sm text-gray-900 dark:text-gray-200 focus:outline-none ${ringClass}`;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#363636] rounded-xl w-full max-w-3xl text-gray-900 dark:text-white shadow-lg flex flex-col max-h-[90vh]">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-[#363636]">
          <h2 id="modal-title" className="text-xl font-bold">编辑{roleName}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700" aria-label="关闭">
            <IconX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
            {/* Shared Schedule Section */}
            <div className="bg-gray-100 dark:bg-[#2d2d2d] p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                    <IconCalendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">共享排期设置</h3>
                </div>
                <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">共享排期时间范围</label>
                    <DateRangePicker
                        startDate={sharedStartDate}
                        endDate={sharedEndDate}
                        onSelectRange={(start, end) => {
                            setSharedStartDate(start);
                            setSharedEndDate(end);
                        }}
                    />
                </div>
            </div>

            {/* Team Members Section */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">团队成员</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500">可自由增减人数</p>
                </div>
                <div className="space-y-3">
                    {currentTeam.map((member, index) => {
                        const user = allUsers.find(u => u.id === member.userId);
                        if (!user) return null;

                        return (
                            <div key={member._tempId} className="bg-gray-100 dark:bg-[#2d2d2d] p-4 rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">成员 {index + 1}</h4>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input type="checkbox" checked={member.useSharedSchedule} onChange={() => handleToggleSharedSchedule(member._tempId)} className={`h-4 w-4 rounded bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-[#6C63FF] ${ringClass}`} />
                                            使用共享排期
                                        </label>
                                        <button onClick={() => handleRemoveMember(member._tempId)} className="p-1 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-full" aria-label={`移除 ${user.name}`}>
                                            <IconTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">姓名</label>
                                        <select
                                            value={member.userId}
                                            onChange={(e) => handleUpdateMember(member._tempId, e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value={user.id}>{user.name}</option>
                                            {availableUsers.map(availableUser => (
                                                <option key={availableUser.id} value={availableUser.id}>{availableUser.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        {member.useSharedSchedule ? (
                                            <div className="h-full flex items-center bg-[#6C63FF]/10 border border-[#6C63FF]/20 text-[#6C63FF] dark:text-[#A29DFF] rounded-md px-3 py-1.5">
                                                <IconLink className="w-5 h-5 mr-2 flex-shrink-0" />
                                                <span className="text-sm font-semibold truncate">
                                                    {sharedStartDate && sharedEndDate ? `${sharedStartDate} ~ ${sharedEndDate}` : "请设置共享排期"}
                                                </span>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">个人排期时间范围</label>
                                                <DateRangePicker
                                                    startDate={member.startDate}
                                                    endDate={member.endDate}
                                                    onSelectRange={(start, end) => handleIndividualDateChange(member._tempId, start, end)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Add Member Button */}
            <div className="relative" ref={addMemberRef}>
                <button
                    onClick={() => setIsAddingMember(p => !p)}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg py-3 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                    <IconPlus className="w-5 h-5" />
                    <span className="font-semibold">添加成员</span>
                </button>
                {isAddingMember && availableUsers.length > 0 && (
                    <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#4a4a4a] rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                       <ul className="p-1">
                          {availableUsers.map(user => (
                            <li key={user.id}>
                                <button onClick={() => handleAddMember(user.id)} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-[#3a3a3a]">
                                    <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full" />
                                    {user.name}
                                </button>
                            </li>
                          ))}
                       </ul>
                    </div>
                )}
                 {isAddingMember && availableUsers.length === 0 && (
                     <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#4a4a4a] rounded-lg shadow-xl z-10 p-4 text-center text-sm text-gray-500">
                         所有用户都已添加
                     </div>
                 )}
            </div>
        </div>

        <div className="flex-shrink-0 flex justify-end gap-4 p-4 border-t border-gray-200 dark:border-[#363636]">
          <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-[#3a3a3a] border border-gray-300 dark:border-[#4a4a4a] rounded-lg font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">取消</button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#6C63FF] text-white rounded-lg font-semibold text-sm hover:bg-[#5a52d9] transition-colors">保存更改</button>
        </div>
      </div>
    </div>
  );
};