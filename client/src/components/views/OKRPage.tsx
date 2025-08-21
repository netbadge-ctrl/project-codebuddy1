import React from 'react';
import { useData } from '../../contexts/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';

function OKRPage() {
  const { okrSets, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">OKR管理</h1>
        <p className="mt-2 text-gray-600">管理目标与关键结果</p>
      </div>

      {/* OKR列表 */}
      <div className="space-y-6">
        {okrSets.map((okrSet) => (
          <div key={okrSet.periodId} className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">{okrSet.periodName}</h2>
              <p className="text-sm text-gray-500">周期ID: {okrSet.periodId}</p>
            </div>
            
            <div className="p-6">
              {okrSet.okrs && okrSet.okrs.length > 0 ? (
                <div className="space-y-4">
                  {okrSet.okrs.map((okr) => (
                    <div key={okr.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">{okr.objective}</h3>
                      <div className="space-y-2">
                        {okr.keyResults.map((kr) => (
                          <div key={kr.id} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">{kr.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  该周期暂无OKR
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {okrSets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">暂无OKR数据</div>
        </div>
      )}
    </div>
  );
}

export default OKRPage;