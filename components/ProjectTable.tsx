import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { Project, User, ProjectStatus, ProjectRoleKey, OKR, Priority, Role } from '../types';
import { IconTrash, IconCheck, IconX, IconMoreHorizontal, IconStar, IconMessageCircle, IconHistory } from './Icons';
import { RoleCell } from './RoleCell';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { DatePicker } from './DatePicker';
import { RichTextInput } from './RichTextInput';
import { RichTextEditableCell } from './RichTextEditableCell';
import { TooltipPortal } from './TooltipPortal';
import { TeamScheduleTooltip } from './TeamScheduleTooltip';

interface ProjectTableProps {
  projects: Project[];
  allUsers: User[];
  allOkrs: OKR[];
  currentUser: User;
  editingId: string | null;
  onSaveNewProject: (project: Project) => void;
  onUpdateProject: (projectId: string, field: keyof Project, value: any) => void;
  onDeleteProject: (id: string) => void;
  onCancelNewProject: (id: string) => void;
  onOpenModal: (type: 'role' | 'comments' | 'changelog', projectId: string, details?: any) => void;
  onToggleFollow: (projectId: string) => void;
}

const tableHeaders = [
    { key: 'name', label: '项目名称', width: '200px' },
    { key: 'priority', label: '优先级', width: '100px' },
    { key: 'status', label: '状态', width: '140px' },
    { key: 'businessProblem', label: '解决的业务问题', width: '300px' },
    { key: 'keyResults', label: '关联的KR', width: '300px' },
    { key: 'weeklyUpdate', label: '本周进展/问题', width: '300px' },
    { key: 'lastWeekUpdate', label: '上周进展/问题', width: '300px' },
    { key: 'productManagers', label: '产品经理', width: '150px' },
    { key: 'backendDevelopers', label: '后端研发', width: '150px' },
    { key: 'frontendDevelopers', label: '前端研发', width: '150px' },
    { key: 'qaTesters', label: '测试', width: '150px' },
    { key: 'proposalDate', label: '提出时间', width: '150px' },
    { key: 'launchDate', label: '上线时间', width: '150px' },
    { key: 'actions', label: '操作', width: '100px' }
];

const commonTdClass = "px-4 py-2 text-sm text-gray-700 dark:text-gray-300 align-top";
const editInputClass = "bg-gray-100 dark:bg-[#2d2d2d] border border-gray-300 dark:border-[#4a4a4a] rounded-md px-2 py-1.5 w-full text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]";
const editTextAreaClass = `${editInputClass} min-h-[80px] whitespace-pre-wrap resize-y`;

const leftStickyColumnCount = 4;
const rightStickyColumnCount = 1;


const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
    const priorityStyles: Record<Priority, string> = {
        [Priority.P0]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-600/70 dark:text-red-200 dark:border-red-500/80',
        [Priority.P1]: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-600/70 dark:text-orange-200 dark:border-orange-500/80',
        [Priority.P2]: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-600/70 dark:text-yellow-200 dark:border-yellow-500/80',
        [Priority.P3]: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-600/70 dark:text-gray-200 dark:border-gray-500/80',
    }
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${priorityStyles[priority]}`}>
        {priority}
      </span>
    );
};

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const statusStyles: Record<ProjectStatus, string> = {
    [ProjectStatus.NotStarted]: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-600/50 dark:text-gray-300 dark:border-gray-500/60',
    [ProjectStatus.Discussion]: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-600/50 dark:text-purple-300 dark:border-purple-500/60',
    [ProjectStatus.RequirementsDone]: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-600/50 dark:text-blue-300 dark:border-blue-500/60',
    [ProjectStatus.ReviewDone]: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-600/50 dark:text-cyan-300 dark:border-cyan-500/60',
    [ProjectStatus.InProgress]: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-600/50 dark:text-orange-300 dark:border-orange-500/60',
    [ProjectStatus.DevDone]: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-600/50 dark:text-yellow-300 dark:border-yellow-500/60',
    [ProjectStatus.Testing]: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-600/50 dark:text-pink-300 dark:border-pink-500/60',
    [ProjectStatus.TestDone]: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-600/50 dark:text-teal-300 dark:border-teal-500/60',
    [ProjectStatus.Launched]: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-600/50 dark:text-green-300 dark:border-green-500/60',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

const EditableCell = ({ value, onSave, type = 'text', className = '', options, displayValue, selectType } : { value: string, onSave: (value: any) => void, type?: 'text' | 'textarea' | 'select', className?: string, options?: {value: string, label: string}[], displayValue?: string, selectType?: 'status' | 'priority' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (inputRef.current instanceof HTMLInputElement || inputRef.current instanceof HTMLTextAreaElement) {
                inputRef.current.select();
            }
        }
    }, [isEditing]);
    
    const handleSave = () => {
        if(currentValue !== value) {
            onSave(currentValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && type !== 'textarea') {
            handleSave();
        } else if (e.key === 'Escape') {
            setCurrentValue(value);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        if (type === 'select') {
            let selectOptions;
            if (selectType === 'status') selectOptions = Object.values(ProjectStatus).map(s => ({value: s, label: s}));
            else if (selectType === 'priority') selectOptions = Object.values(Priority).map(p => ({value: p, label: p}));
            else selectOptions = options || [];

            return (
                <select ref={inputRef as React.Ref<HTMLSelectElement>} value={currentValue || ''} onChange={(e) => setCurrentValue(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} className={`${editInputClass} ${className}`}>
                    <option value="" disabled>选择...</option>
                    {selectOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            );
        }
        if (type === 'textarea') {
            return <textarea ref={inputRef as React.Ref<HTMLTextAreaElement>} value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} className={`${editTextAreaClass} ${className}`} />;
        }
        return <input ref={inputRef as React.Ref<HTMLInputElement>} type={type} value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} className={`${editInputClass} ${className}`} />;
    }
    
    const renderValue = () => {
        if (displayValue) return displayValue;
        if (type === 'select') {
            if (selectType === 'status') return <StatusBadge status={value as ProjectStatus} />;
            if (selectType === 'priority') return <PriorityBadge priority={value as Priority} />;
            const selectedOption = options?.find(o => o.value === value);
            return selectedOption ? selectedOption.label : <span className="text-gray-400 dark:text-gray-500">N/A</span>;
        }
        return value || <span className="text-gray-400 dark:text-gray-500">N/A</span>;
    }

    return (
        <div onClick={() => setIsEditing(true)} className={`w-full h-full cursor-pointer p-1.5 -m-1.5 rounded-md hover:bg-gray-200/50 dark:hover:bg-[#3a3a3a] transition-colors duration-200 flex items-center ${className}`}>
             <div className="whitespace-pre-wrap">{renderValue()}</div>
        </div>
    );
};


const OkrMultiSelectCell: React.FC<{
  selectedKrIds: string[];
  allOkrs: OKR[];
  onSave: (newKrIds: string[]) => void;
}> = ({ selectedKrIds, allOkrs, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSelection, setCurrentSelection] = useState(selectedKrIds);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentSelection(selectedKrIds);
  }, [selectedKrIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if(isOpen) {
            handleCloseAndSave();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, currentSelection, onSave, selectedKrIds]);

  const handleToggleOption = (krId: string) => {
    const newSelection = currentSelection.includes(krId)
      ? currentSelection.filter(id => id !== krId)
      : [...currentSelection, krId];
    setCurrentSelection(newSelection);
  };

  const handleCloseAndSave = () => {
    setIsOpen(false);
    if(JSON.stringify(currentSelection.sort()) !== JSON.stringify(selectedKrIds.sort())) {
        onSave(currentSelection);
    }
  };
  
  const allKrsMap = useMemo(() => {
    const map = new Map<string, { description: string; oNumber: number; krNumber: number; objective: string }>();
    allOkrs.forEach((okr, okrIndex) => {
      okr.keyResults.forEach((kr, krIndex) => {
        map.set(kr.id, {
          description: kr.description,
          oNumber: okrIndex + 1,
          krNumber: krIndex + 1,
          objective: okr.objective,
        });
      });
    });
    return map;
  }, [allOkrs]);

  const renderSelectedKr = (krId: string) => {
    const krDetails = allKrsMap.get(krId);
    if (!krDetails) return null;
    return (
      <span key={krId} className="bg-gray-200 dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500/60 text-xs font-medium mr-2 mb-1 px-2 py-1 rounded-full inline-flex items-center">
        O{krDetails.oNumber}-KR{krDetails.krNumber}: {krDetails.description}
      </span>
    );
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full cursor-pointer p-1.5 -m-1.5 rounded-md hover:bg-gray-200/50 dark:hover:bg-[#3a3a3a] transition-colors duration-200 flex flex-wrap items-center min-h-[36px]"
      >
        {selectedKrIds.length > 0 ? (
          selectedKrIds.map(renderSelectedKr)
        ) : (
          <span className="text-gray-400 dark:text-gray-500">关联 KR</span>
        )}
      </div>
      {isOpen && (
        <div className="absolute top-full mt-2 w-[400px] max-h-80 overflow-y-auto bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#4a4a4a] rounded-lg shadow-xl z-30 p-2">
          {allOkrs.map((okr, okrIndex) => (
            <div key={okr.id} className="mb-2">
              <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 px-3 py-2">
                O{okrIndex + 1}: {okr.objective}
              </h4>
              <ul>
                {okr.keyResults.map((kr, krIndex) => (
                  <li key={kr.id}>
                    <label className="flex items-start gap-3 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-[#3a3a3a] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentSelection.includes(kr.id)}
                        onChange={() => handleToggleOption(kr.id)}
                        className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-[#6C63FF] focus:ring-[#6C63FF] mt-1 flex-shrink-0"
                      />
                      <span className="flex-grow">
                        <span className="font-semibold">KR{krIndex + 1}: </span>
                        {kr.description}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="sticky bottom-0 bg-white dark:bg-[#2d2d2d] p-2 border-t border-gray-200 dark:border-[#4a4a4a] -m-2 mt-2">
             <button onClick={handleCloseAndSave} className="w-full px-4 py-2 bg-[#6C63FF] text-white rounded-lg font-semibold text-sm hover:bg-[#5a52d9] transition-colors">
                确认
             </button>
          </div>
        </div>
      )}
    </div>
  );
};


const ActionsCell: React.FC<{
  project: Project;
  currentUser: User;
  onDelete: () => void;
  onToggleFollow: () => void;
  onOpenModal: (type: 'comments' | 'changelog') => void;
}> = ({ project, currentUser, onDelete, onToggleFollow, onOpenModal }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Style for the menu. We now control position and opacity.
    // Start positioned off-screen to guarantee correct measurement before positioning.
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        zIndex: 50,
        opacity: 0,
    });
    const isFollowing = project.followers.includes(currentUser.id);

    // This effect to handle outside clicks remains the same.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
                menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // useLayoutEffect is critical for positioning logic that depends on DOM measurements.
    useLayoutEffect(() => {
        if (!isOpen) {
            // Reset opacity for the next fade-in when the menu is re-opened.
            // The portal will unmount it anyway.
            setMenuStyle(s => ({ ...s, opacity: 0 }));
            return;
        }

        const buttonElement = buttonRef.current;
        const menuElement = menuRef.current;

        if (!buttonElement || !menuElement) return;

        const calculateAndSetPosition = () => {
            const rect = buttonElement.getBoundingClientRect();
            
            // Because the menu is rendered off-screen first, its dimensions are correct
            // when this measurement happens, avoiding issues with font loading or other async rendering.
            const menuWidth = menuElement.offsetWidth;
            const menuHeight = menuElement.offsetHeight;
            const gap = 8;

            let top = rect.bottom + gap;
            let left = rect.right - menuWidth;

            // Flip to top if not enough space below
            if (top + menuHeight > window.innerHeight && rect.top > menuHeight + gap) {
                top = rect.top - menuHeight - gap;
            }

            // Adjust horizontal position to stay in viewport
            if (left < 0) {
                left = gap;
            }
            if (left + menuWidth > window.innerWidth) {
                left = window.innerWidth - menuWidth - gap;
            }

            // Apply the calculated position and fade the menu in.
            setMenuStyle({
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                zIndex: 50,
                opacity: 1,
                transition: 'opacity 150ms ease-in-out',
            });
        };
        
        // Run the calculation. It's safe to run immediately inside useLayoutEffect.
        calculateAndSetPosition();

        window.addEventListener('scroll', calculateAndSetPosition, true);
        window.addEventListener('resize', calculateAndSetPosition);

        return () => {
            window.removeEventListener('scroll', calculateAndSetPosition, true);
            window.removeEventListener('resize', calculateAndSetPosition);
        };
    }, [isOpen]);

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    const handleDeleteWithConfirmation = () => {
        if (window.confirm(`您确定要删除项目 "${project.name}" 吗？此操作无法撤销。`)) {
            onDelete();
        }
        setIsOpen(false);
    };

    const menuContent = (
        <div
            ref={menuRef}
            style={menuStyle}
            className="w-40 bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#4a4a4a] rounded-lg shadow-xl py-1"
        >
            <ul>
                <li><button onClick={() => handleAction(onToggleFollow)} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3a3a]"><IconStar className={`w-4 h-4 ${isFollowing ? 'text-yellow-400 fill-yellow-400' : ''}`} /><span>{isFollowing ? '取消关注' : '关注'}</span></button></li>
                <li><button onClick={() => handleAction(() => onOpenModal('comments'))} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3a3a]"><IconMessageCircle className="w-4 h-4" /><span>评论</span></button></li>
                <li><button onClick={() => handleAction(() => onOpenModal('changelog'))} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3a3a]"><IconHistory className="w-4 h-4" /><span>变更记录</span></button></li>
                <li><hr className="border-t border-gray-200 dark:border-[#4a4a4a] my-1" /></li>
                <li><button onClick={handleDeleteWithConfirmation} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><IconTrash className="w-4 h-4" /><span>删除</span></button></li>
            </ul>
        </div>
    );

    return (
        <div className="flex items-center justify-center">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(prev => !prev)}
                className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] hover:text-gray-900 dark:hover:text-white"
            >
                <IconMoreHorizontal className="w-5 h-5" />
            </button>
            {isOpen && ReactDOM.createPortal(menuContent, document.body)}
        </div>
    );
};

interface ProjectRowProps {
    project: Project;
    allUsers: User[];
    allOkrs: OKR[];
    currentUser: User;
    onSave: (project: Project) => void;
    onUpdateProject: (projectId: string, field: keyof Project, value: any) => void;
    onDelete: (id: string) => void;
    onCancel: (id: string) => void;
    onOpenModal: (type: 'role' | 'comments' | 'changelog', projectId: string, details?: any) => void;
    onToggleFollow: (projectId: string) => void;
    columnStyles: React.CSSProperties[];
    getTdClassName: (index: number, isNew?: boolean) => string;
    onCellMouseEnter: (e: React.MouseEvent, project: Project) => void;
    onCellMouseLeave: () => void;
}

const ProjectRow: React.FC<ProjectRowProps> = ({ project, allUsers, allOkrs, currentUser, onSave, onUpdateProject, onDelete, onCancel, onOpenModal, onToggleFollow, columnStyles, getTdClassName, onCellMouseEnter, onCellMouseLeave }) => {

  const handleUpdateField = (field: keyof Project, value: any) => {
    onUpdateProject(project.id, field, value);
  };

  const roleInfo: { key: ProjectRoleKey, name: string }[] = [
      { key: 'productManagers', name: '产品经理' },
      { key: 'backendDevelopers', name: '后端研发' },
      { key: 'frontendDevelopers', name: '前端研发' },
      { key: 'qaTesters', name: '测试' },
  ];

  const handleOpenRoleModal = (roleKey: ProjectRoleKey, roleName: string) => {
      onOpenModal('role', project.id, { roleKey, roleName });
  };

  if (project.isNew) {
    return (
      <tr className="bg-indigo-50 dark:bg-[#2a2a2a]/50 border-b border-gray-200 dark:border-[#363636] relative">
        <td style={columnStyles[0]} className={getTdClassName(0, true)}><input type="text" value={project.name} onChange={(e) => handleUpdateField('name', e.target.value)} className={editInputClass} placeholder="新项目名称" /></td>
        <td style={columnStyles[1]} className={getTdClassName(1, true)}><select value={project.priority} onChange={(e) => handleUpdateField('priority', e.target.value)} className={editInputClass}>{Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}</select></td>
        <td style={columnStyles[2]} className={getTdClassName(2, true)}><select value={project.status} onChange={(e) => handleUpdateField('status', e.target.value)} className={editInputClass}>{Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></td>
        <td style={columnStyles[3]} className={getTdClassName(3, true)}><textarea value={project.businessProblem} onChange={(e) => handleUpdateField('businessProblem', e.target.value)} className={editTextAreaClass} placeholder="解决的核心业务问题" /></td>
        <td style={columnStyles[4]} className={getTdClassName(4, true)}><OkrMultiSelectCell selectedKrIds={project.keyResultIds} allOkrs={allOkrs} onSave={(newKrIds) => handleUpdateField('keyResultIds', newKrIds)} /></td>
        <td style={columnStyles[5]} className={getTdClassName(5, true)}><RichTextInput html={project.weeklyUpdate} onChange={(val) => handleUpdateField('weeklyUpdate', val)} placeholder="本周进展/问题" /></td>
        <td style={columnStyles[6]} className={getTdClassName(6, true)}><div className="p-1.5 text-gray-400 dark:text-gray-500">上周无记录</div></td>
        
        {roleInfo.map(({ key, name }, index) => (
          <td key={key} style={columnStyles[7 + index]} className={getTdClassName(7 + index, true)}>
             <RoleCell team={project[key] as Role} allUsers={allUsers} onClick={() => handleOpenRoleModal(key, name)} />
          </td>
        ))}

        <td style={columnStyles[11]} className={getTdClassName(11, true)}><DatePicker selectedDate={project.proposalDate} onSelectDate={(val) => handleUpdateField('proposalDate', val)} /></td>
        <td style={columnStyles[12]} className={getTdClassName(12, true)}><DatePicker selectedDate={project.launchDate} onSelectDate={(val) => handleUpdateField('launchDate', val)} /></td>
        <td style={columnStyles[13]} className={getTdClassName(13, true)}>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => onSave(project)} className="p-1 text-green-500 hover:text-green-400"><IconCheck className="w-5 h-5"/></button>
            <button onClick={() => onCancel(project.id)} className="p-1 text-red-500 hover:text-red-400"><IconX className="w-5 h-5"/></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-gray-200 dark:border-[#363636] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] group transition-colors duration-200 relative">
        <td style={columnStyles[0]} className={getTdClassName(0)} onMouseEnter={(e) => onCellMouseEnter(e, project)} onMouseLeave={onCellMouseLeave}><EditableCell value={project.name} onSave={(val) => handleUpdateField('name', val)} /></td>
        <td style={columnStyles[1]} className={getTdClassName(1)} onMouseEnter={(e) => onCellMouseEnter(e, project)} onMouseLeave={onCellMouseLeave}><EditableCell value={project.priority} onSave={(val) => handleUpdateField('priority', val)} type="select" selectType="priority" /></td>
        <td style={columnStyles[2]} className={getTdClassName(2)} onMouseEnter={(e) => onCellMouseEnter(e, project)} onMouseLeave={onCellMouseLeave}><EditableCell value={project.status} onSave={(val) => handleUpdateField('status', val)} type="select" selectType="status" /></td>
        <td style={columnStyles[3]} className={getTdClassName(3)} onMouseEnter={(e) => onCellMouseEnter(e, project)} onMouseLeave={onCellMouseLeave}><EditableCell value={project.businessProblem} onSave={(val) => handleUpdateField('businessProblem', val)} type="textarea" /></td>
        <td style={columnStyles[4]} className={getTdClassName(4)}><OkrMultiSelectCell selectedKrIds={project.keyResultIds} allOkrs={allOkrs} onSave={(newKrIds) => handleUpdateField('keyResultIds', newKrIds)} /></td>
        <td style={columnStyles[5]} className={getTdClassName(5)}><RichTextEditableCell html={project.weeklyUpdate} onSave={(val) => handleUpdateField('weeklyUpdate', val)} /></td>
        <td style={columnStyles[6]} className={getTdClassName(6)}>
            <div 
                dangerouslySetInnerHTML={{ __html: project.lastWeekUpdate || `<span class="text-gray-400 dark:text-gray-500">N/A</span>`}} 
                className="w-full h-full p-1.5 -m-1.5 whitespace-pre-wrap text-gray-500 dark:text-gray-400"
            />
        </td>

        {roleInfo.map(({ key, name }, index) => (
            <td key={key} style={columnStyles[7 + index]} className={getTdClassName(7 + index)}>
                <RoleCell team={project[key] as Role} allUsers={allUsers} onClick={() => handleOpenRoleModal(key, name)} />
            </td>
        ))}

        <td style={columnStyles[11]} className={getTdClassName(11)}><DatePicker selectedDate={project.proposalDate} onSelectDate={(val) => handleUpdateField('proposalDate', val)} /></td>
        <td style={columnStyles[12]} className={getTdClassName(12)}><DatePicker selectedDate={project.launchDate} onSelectDate={(val) => handleUpdateField('launchDate', val)} /></td>
        <td style={columnStyles[13]} className={getTdClassName(13)}>
          <div>
            <ActionsCell 
              project={project}
              currentUser={currentUser}
              onDelete={() => onDelete(project.id)}
              onToggleFollow={() => onToggleFollow(project.id)}
              onOpenModal={(type) => onOpenModal(type, project.id)}
            />
          </div>
        </td>
    </tr>
  );
};

export const ProjectTable: React.FC<ProjectTableProps> = ({ projects, allUsers, allOkrs, currentUser, editingId, onSaveNewProject, onUpdateProject, onDeleteProject, onCancelNewProject, onOpenModal, onToggleFollow }) => {
  const columnStyles = useMemo(() => {
    const leftOffsets: number[] = [0];
    for (let i = 0; i < leftStickyColumnCount - 1; i++) {
        leftOffsets.push(leftOffsets[i] + parseInt(tableHeaders[i].width, 10));
    }

    return tableHeaders.map((header, index) => {
        const style: React.CSSProperties = { width: header.width, minWidth: header.width };
        if (index < leftStickyColumnCount) {
            style.position = 'sticky';
            style.left = leftOffsets[index];
            style.zIndex = 1;
        }
        if (index >= tableHeaders.length - rightStickyColumnCount) {
            style.position = 'sticky';
            style.right = 0;
            style.zIndex = 1;
        }
        return style;
    });
  }, []);

  const [tooltipData, setTooltipData] = useState<{
    project: Project | null;
    targetRect: DOMRect | null;
  }>({ project: null, targetRect: null });
  const hoverTimeoutRef = useRef<number | null>(null);

  const handleCellMouseEnter = (e: React.MouseEvent, project: Project) => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      const target = e.currentTarget as HTMLElement;
      hoverTimeoutRef.current = window.setTimeout(() => {
          setTooltipData({
              project: project,
              targetRect: target.getBoundingClientRect(),
          });
      }, 300);
  };

  const handleCellMouseLeave = () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setTooltipData({ project: null, targetRect: null });
  };

  const getTdClassName = (index: number, isNew = false) => {
      let classes = `${commonTdClass}`;
      if (index < leftStickyColumnCount) {
          classes += isNew ? ' bg-indigo-50 dark:bg-[#2a2a2a]' : ' bg-white dark:bg-[#232323] group-hover:bg-gray-50 dark:group-hover:bg-[#2a2a2a]';
      }
      if (index >= tableHeaders.length - rightStickyColumnCount) {
          classes += (isNew ? ' bg-indigo-50 dark:bg-[#2a2a2a]' : ' bg-white dark:bg-[#232323] group-hover:bg-gray-50 dark:group-hover:bg-[#2a2a2a]') + ' text-center';
      }
      if (index === leftStickyColumnCount - 1) {
          classes += ' border-r-2 border-gray-300 dark:border-[#4a4a4a]';
      }
      if (index === tableHeaders.length - rightStickyColumnCount) {
          classes += ' border-l-2 border-gray-300 dark:border-[#4a4a4a]';
      }
      return classes;
  };
  
  const getThClassName = (index: number) => {
    let classes = "text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase p-4 border-b border-t border-gray-200 dark:border-[#363636] align-middle";
    if (index < leftStickyColumnCount || index >= tableHeaders.length - rightStickyColumnCount) {
        classes += ' bg-gray-100 dark:bg-[#2a2a2a]';
    }
    if (index === leftStickyColumnCount - 1) {
        classes += ' border-r-2 border-gray-300 dark:border-[#4a4a4a]';
    }
    if (index === tableHeaders.length - rightStickyColumnCount) {
        classes += ' border-l-2 border-gray-300 dark:border-[#4a4a4a]';
    }
    return classes;
  };
  
  const getThStyle = (index: number): React.CSSProperties => {
      const style = { ...columnStyles[index] };
      if (style.position === 'sticky') {
          style.zIndex = 2; // Header on top
      }
      return style;
  };

  return (
    <div className="bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#363636] rounded-xl overflow-x-auto">
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <thead className="sticky top-0 z-10">
          <tr>
            {tableHeaders.map((header, index) => (
              <th key={header.key} style={getThStyle(index)} className={getThClassName(index)}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-[#363636]">
          {projects.map(project => (
            <ProjectRow
              key={project.id}
              project={project}
              allUsers={allUsers}
              allOkrs={allOkrs}
              currentUser={currentUser}
              onSave={onSaveNewProject}
              onUpdateProject={onUpdateProject}
              onDelete={onDeleteProject}
              onCancel={onCancelNewProject}
              onOpenModal={onOpenModal}
              onToggleFollow={onToggleFollow}
              columnStyles={columnStyles}
              getTdClassName={getTdClassName}
              onCellMouseEnter={handleCellMouseEnter}
              onCellMouseLeave={handleCellMouseLeave}
            />
          ))}
        </tbody>
      </table>
      {tooltipData.project && tooltipData.targetRect && (
          <TooltipPortal targetRect={tooltipData.targetRect}>
              <TeamScheduleTooltip project={tooltipData.project} allUsers={allUsers} />
          </TooltipPortal>
      )}
    </div>
  );
};