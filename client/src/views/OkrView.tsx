import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { OkrSet, Okr, KeyResult } from '../types';
import * as api from '../api';
import toast from 'react-hot-toast';
import { Plus, Save, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import NewOkrPeriodModal from '../components/modals/NewOkrPeriodModal';

const OkrView: React.FC = () => {
  const { okrSets, loading, refetchData } = useData();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [editableOkrSet, setEditableOkrSet] = useState<OkrSet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (okrSets.length > 0 && !selectedPeriodId) {
      setSelectedPeriodId(okrSets[0].periodId);
    }
  }, [okrSets, selectedPeriodId]);

  useEffect(() => {
    const currentSet = okrSets.find(set => set.periodId === selectedPeriodId);
    setEditableOkrSet(currentSet ? JSON.parse(JSON.stringify(currentSet)) : null);
  }, [selectedPeriodId, okrSets]);

  const updateOkrSetState = (newOkrSet: OkrSet | null) => {
    setEditableOkrSet(JSON.parse(JSON.stringify(newOkrSet)));
  };

  const handleOkrChange = (okrIndex: number, field: keyof Okr, value: any) => {
    if (!editableOkrSet) return;
    const newOkrs = [...editableOkrSet.okrs];
    (newOkrs[okrIndex] as any)[field] = value;
    updateOkrSetState({ ...editableOkrSet, okrs: newOkrs });
  };

  const handleKrChange = (okrIndex: number, krIndex: number, field: keyof KeyResult, value: any) => {
    if (!editableOkrSet) return;
    const newOkrs = [...editableOkrSet.okrs];
    (newOkrs[okrIndex].keyResults[krIndex] as any)[field] = value;
    updateOkrSetState({ ...editableOkrSet, okrs: newOkrs });
  };

  const handleAddKr = (okrIndex: number) => {
    if (!editableOkrSet) return;
    const newKr: KeyResult = { id: `kr-${uuidv4()}`, description: '' };
    const newOkrs = [...editableOkrSet.okrs];
    newOkrs[okrIndex].keyResults.push(newKr);
    updateOkrSetState({ ...editableOkrSet, okrs: newOkrs });
  };

  const handleRemoveKr = (okrIndex: number, krIndex: number) => {
    if (!editableOkrSet) return;
    const newOkrs = [...editableOkrSet.okrs];
    newOkrs[okrIndex].keyResults.splice(krIndex, 1);
    updateOkrSetState({ ...editableOkrSet, okrs: newOkrs });
  };

  const handleAddOkr = () => {
    if (!editableOkrSet) return;
    const newOkr: Okr = { id: `okr-${uuidv4()}`, objective: '', keyResults: [] };
    updateOkrSetState({ ...editableOkrSet, okrs: [...editableOkrSet.okrs, newOkr] });
  };

  const handleRemoveOkr = (okrIndex: number) => {
    if (!editableOkrSet) return;
    const newOkrs = [...editableOkrSet.okrs];
    newOkrs.splice(okrIndex, 1);
    updateOkrSetState({ ...editableOkrSet, okrs: newOkrs });
  };

  const handleSaveChanges = async () => {
    if (!editableOkrSet) return;
    const toastId = toast.loading('正在保存...');
    try {
      await api.updateOkrSet(editableOkrSet.periodId, editableOkrSet);
      toast.success('OKR 已保存！', { id: toastId });
      refetchData();
    } catch (error) {
      toast.error('保存失败，请重试。', { id: toastId });
    }
  };

  if (loading) {
    return <div>加载 OKR 数据中...</div>;
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">OKR 管理</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriodId}
            onChange={e => setSelectedPeriodId(e.target.value)}
            className="p-2 border rounded-md"
          >
            {okrSets.map(set => (
              <option key={set.periodId} value={set.periodId}>{set.periodName}</option>
            ))}
          </select>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            创建新周期
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow-sm">
        {editableOkrSet ? (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={handleSaveChanges} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                <Save className="w-4 h-4" /> 保存更改
              </button>
            </div>
            <div className="space-y-6">
              {editableOkrSet.okrs.map((okr, okrIndex) => (
                <div key={okr.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-blue-600">O:</span>
                    <input
                      type="text"
                      value={okr.objective}
                      onChange={(e) => handleOkrChange(okrIndex, 'objective', e.target.value)}
                      placeholder="输入目标 (Objective)"
                      className="flex-grow p-2 border-b-2 focus:border-blue-500 outline-none bg-transparent"
                    />
                    <button onClick={() => handleRemoveOkr(okrIndex)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="pl-8 mt-2 space-y-2">
                    {okr.keyResults.map((kr, krIndex) => (
                      <div key={kr.id} className="flex items-center gap-2">
                        <span className="font-semibold text-gray-600">KR{krIndex + 1}:</span>
                        <input
                          type="text"
                          value={kr.description}
                          onChange={(e) => handleKrChange(okrIndex, krIndex, 'description', e.target.value)}
                          placeholder="输入关键成果 (Key Result)"
                          className="flex-grow p-1 border-b focus:border-gray-500 outline-none bg-transparent"
                        />
                        <button onClick={() => handleRemoveKr(okrIndex, krIndex)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => handleAddKr(okrIndex)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-2">
                      <Plus className="w-4 h-4" /> 添加 KR
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={handleAddOkr} className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg text-gray-500 hover:bg-gray-100 hover:border-solid">
                <Plus className="w-5 h-5" /> 添加 O
              </button>
            </div>
          </div>
        ) : (
          <p>请选择一个 OKR 周期。</p>
        )}
      </div>
      <NewOkrPeriodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refetchData();
        }}
      />
    </div>
  );
};

export default OkrView;