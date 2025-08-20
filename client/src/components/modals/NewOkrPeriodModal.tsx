import React, { useState } from 'react';
import Modal from '../Modal';
import * as api from '../../api';
import toast from 'react-hot-toast';

interface NewOkrPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewOkrPeriodModal: React.FC<NewOkrPeriodModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [periodId, setPeriodId] = useState('');
  const [periodName, setPeriodName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!periodId.trim() || !periodName.trim()) {
      toast.error('周期ID和名称均不能为空！');
      return;
    }
    setIsCreating(true);
    try {
      await api.createOkrSet({ periodId, periodName });
      toast.success('新周期已创建！');
      onSuccess();
      onClose();
      setPeriodId('');
      setPeriodName('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error === 'periodId already exists'
        ? '该周期ID已存在，请使用不同的ID。'
        : '创建失败，请重试。';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="创建新OKR周期">
      <div className="space-y-4">
        <div>
          <label htmlFor="periodId" className="block text-sm font-medium text-gray-700">
            周期 ID (例如: 2026-H1)
          </label>
          <input
            type="text"
            id="periodId"
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="periodName" className="block text-sm font-medium text-gray-700">
            周期名称 (例如: 2026上半年)
          </label>
          <input
            type="text"
            id="periodName"
            value={periodName}
            onChange={(e) => setPeriodName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
          取消
        </button>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isCreating ? '创建中...' : '创建'}
        </button>
      </div>
    </Modal>
  );
};

export default NewOkrPeriodModal;