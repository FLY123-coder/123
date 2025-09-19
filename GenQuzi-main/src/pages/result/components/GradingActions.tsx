import React from 'react';

interface Props {
  onPrint: () => void;
  onReset: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

/**
 * 批改结果操作按钮组件
 * 提供打印结果、保存试卷和重新开始按钮
 */
export const GradingActions: React.FC<Props> = ({
  onPrint,
  onReset,
  onSave,
  isSaving = false,
}) => {
  return (
    <div className='flex justify-between items-center mb-6'>
      <h2 className='text-2xl font-bold text-gray-900'>详细解析</h2>
      <div className='flex gap-3'>
        <button
          onClick={onPrint}
          className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50'
        >
          打印结果
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50'
        >
          {isSaving ? '保存中...' : '保存试卷'}
        </button>
        <button
          onClick={onReset}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
        >
          重新开始
        </button>
      </div>
    </div>
  );
};
