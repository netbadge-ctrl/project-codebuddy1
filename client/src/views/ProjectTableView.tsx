import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api';
import toast from 'react-hot-toast';
import { Project, ProjectStatuses, ProjectPriorities } from '../types';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { getStatusColor, getPriorityColor } from '../utils/style';
import { fuzzySearch } from '../utils/fuzzySearch';
import EditableCell from '../components/table/EditableCell';
import SelectCell from '../components/table/SelectCell';
import OkrMultiSelectCell from '../components/table/OkrMultiSelectCell';
import RichTextEditableCell from '../components/table/RichTextEditableCell';
import RoleCell from '../components/table/RoleCell';
import RoleEditModal from '../components/modals/RoleEditModal';
import ActionsCell from '../components/table/ActionsCell';
import ChangeLogModal from '../components/modals/ChangeLogModal';
import CommentModal from '../components/modals/CommentModal';
import FilterBar, { Filters } from '../components/FilterBar';

const ProjectTableView: React.FC = () => {
  const { projects: initialProjects, users, loading, updateProjectInState, refetchData } = useData();
  const { user: currentUser } = useAuth();
  const [filters, setFilters] = useState<Filters>({
    query: '',
    statuses: [],
    priorities: [],
    userIds: [],
    krIds: [],
  });
  const [roleEditModalState, setRoleEditModalState] = useState<{
    isOpen: boolean;
    project: Project | null;
    roleKey: keyof Project | null;
    roleName: string;
  }>({ isOpen: false, project: null, roleKey: null, roleName: '' });
  const [changeLogModalProject, setChangeLogModalProject] = useState<Project | null>(null);
  const [commentModalProject, setCommentModalProject] = useState<Project | null>(null);

  const openRoleEditor = (project: Project, roleKey: keyof Project, roleName: string) => {
    setRoleEditModalState({ isOpen: true, project, roleKey, roleName });
  };

  const filteredData = useMemo(() => {
    return initialProjects.filter(p => {
      if (filters.query && !fuzzySearch(p.name, filters.query)) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(p.status)) return false;
      if (filters.priorities.length > 0 && !filters.priorities.includes(p.priority)) return false;
      if (filters.userIds.length > 0) {
        const projectUserIds = [
          ...p.productManagers,
          ...p.backendDevelopers,
          ...p.frontendDevelopers,
          ...p.qaTesters,
        ].map(r => r.userId);
        if (!filters.userIds.some(uid => projectUserIds.includes(uid))) return false;
      }
      if (filters.krIds.length > 0 && !filters.krIds.some(krid => p.keyResultIds.includes(krid))) return false;
      return true;
    });
  }, [initialProjects, filters]);

  const handleToggleFollow = async (project: Project) => {
    if (!currentUser) return;
    const isFollowing = project.followers.includes(currentUser.id);
    const newFollowers = isFollowing
      ? project.followers.filter(id => id !== currentUser.id)
      : [...project.followers, currentUser.id];

    const toastId = toast.loading(isFollowing ? '正在取消关注...' : '正在关注...');
    try {
      const updatedProject = await api.updateProject(project.id, { followers: newFollowers });
      updateProjectInState(updatedProject);
      toast.success(isFollowing ? '已取消关注' : '关注成功！', { id: toastId });
    } catch (error) {
      toast.error('操作失败，请重试。', { id: toastId });
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (window.confirm(`确定要删除项目 "${project.name}" 吗？此操作不可撤销。`)) {
      const toastId = toast.loading('正在删除...');
      try {
        await api.deleteProject(project.id);
        toast.success('项目已删除', { id: toastId });
        refetchData();
      } catch (error) {
        toast.error('删除失败，请重试。', { id: toastId });
      }
    }
  };

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      { accessorKey: 'name', header: '项目名称', cell: EditableCell },
      { accessorKey: 'status', header: '状态', cell: props => <SelectCell {...props} options={ProjectStatuses} /> },
      { accessorKey: 'priority', header: '优先级', cell: props => <SelectCell {...props} options={ProjectPriorities} /> },
      { accessorKey: 'keyResultIds', header: '关联KR', cell: OkrMultiSelectCell },
      { accessorKey: 'productManagers', header: '产品经理', cell: ({ row, getValue }) => <RoleCell getValue={getValue} onClick={() => openRoleEditor(row.original, 'productManagers', '产品经理')} /> },
      { accessorKey: 'backendDevelopers', header: '后端开发', cell: ({ row, getValue }) => <RoleCell getValue={getValue} onClick={() => openRoleEditor(row.original, 'backendDevelopers', '后端开发')} /> },
      { accessorKey: 'frontendDevelopers', header: '前端开发', cell: ({ row, getValue }) => <RoleCell getValue={getValue} onClick={() => openRoleEditor(row.original, 'frontendDevelopers', '前端开发')} /> },
      { accessorKey: 'qaTesters', header: 'QA', cell: ({ row, getValue }) => <RoleCell getValue={getValue} onClick={() => openRoleEditor(row.original, 'qaTesters', 'QA')} /> },
      { accessorKey: 'weeklyUpdate', header: '本周进展/问题', cell: RichTextEditableCell },
      { accessorKey: 'launchDate', header: '上线日期', cell: info => info.getValue<string>() || 'N/A' },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <ActionsCell
            project={row.original}
            onToggleFollow={() => handleToggleFollow(row.original)}
            onComment={() => setCommentModalProject(row.original)}
            onChangeLog={() => setChangeLogModalProject(row.original)}
            onDelete={() => handleDeleteProject(row.original)}
          />
        ),
      },
    ],
    [users, currentUser]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex: number, columnId: string, value: any) => {
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return { ...old[rowIndex]!, [columnId]: value };
            }
            return row;
          })
        );
      },
    },
  });

  if (loading) {
    return <div>加载表格数据中...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">项目总览</h1>
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      
      <div className="overflow-auto flex-grow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <RoleEditModal
        {...roleEditModalState}
        onClose={() => setRoleEditModalState({ isOpen: false, project: null, roleKey: null, roleName: '' })}
      />
      <ChangeLogModal
        isOpen={!!changeLogModalProject}
        onClose={() => setChangeLogModalProject(null)}
        project={changeLogModalProject}
      />
      <CommentModal
        isOpen={!!commentModalProject}
        onClose={() => setCommentModalProject(null)}
        project={commentModalProject}
      />
    </div>
  );
};

export default ProjectTableView;
