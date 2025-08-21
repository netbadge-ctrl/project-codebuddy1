import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface KeyResult {
  id: string;
  description: string;
}

interface Objective {
  id: string;
  objective: string;
  keyResults: KeyResult[];
}

const OKRPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2025-H2');
  const [searchTerm, setSearchTerm] = useState('');
  const [okrData, setOkrData] = useState<Objective[]>([
    {
      id: 'O1',
      objective: '实现季度新用户增长30%，提升应用商店排名至前十',
      keyResults: [
        { id: 'O1-KR1', description: '完成3次线上市场推广活动' },
        { id: 'O1-KR2', description: '应用商店评分提升至4.8分' },
      ],
    },
    {
      id: 'O2',
      objective: '将支付成功率提升至99.5%，减少支付相关投诉均时长50%',
      keyResults: [
        { id: 'O2-KR1', description: '重构支付网关，减少技术故障率90%' },
      ],
    },
    {
      id: 'O3',
      objective: '新版后台上线，提升运营人员日均操作效率40%',
      keyResults: [
        { id: 'O3-KR1', description: '收集运营团队反馈，完成10项核心功能优化' },
        { id: 'O3-KR2', description: '新后台系统Bug率低于0.1%' },
      ],
    },
  ]);

  const [editingItem, setEditingItem] = useState<{type: 'objective' | 'kr', id: string} | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{type: 'objective' | 'kr', id: string, parentId?: string} | null>(null);

  // 生成下一个O编号
  const getNextObjectiveId = () => {
    const maxNum = okrData.reduce((max, okr) => {
      const num = parseInt(okr.id.replace('O', ''));
      return num > max ? num : max;
    }, 0);
    return `O${maxNum + 1}`;
  };

  // 生成下一个KR编号
  const getNextKRId = (objectiveId: string) => {
    const objective = okrData.find(o => o.id === objectiveId);
    if (!objective) return `${objectiveId}-KR1`;
    
    const maxNum = objective.keyResults.reduce((max, kr) => {
      const num = parseInt(kr.id.split('-KR')[1]);
      return num > max ? num : max;
    }, 0);
    return `${objectiveId}-KR${maxNum + 1}`;
  };

  // 添加新的OKR
  const addNewObjective = () => {
    const newId = getNextObjectiveId();
    const newObjective: Objective = {
      id: newId,
      objective: '新目标',
      keyResults: [
        { id: `${newId}-KR1`, description: '新关键成果' }
      ]
    };
    
    setOkrData([...okrData, newObjective]);
    setEditingItem({ type: 'objective', id: newId });
    
    // 滚动到新添加的内容
    setTimeout(() => {
      const element = document.getElementById(`objective-${newId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // 添加新的KR
  const addNewKR = (objectiveId: string) => {
    const newKRId = getNextKRId(objectiveId);
    const newKR: KeyResult = {
      id: newKRId,
      description: '新关键成果'
    };

    setOkrData(okrData.map(okr => 
      okr.id === objectiveId 
        ? { ...okr, keyResults: [...okr.keyResults, newKR] }
        : okr
    ));

    setEditingItem({ type: 'kr', id: newKRId });
    
    // 滚动到新添加的KR
    setTimeout(() => {
      const element = document.getElementById(`kr-${newKRId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // 更新目标
  const updateObjective = (id: string, newText: string) => {
    setOkrData(okrData.map(okr => 
      okr.id === id ? { ...okr, objective: newText } : okr
    ));
  };

  // 更新KR
  const updateKR = (krId: string, newText: string) => {
    setOkrData(okrData.map(okr => ({
      ...okr,
      keyResults: okr.keyResults.map(kr => 
        kr.id === krId ? { ...kr, description: newText } : kr
      )
    })));
  };

  // 删除目标
  const deleteObjective = (id: string) => {
    setOkrData(okrData.filter(okr => okr.id !== id));
    setDeleteDialog(null);
  };

  // 删除KR
  const deleteKR = (krId: string) => {
    setOkrData(okrData.map(okr => ({
      ...okr,
      keyResults: okr.keyResults.filter(kr => kr.id !== krId)
    })));
    setDeleteDialog(null);
  };

  // 编辑输入框组件
  const EditableText: React.FC<{
    text: string;
    isEditing: boolean;
    onSave: (text: string) => void;
    onStartEdit: () => void;
    className?: string;
    multiline?: boolean;
  }> = ({ text, isEditing, onSave, onStartEdit, className = '', multiline = false }) => {
    const [value, setValue] = useState(text);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    useEffect(() => {
      setValue(text);
    }, [text]);

    const handleBlur = () => {
      onSave(value);
      setEditingItem(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !multiline) {
        handleBlur();
      }
      if (e.key === 'Escape') {
        setValue(text);
        setEditingItem(null);
      }
    };

    if (isEditing) {
      if (multiline) {
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full p-2 border rounded resize-none ${className}`}
            rows={2}
          />
        );
      } else {
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full p-2 border rounded ${className}`}
          />
        );
      }
    }

    return (
      <div 
        onClick={onStartEdit}
        className={`cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors ${className}`}
      >
        {text}
      </div>
    );
  };

  // 过滤OKR数据
  const filteredOkrData = okrData.filter(okr => 
    okr.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
    okr.keyResults.some(kr => kr.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 简化的控制区 */}
      <div className="flex items-center justify-between mb-6">
        {/* 周期选择 */}
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-H1">2025上半年</SelectItem>
            <SelectItem value="2025-H2">2025下半年</SelectItem>
            <SelectItem value="2024-H2">2024下半年</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索 OKR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={addNewObjective}
          >
            <Plus className="w-4 h-4 mr-2" />
            添加 OKR
          </Button>
        </div>
      </div>

      {/* OKR列表 */}
      <div className="space-y-6">
        {filteredOkrData.map((okr) => (
          <Card key={okr.id} className="bg-white" id={`objective-${okr.id}`}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* 目标 - 编号与内容合并为单行 */}
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium mt-1">
                    {okr.id}
                  </span>
                  <div className="flex-1">
                    <EditableText
                      text={okr.objective}
                      isEditing={editingItem?.type === 'objective' && editingItem.id === okr.id}
                      onSave={(text) => updateObjective(okr.id, text)}
                      onStartEdit={() => setEditingItem({ type: 'objective', id: okr.id })}
                      className="text-lg font-semibold text-gray-900"
                      multiline
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setDeleteDialog({ type: 'objective', id: okr.id })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* 关键成果列表 */}
                <div className="space-y-3 ml-8">
                  {okr.keyResults.map((kr) => (
                    <div key={kr.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg" id={`kr-${kr.id}`}>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium mt-1">
                        {kr.id}
                      </span>
                      <div className="flex-1">
                        <EditableText
                          text={kr.description}
                          isEditing={editingItem?.type === 'kr' && editingItem.id === kr.id}
                          onSave={(text) => updateKR(kr.id, text)}
                          onStartEdit={() => setEditingItem({ type: 'kr', id: kr.id })}
                          className="text-gray-700"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteDialog({ type: 'kr', id: kr.id, parentId: okr.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* 添加KR按钮 */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addNewKR(okr.id)}
                    className="ml-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加关键成果
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog?.type === 'objective' 
                ? '确定要删除这个目标吗？删除后将同时删除其下所有关键成果，此操作不可撤销。'
                : '确定要删除这个关键成果吗？此操作不可撤销。'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog?.type === 'objective') {
                  deleteObjective(deleteDialog.id);
                } else if (deleteDialog?.type === 'kr') {
                  deleteKR(deleteDialog.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OKRPage;