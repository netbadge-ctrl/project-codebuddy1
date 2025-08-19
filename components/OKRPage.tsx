import React, { useState, useMemo } from 'react';
import { OKR, KeyResult } from '../types';
import { IconTrash, IconPlus, IconSearch } from './Icons';
import { fuzzySearch } from '../utils';

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
  isTextarea?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({ value, onSave, placeholder, isTextarea = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);

  const handleSave = () => {
    if (text.trim() !== value) {
      onSave(text.trim());
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTextarea) {
        handleSave();
    } else if (e.key === 'Escape') {
        setText(value);
        setIsEditing(false);
    }
  }

  if (isEditing) {
    const commonProps = {
      value: text,
      onChange: (e: any) => setText(e.target.value),
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      autoFocus: true,
      className: "w-full bg-white dark:bg-[#2d2d2d] border border-gray-300 dark:border-[#4a4a4a] rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]",
    };
    return isTextarea ? <textarea {...commonProps} rows={2} /> : <input type="text" {...commonProps} />;
  }

  return (
    <div onClick={() => setIsEditing(true)} className="w-full cursor-pointer p-1.5 -m-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#3a3a3a] min-h-[30px] whitespace-pre-wrap">
      {value || <span className="text-gray-500">{placeholder}</span>}
    </div>
  );
};


interface OKRPageProps {
  okrs: OKR[];
  onUpdateOkrs: (okrs: OKR[]) => void;
}

export const OKRPage: React.FC<OKRPageProps> = ({ okrs, onUpdateOkrs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpdate = (okrIndex: number, updatedOkr: Partial<OKR>) => {
    const newOkrs = [...okrs];
    newOkrs[okrIndex] = { ...newOkrs[okrIndex], ...updatedOkr };
    onUpdateOkrs(newOkrs);
  };
  
  const handleCommitChanges = (newOkrs: OKR[]) => {
      onUpdateOkrs(newOkrs);
  };

  const handleAddOkr = () => {
    const newOkr: OKR = {
      id: `okr_${Date.now()}`,
      objective: '新的目标',
      keyResults: [{ id: `kr_${Date.now()}`, description: '新的关键成果' }],
    };
    handleCommitChanges([...okrs, newOkr]);
  };

  const handleDeleteOkr = (okrIdToDelete: string) => {
    const okrToDelete = okrs.find(o => o.id === okrIdToDelete);
    if (!okrToDelete) return;
    
    if (window.confirm(`您确定要删除目标 "${okrToDelete.objective}" 吗？此操作无法撤销。`)) {
        const newOkrs = okrs.filter(okr => okr.id !== okrIdToDelete);
        handleCommitChanges(newOkrs);
    }
  };

  const handleAddKr = (okrId: string) => {
    const newKr: KeyResult = { id: `kr_${Date.now()}`, description: '新的关键成果' };
    const newOkrs = okrs.map(okr => {
        if(okr.id === okrId) {
            return {...okr, keyResults: [...okr.keyResults, newKr]}
        }
        return okr;
    });
    handleCommitChanges(newOkrs);
  };

  const handleDeleteKr = (okrId: string, krId: string) => {
    const okr = okrs.find(o => o.id === okrId);
    const kr = okr?.keyResults.find(k => k.id === krId);
    if (!kr) return;

    if (window.confirm(`您确定要删除关键成果 "${kr.description}" 吗？`)) {
        const newOkrs = okrs.map(o => {
            if (o.id === okrId) {
                return { ...o, keyResults: o.keyResults.filter(k => k.id !== krId) }
            }
            return o;
        })
        handleCommitChanges(newOkrs);
    }
  };

  const handleUpdateKr = (okrId: string, krId: string, updatedKr: Partial<KeyResult>) => {
    const newOkrs = okrs.map(okr => {
        if(okr.id === okrId) {
            return {
                ...okr,
                keyResults: okr.keyResults.map(kr => kr.id === krId ? {...kr, ...updatedKr} : kr)
            }
        }
        return okr;
    });
    handleCommitChanges(newOkrs);
  };
  
  const handleUpdateObjective = (okrId: string, objective: string) => {
     const newOkrs = okrs.map(okr => okr.id === okrId ? {...okr, objective} : okr);
     handleCommitChanges(newOkrs);
  };

  const filteredOkrs = useMemo(() => {
    if (!searchTerm) {
        return okrs;
    }
    return okrs.filter(okr => 
        fuzzySearch(searchTerm, okr.objective) ||
        okr.keyResults.some(kr => fuzzySearch(searchTerm, kr.description))
    );
  }, [okrs, searchTerm]);

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6 gap-4">
                    <div className="relative flex-grow">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="搜索目标或关键成果..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-[#2d2d2d] border border-gray-300 dark:border-[#4a4a4a] rounded-lg pl-10 pr-4 py-2 w-full text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                        />
                    </div>
                    <button onClick={handleAddOkr} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-[#6C63FF] text-white rounded-lg font-semibold text-sm hover:bg-[#5a52d9] transition-colors">
                        <IconPlus className="w-4 h-4"/>
                        <span>添加OKR</span>
                    </button>
                </div>
                <div className="space-y-6">
                    {filteredOkrs.map((okr) => (
                        <div key={okr.id} className="bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#363636] rounded-xl p-6">
                            <div className="flex justify-between items-start gap-4">
                               <div className="flex items-start gap-4 flex-grow">
                                  <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 mt-1 select-none">O{okrs.findIndex(o => o.id === okr.id) + 1}</span>
                                  <div className="flex-grow">
                                      <label className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">目标 (Objective)</label>
                                      <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                        <EditableField value={okr.objective} onSave={(val) => handleUpdateObjective(okr.id, val)} placeholder="输入目标"/>
                                      </div>
                                  </div>
                               </div>
                                <button onClick={() => handleDeleteOkr(okr.id)} className="p-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex-shrink-0" aria-label="删除OKR"><IconTrash className="w-5 h-5"/></button>
                            </div>
                            
                            <div className="mt-4 pl-12">
                                <label className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">关键成果 (Key Results)</label>
                                <div className="space-y-3 mt-2">
                                    {okr.keyResults.map((kr, krIndex) => (
                                        <div key={kr.id} className="flex items-start gap-3">
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 w-20 flex-shrink-0 pt-2 select-none">O{okrs.findIndex(o => o.id === okr.id) + 1}-KR{krIndex + 1}</span>
                                            <div className="flex-grow text-gray-700 dark:text-gray-300">
                                                <EditableField value={kr.description} onSave={(val) => handleUpdateKr(okr.id, kr.id, { description: val })} placeholder="输入关键成果" />
                                            </div>
                                            <button onClick={() => handleDeleteKr(okr.id, kr.id)} className="p-1 text-red-500/70 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" aria-label="删除KR"><IconTrash className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    <button onClick={() => handleAddKr(okr.id)} className="flex items-center gap-2 text-sm text-[#6C63FF] hover:text-[#5a52d9] dark:hover:text-white font-semibold py-1 px-2 rounded-md hover:bg-[#6c63ff]/10 dark:hover:bg-[#6c63ff2a]">
                                        <IconPlus className="w-4 h-4" />
                                        添加关键成果
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                     {filteredOkrs.length === 0 && (
                        <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                            没有匹配的OKR
                        </div>
                    )}
                </div>
            </div>
        </div>
    </main>
  );
};