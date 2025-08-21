import React from 'react';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';

function WeeklyMeetingView() {
  const { projects, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // 筛选进行中的项目
  const activeProjects = projects.filter(project => 
    ['开发中', '测试中', '待测试'].includes(project.status)
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">周会视图</h1>
        <p className="mt-2 text-gray-600">专为周会设计的项目进展视图</p>
      </div>

      {/* 项目卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeProjects.length > 0 ? (
          activeProjects.map((project) => (
            <div key={project.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{project.businessProblem}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  project.status === '开发中' ? 'bg-blue-100 text-blue-800' :
                  project.status === '测试中' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>

              {/* 本周进展 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">本周进展</h4>
                <div className="bg-gray-50 rounded-md p-3">
                  {project.weeklyUpdate ? (
                    <div 
                      className="text-sm text-gray-700"
                      dangerouslySetInnerHTML={{ __html: project.weeklyUpdate }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 italic">暂无本周进展</p>
                  )}
                </div>
              </div>

              {/* 上周进展 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">上周进展</h4>
                <div className="bg-gray-50 rounded-md p-3">
                  {project.lastWeekUpdate ? (
                    <div 
                      className="text-sm text-gray-700"
                      dangerouslySetInnerHTML={{ __html: project.lastWeekUpdate }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 italic">暂无上周进展</p>
                  )}
                </div>
              </div>

              {/* 团队信息 */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">团队成员</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    ...project.productManagers,
                    ...project.backendDevelopers,
                    ...project.frontendDevelopers,
                    ...project.qaTesters
                  ].map((member, index) => (
                    <span 
                      key={`${member.userId}-${index}`}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {member.userId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <div className="text-gray-500">暂无进行中的项目</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeeklyMeetingView;