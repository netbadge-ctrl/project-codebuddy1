import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';

function PersonalView() {
  const { user } = useAuth();
  const { projects, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // 获取用户参与的项目
  const userProjects = projects.filter(project => {
    const allMembers = [
      ...project.productManagers.map(pm => pm.userId),
      ...project.backendDevelopers.map(bd => bd.userId),
      ...project.frontendDevelopers.map(fd => fd.userId),
      ...project.qaTesters.map(qt => qt.userId)
    ];
    return allMembers.includes(user?.id || '');
  });

  // 获取用户关注的项目
  const followedProjects = projects.filter(project => 
    project.followers.includes(user?.id || '')
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">个人视图</h1>
        <p className="mt-2 text-gray-600">欢迎回来，{user?.name}！</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">参与项目</p>
              <p className="text-2xl font-semibold text-gray-900">{userProjects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">进行中项目</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userProjects.filter(p => p.status === '开发中').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">⭐</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">关注项目</p>
              <p className="text-2xl font-semibold text-gray-900">{followedProjects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">🎯</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">本月完成</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userProjects.filter(p => p.status === '已上线').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 参与的项目 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">我参与的项目</h2>
          <div className="space-y-4">
            {userProjects.length > 0 ? (
              userProjects.map(project => (
                <div key={project.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{project.businessProblem}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === '开发中' ? 'bg-blue-100 text-blue-800' :
                          project.status === '已上线' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.priority === '部门OKR相关' ? 'bg-red-100 text-red-800' :
                          project.priority === '个人OKR相关' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无参与的项目
              </div>
            )}
          </div>
        </div>

        {/* 关注的项目 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">我关注的项目</h2>
          <div className="space-y-4">
            {followedProjects.length > 0 ? (
              followedProjects.map(project => (
                <div key={project.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{project.businessProblem}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === '开发中' ? 'bg-blue-100 text-blue-800' :
                          project.status === '已上线' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无关注的项目
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalView;